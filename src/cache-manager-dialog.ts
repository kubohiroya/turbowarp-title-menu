// SPDX-License-Identifier: MPL-2.0
import {isRecord, requireDocument, requireElement} from './dom.js';
import {
  cacheAssetTotals,
  cacheClaimsFor,
  estimateCacheRelease,
  pruneCacheSelection,
  queryCacheAssets,
  type CacheAssetQuery,
  type CacheAssetRow,
  type CacheAssetSortColumn,
  type CacheAssetSortDirection
} from './cache-asset-model.js';
import type {CacheReleaseResult} from './extension-cache.js';

/**
 * The cache manager: a table of every use of every cached copy, with search, filters, sorting,
 * selection and release.
 *
 * Like the other dialogs here it owns presentation only. Listing and releasing are callbacks, so a
 * host decides what store sits behind them; title-menu passes its Loader-backed cache, and the
 * Editor passes the same. What a selection would free is estimated from the list on screen and
 * shown before asking; what a release actually did is what the callback reports, shown after.
 */
export interface CacheManagerLocaleText {
  title: string;
  /** What releasing does and does not mean: a re-fetch, offline use, and self-declared names. */
  notice: string;
  search: string;
  kindFilter: string;
  kindAll: string;
  kinds: Record<'costume' | 'backdrop' | 'sound' | 'document' | 'extension' | 'other' | 'unknown', string>;
  projectFilter: string;
  projectAll: string;
  shared: string;
  untitled: string;
  unnamed: string;
  columns: Record<'select' | 'name' | 'kind' | 'project' | 'size' | 'lastAccess', string>;
  /** `{entries}`, `{bytes}` and `{uses}` are substituted. */
  total: string;
  /** `{shown}` and `{uses}` are substituted. */
  shown: string;
  /** `{count}` is substituted. */
  selectShown: string;
  /** `{count}` is substituted. */
  selectAll: string;
  clearSelection: string;
  /** `{uses}`, `{bytes}` and `{kept}` are substituted. */
  selection: string;
  release: string;
  /** `{uses}` is substituted. */
  confirmRelease: string;
  cancel: string;
  close: string;
  refresh: string;
  loading: string;
  empty: string;
  noMatches: string;
  /** `{released}`, `{requested}` and `{freed}` are substituted. */
  releaseResult: string;
  /** `{missing}` is substituted: uses that were already gone when the release ran. */
  releaseStale: string;
  /** `{uses}` is substituted. */
  sharedBy: string;
  redacted: string;
  /** `{key}` is substituted. */
  digest: string;
  /** What embedding does: it changes the open project, unsaved, and keeps the address. */
  embedNotice: string;
  embedFormat: string;
  embedFormats: Record<CacheEmbedFormat, string>;
  /** `{uses}` is substituted: selected uses of the project open in the host. */
  embed: string;
  /** `{uses}` is substituted. */
  embedAndRelease: string;
  /** `{uses}` is substituted: selected uses that belong to other projects. */
  embedOtherProjects: string;
  /** `{embedded}` and `{requested}` are substituted. */
  embedResult: string;
  /** `{count}` and `{reasons}` are substituted. */
  embedSkipped: string;
  embedSkipReasons: Record<CacheEmbedSkipReason, string>;
  /** Shown while the release waits for the project to be saved. */
  embedReleasePending: string;
  /** `{released}`, `{freed}` and `{kept}` are substituted. */
  embedReleaseResult: string;
}

export type CacheEmbedFormat = 'embedded-data' | 'embedded-file';
export type CacheEmbedSkipReason = 'not-in-project' | 'changed' | 'unsupported';

/** What the host reports after embedding selected copies into its open project. */
export interface CacheEmbedOutcome {
  readonly embedded: number;
  readonly skipped: readonly {readonly key: string; readonly reason: CacheEmbedSkipReason}[];
  /**
   * Present when a release was asked for: it settles once the host saw the project saved and
   * released that project's claims, with how many it kept (other projects and the shared area
   * always stay). It never settles if the project is not saved.
   */
  readonly released?: Promise<CacheReleaseResult & {readonly kept: number}>;
}

