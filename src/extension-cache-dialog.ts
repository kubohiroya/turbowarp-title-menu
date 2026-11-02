import {isRecord, requireDocument, requireElement} from './dom';
import type {
  CachedDigestSummary,
  CachedProjectSummary,
  CacheReleaseResult,
  ExtensionCacheTotals
} from './extension-cache';

/**
 * The stage-mounted manager for cached extension bytes.
 *
 * Like the DSL file dialog, this owns presentation and interaction state only — which bucket is
 * expanded and which row is awaiting confirmation — while every cache operation is a
 * caller-supplied callback. That is what keeps this file free of any knowledge of how the Loader
 * stores anything.
 *
 * Two things the wording must not overstate, both of which the locale text carries:
 *
 * - **A bucket is a claim, not ownership.** Entries are keyed by the digest of their bytes, so
 *   releasing a project drops the digests that project named and may take bytes another project
 *   would have reused. It costs a re-fetch and nothing else, and the notice says exactly that.
 * - **A project URI is what the project called itself.** Nothing verifies it, so a project can
 *   file its bytes under another project's URI. Only the ledger is wrong if it does: the Loader
 *   re-checks SHA-256 on every hit, so a mislabelled bucket can still never hand over the wrong
 *   bytes. The notice states this the same way the DSL dialog and the security dialog state that
 *   an author's name is self-declared.
 *
 * The list is readable because each row shows the title beside the URI. The URI is an opaque UUID
 * path by design, so it is the title that tells an operator which project a row is.
 */
export interface ExtensionCacheDialogLocaleText {
  title: string;
  /** Why releasing is safe, and why neither the URI nor the bucket proves anything. */
  notice: string;
  /** Total line. `{entries}` and `{bytes}` are substituted. */
  total: string;
  /** Row label for the bucket that belongs to no one project. */
  shared: string;
  /** Row label when no host recorded a title for the URI. */
  untitled: string;
  /** `{entries}` is substituted. */
  entryCount: string;
  expand: string;
  collapse: string;
  release: string;
  confirmRelease: string;
  cancel: string;
  close: string;
  refresh: string;
  empty: string;
  /** Result line after a release. `{released}` and `{freed}` are substituted. */
  releaseResult: string;
  /** `{date}` is substituted. */
  lastUsed: string;
  /** `{bytes}` is substituted with the decompressed size of one digest. */
  originalSize: string;
}

export interface ExtensionCacheDialogOptions {
  document?: Document;
  mount?: HTMLElement;
  locales: Record<string, ExtensionCacheDialogLocaleText>;
  initialLocale?: string;
  listProjects(): Promise<readonly CachedProjectSummary[]>;
  listDigests(bucket: string): Promise<readonly CachedDigestSummary[]>;
  totals(): Promise<ExtensionCacheTotals>;
  onReleaseProject(bucket: string): CacheReleaseResult | Promise<CacheReleaseResult>;
  onReleaseDigest(bucket: string, key: string): CacheReleaseResult | Promise<CacheReleaseResult>;
  describeError?(error: unknown): string;
  formatSize?(byteLength: number): string;
  formatDate?(epochMilliseconds: number): string;
  onError?(error: unknown): void;
}

export interface ExtensionCacheDialog {
  readonly element: HTMLElement;
  readonly locale: string;
  readonly expanded: string | null;
  show(locale?: string): Promise<string>;
  hide(): void;
  refresh(): Promise<void>;
  setLocale(locale: string): string;
  dispose(): void;
}

/** How much of a digest is shown. Enough to tell two rows apart; the full value is the title. */
const digestPreviewLength = 12;

function requireLocales(value: unknown): Record<string, ExtensionCacheDialogLocaleText> {
  if (!isRecord(value) || Object.keys(value).length === 0) {
    throw new TypeError('locales must contain at least one locale');
  }
  return value as Record<string, ExtensionCacheDialogLocaleText>;
}