/**
 * Embedding into the project the host has open. The dialog never decides which references
 * change: it passes digests of rows filed under the open project, and the host embeds only what
 * that project pins with the same digest, reporting the rest.
 */
export interface CacheEmbeddingHost {
  /** The bucket the open project's rows are filed under, or undefined when it has none. */
  currentBucket(): string | undefined;
  embed(keys: readonly string[], options: {format: CacheEmbedFormat; release: boolean}): Promise<CacheEmbedOutcome>;
}

export interface CacheManagerDialogOptions {
  document?: Document;
  mount?: HTMLElement;
  locales: Record<string, CacheManagerLocaleText>;
  initialLocale?: string;
  listAssets(): Promise<readonly CacheAssetRow[]>;
  onRelease(claims: readonly {bucket: string; key: string}[]): CacheReleaseResult | Promise<CacheReleaseResult>;
  /** Offered only when the host has an open project to embed into. */
  embedding?: CacheEmbeddingHost;
  /** `auto` follows the browser; a host with its own theme passes `light` or `dark`. */
  colorScheme?: 'light' | 'dark' | 'auto';
  describeError?(error: unknown): string;
  formatSize?(byteLength: number): string;
  formatDate?(epochMilliseconds: number): string;
  onError?(error: unknown): void;
}

export type CacheManagerPhase = 'idle' | 'loading' | 'ready' | 'error';

export interface CacheManagerDialog {
  readonly element: HTMLElement;
  readonly locale: string;
  readonly phase: CacheManagerPhase;
  readonly selected: ReadonlySet<string>;
  show(locale?: string): Promise<string>;
  hide(): void;
  refresh(): Promise<void>;
  setLocale(locale: string): string;
  setColorScheme(scheme: 'light' | 'dark' | 'auto'): void;
  dispose(): void;
}

const rootAttribute = 'data-turbowarp-title-menu-cache-manager';
const kindKeys = ['costume', 'backdrop', 'sound', 'document', 'extension', 'other', 'unknown'] as const;
const sortColumns: readonly CacheAssetSortColumn[] = ['name', 'kind', 'project', 'size', 'lastAccess'];

/** Colors as variables, so one sheet serves both schemes and `auto` can follow the browser. */
const styleSheet = `
[${rootAttribute}]{--tm-bg:#fff;--tm-fg:#1b1f27;--tm-muted:#5a6172;--tm-line:#e2e6ee;--tm-soft:#f2f4f8;--tm-accent:#1f6feb;--tm-danger:#b42318;--tm-error:#8a1c1c;--tm-selected:#e8f0ff}
[${rootAttribute}][data-color-scheme=dark]{--tm-bg:#1d2129;--tm-fg:#e6e9ef;--tm-muted:#a3abbd;--tm-line:#363c49;--tm-soft:#272c36;--tm-accent:#6ea8ff;--tm-danger:#f97066;--tm-error:#ffb4ab;--tm-selected:#23324d}
@media (prefers-color-scheme: dark){[${rootAttribute}][data-color-scheme=auto]{--tm-bg:#1d2129;--tm-fg:#e6e9ef;--tm-muted:#a3abbd;--tm-line:#363c49;--tm-soft:#272c36;--tm-accent:#6ea8ff;--tm-danger:#f97066;--tm-error:#ffb4ab;--tm-selected:#23324d}}
[${rootAttribute}] button,[${rootAttribute}] input,[${rootAttribute}] select{font:inherit;color:var(--tm-fg);background:var(--tm-soft);border:1px solid var(--tm-line);border-radius:6px;padding:4px 8px}
[${rootAttribute}] button:focus-visible,[${rootAttribute}] input:focus-visible,[${rootAttribute}] select:focus-visible{outline:2px solid var(--tm-accent);outline-offset:1px}
[${rootAttribute}] button[data-tone=danger]{background:var(--tm-danger);border-color:var(--tm-danger);color:#fff}
[${rootAttribute}] button[disabled]{opacity:.5;cursor:default}
[${rootAttribute}] table{width:100%;border-collapse:collapse;font-size:13px}
[${rootAttribute}] th,[${rootAttribute}] td{padding:5px 6px;border-bottom:1px solid var(--tm-line);text-align:left;vertical-align:top}
[${rootAttribute}] th button{border:none;background:none;padding:0;font-weight:600;cursor:pointer}
[${rootAttribute}] tr[aria-selected=true]{background:var(--tm-selected)}
[${rootAttribute}] .tm-muted{color:var(--tm-muted);font-size:12px}
[${rootAttribute}] .tm-mono{font-family:monospace;font-size:11px;overflow-wrap:anywhere}
`;