function textFor(
  locales: Record<string, ExtensionCacheDialogLocaleText>,
  locale: string
): ExtensionCacheDialogLocaleText {
  const text = locales[locale] ?? locales['en'] ?? Object.values(locales)[0];
  if (text === undefined) throw new TypeError('locales must contain at least one locale');
  return text;
}

/** Fills `{name}` placeholders, so a locale decides where a count or a size sits in a sentence. */
function fill(template: string, values: Readonly<Record<string, string>>): string {
  return template.replace(/\{(\w+)\}/g, (match, name: string) => values[name] ?? match);
}

function defaultFormatSize(byteLength: number): string {
  if (byteLength < 1024) return `${byteLength} B`;
  if (byteLength < 1024 * 1024) return `${(byteLength / 1024).toFixed(1)} KB`;
  return `${(byteLength / (1024 * 1024)).toFixed(1)} MB`;
}

function defaultFormatDate(epochMilliseconds: number): string {
  const parsed = new Date(epochMilliseconds);
  if (Number.isNaN(parsed.getTime())) return String(epochMilliseconds);
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${parsed.getFullYear()}-${pad(parsed.getMonth() + 1)}-${pad(parsed.getDate())} ${pad(parsed.getHours())}:${pad(parsed.getMinutes())}`;
}

function defaultDescribeError(error: unknown): string {
  if (error instanceof Error && error.message.length > 0) return error.message;
  return String(error);
}

export function createExtensionCacheDialog(
  options: ExtensionCacheDialogOptions
): ExtensionCacheDialog {
  if (!isRecord(options)) throw new TypeError('extension cache dialog options must be an object');
  const document = requireDocument(options.document ?? globalThis.document);
  const mount = requireElement(options.mount ?? document.body, 'mount');
  const locales = requireLocales(options.locales);
  const describeError = options.describeError ?? defaultDescribeError;
  const formatSize = options.formatSize ?? defaultFormatSize;
  const formatDate = options.formatDate ?? defaultFormatDate;

  let locale = options.initialLocale ?? 'en';
  let projects: readonly CachedProjectSummary[] = [];
  let totals: ExtensionCacheTotals = {entries: 0, bytes: 0};
  let expandedBucket: string | null = null;
  let digests: readonly CachedDigestSummary[] = [];
  let confirmingBucket: string | null = null;
  let confirmingDigest: string | null = null;
  let status = '';
  let result = '';
  /** Whether the list on screen came from a listing that finished. See `render`. */
  let listed = false;
  let disposed = false;

  const root = document.createElement('section');
  const panel = document.createElement('div');
  const heading = document.createElement('h1');
  const closeButton = document.createElement('button');
  const toolbar = document.createElement('div');
  const refreshButton = document.createElement('button');
  const totalElement = document.createElement('p');
  const noticeElement = document.createElement('p');
  const listElement = document.createElement('div');
  const resultElement = document.createElement('p');
  const statusElement = document.createElement('p');

  root.setAttribute('data-turbowarp-title-menu-extension-cache', 'true');
  root.style.cssText =
    'position:absolute;inset:0;z-index:2147483646;align-items:center;justify-content:center;padding:16px;box-sizing:border-box;background:rgba(0,0,0,.6);font-family:sans-serif;';
  // Visibility is the one property the dialog toggles, so it is set apart from the style sheet.
  root.style.display = 'none';
  panel.style.cssText =
    'width:min(760px,96%);max-height:90%;display:flex;flex-direction:column;gap:10px;padding:18px;box-sizing:border-box;background:#ffffff;color:#1b1f27;border-radius:10px;box-shadow:0 10px 36px rgba(0,0,0,.45);overflow:hidden;';
  heading.style.cssText = 'margin:0;font-size:20px;line-height:1.3;';
  toolbar.style.cssText = 'display:flex;gap:8px;align-items:center;flex-wrap:wrap;';
  totalElement.style.cssText = 'margin:0;font-size:13px;color:#1b1f27;';
  noticeElement.style.cssText =
    'margin:0;padding:8px 10px;font-size:12px;line-height:1.5;color:#45506a;background:#f2f4f8;border:1px solid #ccd2de;border-radius:8px;';
  listElement.style.cssText =
    'flex:1;min-height:0;overflow:auto;display:flex;flex-direction:column;gap:6px;';
  resultElement.style.cssText = 'margin:0;min-height:18px;font-size:13px;color:#1f6feb;';
  statusElement.style.cssText = 'margin:0;min-height:18px;font-size:13px;color:#8a1c1c;';

  const headerRow = document.createElement('div');
  headerRow.style.cssText = 'display:flex;align-items:center;justify-content:space-between;gap:8px;';
  headerRow.appendChild(heading);
  headerRow.appendChild(closeButton);
  panel.appendChild(headerRow);
  toolbar.appendChild(refreshButton);
  toolbar.appendChild(totalElement);
  panel.appendChild(toolbar);
  panel.appendChild(noticeElement);
  panel.appendChild(listElement);
  panel.appendChild(resultElement);
  panel.appendChild(statusElement);
  root.appendChild(panel);

  const previousMountPosition = mount.style.position;
  if (previousMountPosition === '' || previousMountPosition === 'static') {
    mount.style.position = 'relative';
  }
  mount.appendChild(root);

  function styleButton(button: HTMLElement, tone: 'primary' | 'plain' | 'danger' | 'active'): void {
    const palette = {
      primary: 'background:#1f6feb;color:#ffffff;border:1px solid #1f6feb;',
      plain: 'background:#f2f4f8;color:#1b1f27;border:1px solid #ccd2de;',
      danger: 'background:#b42318;color:#ffffff;border:1px solid #b42318;',
      active: 'background:#d7e6ff;color:#0b3a82;border:1px solid #1f6feb;'
    }[tone];
    button.style.cssText = `${palette}padding:5px 10px;border-radius:6px;font-size:13px;cursor:pointer;`;
  }

  function createButton(
    label: string,
    tone: Parameters<typeof styleButton>[1],
    onClick: () => void
  ): HTMLElement {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = label;
    styleButton(button, tone);
    button.addEventListener('click', onClick);
    return button;
  }

  function run(operation: () => unknown | Promise<unknown>): void {
    try {
      Promise.resolve(operation()).catch(handleFailure);
    } catch (error) {
      handleFailure(error);
    }
  }

  function handleFailure(error: unknown): void {
    status = describeError(error);
    options.onError?.(error);
    render();
  }

  /** Every release goes through here, so the list, the total, and the status stay in step. */
  function release(operation: () => CacheReleaseResult | Promise<CacheReleaseResult>): void {
    run(async () => {
      status = '';
      try {
        const released = await operation();
        result = fill(textFor(locales, locale).releaseResult, {
          released: String(released.released),
          freed: formatSize(released.freed)
        });
      } catch (error) {
        handleFailure(error);
        return;
      }
      await reload();
    });
  }

  /**
   * Reloads the whole screen.
   *
   * The expanded bucket is re-listed rather than filtered out of a stale list, because releasing
   * a digest from one bucket can remove bytes a second bucket claimed, which changes totals the
   * dialog never asked about. Asking again is cheap; guessing would be wrong.
   */
  async function reload(): Promise<void> {
    if (disposed) return;
    // Cleared first so that a failure below cannot leave the panel claiming the cache is empty.
    listed = false;
    projects = await options.listProjects();
    totals = await options.totals();
    if (expandedBucket !== null && !projects.some((entry) => entry.bucket === expandedBucket)) {
      // The bucket was released entirely, so there is nothing left to expand.
      expandedBucket = null;
    }
    digests = expandedBucket === null ? [] : await options.listDigests(expandedBucket);
    listed = true;
    render();
  }

  /**
   * Reloads without letting the failure escape.
   *
   * A listing that failed must not leave the panel showing an empty list: "nothing is cached" and
   * "the cache could not be read" are different claims, and only one of them is true. So the
   * status line carries the failure while the panel stays open, instead of the promise rejecting
   * into a caller that has no way to say so on screen.
   */
  async function reloadSafely(): Promise<void> {
    try {
      await reload();
    } catch (error) {
      handleFailure(error);
    }
  }

  function toggleExpanded(bucket: string): void {
    expandedBucket = expandedBucket === bucket ? null : bucket;
    confirmingBucket = null;
    confirmingDigest = null;
    run(() => reload());
  }

  function renderDigestRow(
    digest: CachedDigestSummary,
    bucket: string,
    text: ExtensionCacheDialogLocaleText
  ): HTMLElement {
    const row = document.createElement('div');
    row.setAttribute('data-cache-digest', digest.key);
    row.style.cssText =
      'display:flex;align-items:center;gap:8px;padding:6px 8px;margin-left:18px;border:1px solid #eef1f6;border-radius:6px;';

    const key = document.createElement('span');
    key.textContent = `${digest.key.slice(0, digestPreviewLength)}…`;
    // The digest is the whole name of the bytes, so the full value stays available on hover.
    key.setAttribute('title', digest.key);
    key.style.cssText =
      'flex:1;min-width:0;font-family:monospace;font-size:12px;color:#1b1f27;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;';
    const used = document.createElement('span');
    used.textContent = fill(text.lastUsed, {date: formatDate(digest.lastAccess)});
    used.style.cssText = 'font-size:12px;color:#5a6172;white-space:nowrap;';
    const size = document.createElement('span');
    size.textContent = formatSize(digest.bytes);
    size.setAttribute('title', fill(text.originalSize, {bytes: formatSize(digest.originalBytes)}));
    size.style.cssText =
      'font-size:12px;color:#5a6172;white-space:nowrap;min-width:64px;text-align:right;';
    row.appendChild(key);
    row.appendChild(used);
    row.appendChild(size);

    if (confirmingDigest === digest.key) {
      row.appendChild(
        createButton(text.confirmRelease, 'danger', () => {
          confirmingDigest = null;
          release(() => options.onReleaseDigest(bucket, digest.key));
        })
      );
      row.appendChild(
        createButton(text.cancel, 'plain', () => {
          confirmingDigest = null;
          render();
        })
      );
      return row;
    }

    row.appendChild(
      createButton(text.release, 'plain', () => {
        confirmingDigest = digest.key;
        confirmingBucket = null;
        render();
      })
    );
    return row;
  }

  function renderProjectRow(
    project: CachedProjectSummary,
    text: ExtensionCacheDialogLocaleText
  ): HTMLElement {
    const row = document.createElement('div');
    row.setAttribute('data-cache-bucket', project.bucket);
    row.style.cssText =
      'display:flex;align-items:center;gap:8px;padding:8px;border:1px solid #e2e6ee;border-radius:8px;';

    const names = document.createElement('div');
    names.style.cssText = 'flex:1;min-width:0;display:flex;flex-direction:column;gap:2px;';
    const title = document.createElement('span');
    // The shared bucket is not a project and carries no URI, so it is named by the locale alone.
    title.textContent = project.shared ? text.shared : (project.title ?? text.untitled);
    title.style.cssText =
      'font-size:14px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;';
    names.appendChild(title);
    if (!project.shared) {
      const uri = document.createElement('span');
      uri.textContent = project.bucket;
      uri.setAttribute('title', project.bucket);
      uri.style.cssText =
        'font-size:11px;font-family:monospace;color:#5a6172;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;';
      names.appendChild(uri);
    }
    row.appendChild(names);

    const count = document.createElement('span');
    count.textContent = fill(text.entryCount, {entries: String(project.entries)});
    count.style.cssText = 'font-size:12px;color:#5a6172;white-space:nowrap;';
    const size = document.createElement('span');
    size.textContent = formatSize(project.bytes);
    size.style.cssText =
      'font-size:12px;color:#5a6172;white-space:nowrap;min-width:64px;text-align:right;';
    row.appendChild(count);
    row.appendChild(size);

    const expanded = expandedBucket === project.bucket;
    const expandButton = createButton(
      expanded ? text.collapse : text.expand,
      expanded ? 'active' : 'primary',
      () => toggleExpanded(project.bucket)
    );
    expandButton.setAttribute('data-cache-expand', project.bucket);
    expandButton.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    row.appendChild(expandButton);

    if (confirmingBucket === project.bucket) {
      row.appendChild(
        createButton(text.confirmRelease, 'danger', () => {
          confirmingBucket = null;
          release(() => options.onReleaseProject(project.bucket));
        })
      );
      row.appendChild(
        createButton(text.cancel, 'plain', () => {
          confirmingBucket = null;
          render();
        })
      );
      return row;
    }

    row.appendChild(
      createButton(text.release, 'plain', () => {
        confirmingBucket = project.bucket;
        confirmingDigest = null;
        render();
      })
    );
    return row;
  }

  function render(): void {
    if (disposed) return;
    const text = textFor(locales, locale);
    heading.textContent = text.title;
    closeButton.textContent = text.close;
    closeButton.setAttribute('aria-label', text.close);
    refreshButton.textContent = text.refresh;
    noticeElement.textContent = text.notice;
    totalElement.textContent = fill(text.total, {
      entries: String(totals.entries),
      bytes: formatSize(totals.bytes)
    });
    resultElement.textContent = result;
    statusElement.textContent = status;

    listElement.replaceChildren();
    if (projects.length === 0) {
      // "Nothing is cached" and "the cache could not be read" are different claims, and only one
      // of them is ever true. A failed listing shows the status line alone rather than the second
      // dressed as the first, because the first invites an operator to stop looking.
      if (!listed) return;
      const empty = document.createElement('p');
      empty.textContent = text.empty;
      empty.style.cssText = 'margin:8px 0;font-size:14px;color:#5a6172;';
      listElement.appendChild(empty);
      return;
    }
    for (const project of projects) {
      listElement.appendChild(renderProjectRow(project, text));
      if (expandedBucket !== project.bucket) continue;
      for (const digest of digests) {
        listElement.appendChild(renderDigestRow(digest, project.bucket, text));
      }
    }
  }

  styleButton(closeButton, 'plain');
  styleButton(refreshButton, 'primary');
  closeButton.type = 'button';
  refreshButton.type = 'button';
  closeButton.addEventListener('click', () => hide());
  refreshButton.addEventListener('click', () => {
    result = '';
    status = '';
    run(() => reload());
  });

  function hide(): void {
    if (disposed) return;
    confirmingBucket = null;
    confirmingDigest = null;
    root.style.display = 'none';
  }

  function ensureActive(): void {
    if (disposed) throw new TypeError('extension cache dialog is disposed');
  }

  render();

  return Object.freeze({
    element: root,
    get locale() {
      return locale;
    },
    get expanded() {
      return expandedBucket;
    },
    async show(nextLocale?: string) {
      ensureActive();
      if (nextLocale !== undefined) locale = nextLocale;
      status = '';
      result = '';
      root.style.display = 'flex';
      await reloadSafely();
      return locale;
    },
    hide,
    async refresh() {
      ensureActive();
      await reload();
    },
    setLocale(nextLocale: string) {
      ensureActive();
      locale = nextLocale;
      render();
      return locale;
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      root.remove();
      if (previousMountPosition === '' || previousMountPosition === 'static') {
        mount.style.position = previousMountPosition;
      }
    }
  });
}