function requireLocales(value: unknown): Record<string, CacheManagerLocaleText> {
  if (!isRecord(value) || Object.keys(value).length === 0) throw new TypeError('locales must contain at least one locale');
  return value as Record<string, CacheManagerLocaleText>;
}

function textFor(locales: Record<string, CacheManagerLocaleText>, locale: string): CacheManagerLocaleText {
  const text = locales[locale] ?? locales['en'] ?? Object.values(locales)[0];
  if (text === undefined) throw new TypeError('locales must contain at least one locale');
  return text;
}

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
  return error instanceof Error && error.message.length > 0 ? error.message : String(error);
}

export function createCacheManagerDialog(options: CacheManagerDialogOptions): CacheManagerDialog {
  if (!isRecord(options)) throw new TypeError('cache manager dialog options must be an object');
  const document = requireDocument(options.document ?? globalThis.document);
  const mount = requireElement(options.mount ?? document.body, 'mount');
  const locales = requireLocales(options.locales);
  const describeError = options.describeError ?? defaultDescribeError;
  const formatSize = options.formatSize ?? defaultFormatSize;
  const formatDate = options.formatDate ?? defaultFormatDate;

  let locale = options.initialLocale ?? 'en';
  let phase: CacheManagerPhase = 'idle';
  let rows: readonly CacheAssetRow[] = [];
  let selected = new Set<string>();
  let query: {text: string; kind?: CacheAssetQuery['kind']; bucket?: string; sort: CacheAssetSortColumn; direction: CacheAssetSortDirection} = {
    text: '',
    sort: 'lastAccess',
    direction: 'descending'
  };
  let confirming = false;
  let embedFormat: CacheEmbedFormat = 'embedded-file';
  let busy = false;
  let status = '';
  let result = '';
  let generation = 0;
  let disposed = false;

  const root = document.createElement('section');
  root.setAttribute(rootAttribute, 'true');
  root.setAttribute('data-color-scheme', options.colorScheme ?? 'auto');
  root.setAttribute('role', 'dialog');
  root.setAttribute('aria-modal', 'true');
  root.style.cssText =
    'position:absolute;inset:0;z-index:2147483646;align-items:center;justify-content:center;padding:16px;box-sizing:border-box;background:rgba(0,0,0,.6);font-family:sans-serif;';
  root.style.display = 'none';
  const style = document.createElement('style');
  style.textContent = styleSheet;
  const panel = document.createElement('div');
  panel.style.cssText =
    'width:min(980px,98%);max-height:92%;display:flex;flex-direction:column;gap:8px;padding:16px;box-sizing:border-box;background:var(--tm-bg);color:var(--tm-fg);border-radius:10px;box-shadow:0 10px 36px rgba(0,0,0,.45);overflow:hidden;';
  const header = document.createElement('div');
  header.style.cssText = 'display:flex;align-items:center;justify-content:space-between;gap:8px;';
  const heading = document.createElement('h1');
  heading.style.cssText = 'margin:0;font-size:20px;';
  heading.setAttribute('id', 'tm-cache-manager-title');
  root.setAttribute('aria-labelledby', 'tm-cache-manager-title');
  const closeButton = document.createElement('button');
  closeButton.type = 'button';
  const notice = document.createElement('p');
  notice.className = 'tm-muted';
  notice.style.cssText = 'margin:0;line-height:1.5;';
  const filters = document.createElement('div');
  filters.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap;align-items:center;';
  const searchInput = document.createElement('input');
  searchInput.type = 'search';
  searchInput.setAttribute('data-cache-search', 'true');
  const kindSelect = document.createElement('select');
  kindSelect.setAttribute('data-cache-kind', 'true');
  const projectSelect = document.createElement('select');
  projectSelect.setAttribute('data-cache-project', 'true');
  const refreshButton = document.createElement('button');
  refreshButton.type = 'button';
  const summary = document.createElement('p');
  summary.style.cssText = 'margin:0;font-size:13px;';
  summary.setAttribute('data-cache-summary', 'true');
  const selectionBar = document.createElement('div');
  selectionBar.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap;align-items:center;';
  const tableBox = document.createElement('div');
  tableBox.style.cssText = 'flex:1;min-height:0;overflow:auto;';
  const resultLine = document.createElement('p');
  resultLine.setAttribute('role', 'status');
  resultLine.style.cssText = 'margin:0;min-height:18px;font-size:13px;color:var(--tm-accent);';
  const statusLine = document.createElement('p');
  statusLine.setAttribute('role', 'alert');
  statusLine.style.cssText = 'margin:0;min-height:18px;font-size:13px;color:var(--tm-error);';

  header.append(heading, closeButton);
  filters.append(searchInput, kindSelect, projectSelect, refreshButton);
  panel.append(header, notice, filters, summary, selectionBar, tableBox, resultLine, statusLine);
  root.append(style, panel);
  const previousMountPosition = mount.style.position;
  if (previousMountPosition === '' || previousMountPosition === 'static') mount.style.position = 'relative';
  mount.appendChild(root);

  function element<K extends keyof HTMLElementTagNameMap>(tag: K, text = ''): HTMLElementTagNameMap[K] {
    const created = document.createElement(tag);
    if (text) created.textContent = text;
    return created;
  }

  function button(label: string, onClick: () => void, attributes: Record<string, string> = {}): HTMLButtonElement {
    const created = element('button', label);
    created.type = 'button';
    created.disabled = busy;
    for (const [name, value] of Object.entries(attributes)) created.setAttribute(name, value);
    created.addEventListener('click', onClick);
    return created;
  }

  function option(value: string, label: string, current: string | undefined): HTMLOptionElement {
    const created = element('option', label);
    created.value = value;
    created.setAttribute('value', value);
    if (value === (current ?? '')) created.setAttribute('selected', 'true');
    return created;
  }

  function fail(error: unknown): void {
    status = describeError(error);
    options.onError?.(error);
    render();
  }

  const visible = () =>
    queryCacheAssets(rows, {
      text: query.text,
      ...(query.kind ? {kind: query.kind} : {}),
      ...(query.bucket !== undefined ? {bucket: query.bucket} : {}),
      sort: query.sort,
      direction: query.direction
    });

  /**
   * Lists again. Only the newest listing is shown, so a slow listing that finishes after a newer
   * one cannot put old rows back. A failure is shown as a failure, never as an empty cache.
   */
  async function reload(): Promise<void> {
    if (disposed) return;
    const mine = ++generation;
    phase = 'loading';
    confirming = false;
    render();
    try {
      const listed = await options.listAssets();
      if (mine !== generation || disposed) return;
      rows = listed;
      selected = pruneCacheSelection(rows, selected);
      phase = 'ready';
    } catch (error) {
      if (mine !== generation || disposed) return;
      phase = 'error';
      rows = [];
      selected = new Set();
      fail(error);
      return;
    }
    render();
  }

  async function releaseSelected(): Promise<void> {
    const claims = cacheClaimsFor(rows, selected);
    if (!claims.length) return;
    busy = true;
    confirming = false;
    status = '';
    render();
    try {
      const done = await options.onRelease(claims);
      const text = textFor(locales, locale);
      result = fill(text.releaseResult, {
        released: String(done.released),
        requested: String(claims.length),
        freed: formatSize(done.freed)
      });
      // The list may have been stale: another tab or an eviction can release first.
      if (done.released < claims.length)
        result += ` ${fill(text.releaseStale, {missing: String(claims.length - done.released)})}`;
      selected = new Set();
    } catch (error) {
      fail(error);
    } finally {
      busy = false;
    }
    await reload();
  }

  /** Selected rows filed under the open project, and how many selected rows are not. */
  function embeddable(): {keys: string[]; uses: number; others: number} {
    const bucket = options.embedding?.currentBucket();
    const chosen = rows.filter((row) => selected.has(row.id));
    const mine = bucket === undefined ? [] : chosen.filter((row) => row.bucket === bucket);
    return {keys: [...new Set(mine.map((row) => row.key))], uses: mine.length, others: chosen.length - mine.length};
  }

  async function embedSelected(release: boolean): Promise<void> {
    const embedding = options.embedding;
    const {keys} = embeddable();
    if (!embedding || !keys.length) return;
    busy = true;
    confirming = false;
    status = '';
    render();
    try {
      const done = await embedding.embed(keys, {format: embedFormat, release});
      const text = textFor(locales, locale);
      result = fill(text.embedResult, {embedded: String(done.embedded), requested: String(keys.length)});
      if (done.skipped.length) {
        const reasons = [...new Set(done.skipped.map((skip) => text.embedSkipReasons[skip.reason] ?? skip.reason))].join(', ');
        result += ` ${fill(text.embedSkipped, {count: String(done.skipped.length), reasons})}`;
      }
      if (done.released) {
        result += ` ${text.embedReleasePending}`;
        void done.released.then(
          async (outcome) => {
            if (disposed) return;
            const later = textFor(locales, locale);
            result = fill(later.embedReleaseResult, {
              released: String(outcome.released),
              freed: formatSize(outcome.freed),
              kept: String(outcome.kept)
            });
            await reload();
          },
          (error: unknown) => {
            if (!disposed) fail(error);
          }
        );
      }
      selected = new Set();
    } catch (error) {
      fail(error);
    } finally {
      busy = false;
    }
    await reload();
  }

  function renderEmbedding(text: CacheManagerLocaleText): void {
    if (!options.embedding) return;
    const {uses, others} = embeddable();
    if (uses > 0) {
      const select = element('select');
      select.setAttribute('data-cache-embed-format', 'true');
      select.setAttribute('aria-label', text.embedFormat);
      select.disabled = busy;
      for (const format of ['embedded-file', 'embedded-data'] as const) select.appendChild(option(format, text.embedFormats[format], embedFormat));
      select.value = embedFormat;
      select.addEventListener('change', () => {
        embedFormat = select.value === 'embedded-data' ? 'embedded-data' : 'embedded-file';
      });
      selectionBar.append(
        select,
        button(fill(text.embed, {uses: String(uses)}), () => void embedSelected(false), {'data-cache-embed': 'true'}),
        button(fill(text.embedAndRelease, {uses: String(uses)}), () => void embedSelected(true), {'data-cache-embed-release': 'true'})
      );
    }
    if (others > 0) {
      const line = element('span', fill(text.embedOtherProjects, {uses: String(others)}));
      line.className = 'tm-muted';
      line.setAttribute('data-cache-embed-others', 'true');
      selectionBar.appendChild(line);
    }
    if (uses > 0) {
      const line = element('span', text.embedNotice);
      line.className = 'tm-muted';
      selectionBar.appendChild(line);
    }
  }

  function setSort(column: CacheAssetSortColumn): void {
    query =
      query.sort === column
        ? {...query, direction: query.direction === 'ascending' ? 'descending' : 'ascending'}
        : {...query, sort: column, direction: column === 'size' || column === 'lastAccess' ? 'descending' : 'ascending'};
    render();
  }

  function renderTable(text: CacheManagerLocaleText, shown: readonly CacheAssetRow[]): void {
    tableBox.replaceChildren();
    if (phase === 'loading' && rows.length === 0) {
      tableBox.appendChild(element('p', text.loading));
      return;
    }
    if (phase === 'error' || phase === 'idle') return;
    if (rows.length === 0) {
      tableBox.appendChild(element('p', text.empty));
      return;
    }
    if (shown.length === 0) {
      tableBox.appendChild(element('p', text.noMatches));
      return;
    }
    const table = element('table');
    const head = element('thead');
    const headRow = element('tr');
    const selectHeader = element('th', text.columns.select);
    headRow.appendChild(selectHeader);
    for (const column of sortColumns) {
      const cell = element('th');
      const sorted = query.sort === column;
      cell.setAttribute('aria-sort', sorted ? query.direction : 'none');
      cell.appendChild(
        button(`${text.columns[column]}${sorted ? (query.direction === 'ascending' ? ' ▲' : ' ▼') : ''}`, () => setSort(column), {
          'data-cache-sort': column
        })
      );
      headRow.appendChild(cell);
    }
    head.appendChild(headRow);
    const body = element('tbody');
    for (const row of shown) {
      const tr = element('tr');
      tr.setAttribute('data-cache-row', row.id);
      tr.setAttribute('aria-selected', selected.has(row.id) ? 'true' : 'false');
      const check = element('input');
      check.type = 'checkbox';
      check.checked = selected.has(row.id);
      check.disabled = busy;
      check.setAttribute('data-cache-select', row.id);
      check.setAttribute('aria-label', row.names[0] ?? row.key);
      check.addEventListener('change', () => {
        const next = new Set(selected);
        if (next.has(row.id)) next.delete(row.id);
        else next.add(row.id);
        selected = next;
        confirming = false;
        render();
      });
      const checkCell = element('td');
      checkCell.appendChild(check);

      const nameCell = element('td');
      nameCell.appendChild(element('div', row.names.length ? row.names.join(', ') : text.unnamed));
      for (const url of row.urls) {
        const line = element('div', url);
        line.className = 'tm-mono';
        nameCell.appendChild(line);
      }
      if (row.urlRedacted) {
        const line = element('div', text.redacted);
        line.className = 'tm-muted';
        nameCell.appendChild(line);
      }
      const digest = element('div', fill(text.digest, {key: row.key}));
      digest.className = 'tm-mono tm-muted';
      nameCell.appendChild(digest);

      const kindCell = element(
        'td',
        row.kinds.length ? row.kinds.map((kind) => text.kinds[kind]).join(', ') : text.kinds.unknown
      );
      const projectCell = element('td');
      projectCell.appendChild(element('div', row.shared ? text.shared : (row.projectTitle ?? text.untitled)));
      if (!row.shared) {
        const uri = element('div', row.bucket);
        uri.className = 'tm-mono tm-muted';
        projectCell.appendChild(uri);
      }
      const sizeCell = element('td', formatSize(row.bytes));
      if (row.uses > 1) {
        const shared = element('div', fill(text.sharedBy, {uses: String(row.uses)}));
        shared.className = 'tm-muted';
        sizeCell.appendChild(shared);
      }
      const dateCell = element('td', formatDate(row.lastAccess));
      tr.append(checkCell, nameCell, kindCell, projectCell, sizeCell, dateCell);
      body.appendChild(tr);
    }
    table.append(head, body);
    tableBox.appendChild(table);
  }

  function renderFilters(text: CacheManagerLocaleText): void {
    searchInput.setAttribute('placeholder', text.search);
    searchInput.setAttribute('aria-label', text.search);
    kindSelect.setAttribute('aria-label', text.kindFilter);
    kindSelect.replaceChildren(
      option('', text.kindAll, query.kind),
      ...kindKeys.map((kind) => option(kind, text.kinds[kind], query.kind))
    );
    kindSelect.value = query.kind ?? '';
    projectSelect.setAttribute('aria-label', text.projectFilter);
    const buckets = [...new Map(rows.map((row) => [row.bucket, row])).values()].sort((a, b) =>
      a.shared !== b.shared ? (a.shared ? -1 : 1) : (a.projectTitle ?? a.bucket).localeCompare(b.projectTitle ?? b.bucket)
    );
    projectSelect.replaceChildren(
      option('', text.projectAll, query.bucket),
      ...buckets.map((row) => option(row.bucket, row.shared ? text.shared : (row.projectTitle ?? row.bucket), query.bucket))
    );
    projectSelect.value = query.bucket ?? '';
  }

  function render(): void {
    if (disposed) return;
    const text = textFor(locales, locale);
    heading.textContent = text.title;
    closeButton.textContent = text.close;
    closeButton.setAttribute('aria-label', text.close);
    refreshButton.textContent = text.refresh;
    refreshButton.disabled = busy;
    notice.textContent = text.notice;
    renderFilters(text);
    const shown = phase === 'ready' || phase === 'loading' ? visible() : [];
    const totals = cacheAssetTotals(rows);
    summary.textContent =
      phase === 'ready'
        ? `${fill(text.total, {entries: String(totals.entries), bytes: formatSize(totals.bytes), uses: String(totals.uses)})} ${fill(text.shown, {shown: String(shown.length), uses: String(totals.uses)})}`
        : phase === 'loading'
          ? text.loading
          : '';

    selectionBar.replaceChildren();
    if (phase === 'ready' && rows.length > 0) {
      const shownIds = shown.map((row) => row.id);
      selectionBar.append(
        button(fill(text.selectShown, {count: String(shownIds.length)}), () => {
          selected = new Set([...selected, ...shownIds]);
          confirming = false;
          render();
        }, {'data-cache-select-shown': 'true'}),
        button(fill(text.selectAll, {count: String(rows.length)}), () => {
          selected = new Set(rows.map((row) => row.id));
          confirming = false;
          render();
        }, {'data-cache-select-all': 'true'}),
        button(text.clearSelection, () => {
          selected = new Set();
          confirming = false;
          render();
        }, {'data-cache-clear': 'true'})
      );
      if (selected.size > 0) {
        const estimate = estimateCacheRelease(rows, selected);
        const line = element(
          'span',
          fill(text.selection, {uses: String(estimate.uses), bytes: formatSize(estimate.freedBytes), kept: String(estimate.keptEntries)})
        );
        line.setAttribute('data-cache-selection', 'true');
        selectionBar.appendChild(line);
        if (confirming) {
          selectionBar.append(
            button(fill(text.confirmRelease, {uses: String(estimate.uses)}), () => void releaseSelected(), {
              'data-tone': 'danger',
              'data-cache-confirm': 'true'
            }),
            button(text.cancel, () => {
              confirming = false;
              render();
            })
          );
        } else {
          selectionBar.appendChild(
            button(text.release, () => {
              confirming = true;
              render();
            }, {'data-cache-release': 'true'})
          );
        }
        renderEmbedding(text);
      }
    }
    renderTable(text, shown);
    resultLine.textContent = result;
    statusLine.textContent = status;
  }

  searchInput.addEventListener('input', () => {
    query = {...query, text: searchInput.value};
    render();
  });
  kindSelect.addEventListener('change', () => {
    const value = kindSelect.value as CacheAssetQuery['kind'] | '';
    const rest = {...query};
    delete rest.kind;
    query = value ? {...rest, kind: value} : rest;
    render();
  });
  projectSelect.addEventListener('change', () => {
    const value = projectSelect.value;
    const rest = {...query};
    delete rest.bucket;
    query = value ? {...rest, bucket: value} : rest;
    render();
  });
  refreshButton.addEventListener('click', () => {
    result = '';
    status = '';
    void reload();
  });
  closeButton.addEventListener('click', () => hide());
  root.addEventListener('keydown', (event: Event) => {
    if ((event as KeyboardEvent).key === 'Escape') hide();
  });

  function hide(): void {
    if (disposed) return;
    confirming = false;
    root.style.display = 'none';
  }

  function ensureActive(): void {
    if (disposed) throw new TypeError('cache manager dialog is disposed');
  }

  render();

  return Object.freeze({
    element: root,
    get locale() {
      return locale;
    },
    get phase() {
      return phase;
    },
    get selected(): ReadonlySet<string> {
      return new Set(selected);
    },
    async show(nextLocale?: string) {
      ensureActive();
      if (nextLocale !== undefined) locale = nextLocale;
      status = '';
      result = '';
      root.style.display = 'flex';
      await reload();
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
    setColorScheme(scheme: 'light' | 'dark' | 'auto') {
      ensureActive();
      root.setAttribute('data-color-scheme', scheme);
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      generation++;
      root.remove();
      if (previousMountPosition === '' || previousMountPosition === 'static') mount.style.position = previousMountPosition;
    }
  });
}
