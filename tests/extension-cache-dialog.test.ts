import {describe, expect, it, vi} from 'vitest';

import type {CachedDigestSummary, CachedProjectSummary} from '../src/extension-cache';
import {
  createExtensionCacheDialog,
  type ExtensionCacheDialogOptions
} from '../src/extension-cache-dialog';

import {buttonsWithText, descendants, fakeDocument, fakeElement, type FakeElement} from './fake-dom';

const labels = {
  title: 'Extension cache',
  notice: 'Releasing drops what this project names.',
  total: 'In all: {entries} entries, {bytes}',
  shared: 'Shared by every project',
  untitled: '(no title recorded)',
  entryCount: '{entries} entries',
  expand: 'Entries',
  collapse: 'Fold',
  release: 'Release',
  confirmRelease: 'Release?',
  cancel: 'Cancel',
  close: 'Close',
  refresh: 'Reload',
  empty: 'Nothing is cached',
  releaseResult: 'Released {released}, freed {freed}',
  lastUsed: 'used {date}',
  originalSize: '{bytes} of JavaScript'
};

const projectUri = 'https://example.com/turbowarp-plus-projects/aa/bb/one';

const projects: CachedProjectSummary[] = [
  {bucket: 'shared', shared: true, entries: 2, bytes: 4096},
  {bucket: projectUri, shared: false, title: 'Kamishibai demo', entries: 1, bytes: 1024}
];

const digests: CachedDigestSummary[] = [
  {
    key: 'a'.repeat(64),
    bytes: 1024,
    originalBytes: 4096,
    lastAccess: Date.UTC(2026, 0, 2)
  },
  {
    key: 'b'.repeat(64),
    bytes: 512,
    originalBytes: 2048,
    lastAccess: Date.UTC(2026, 0, 1)
  }
];

function rowWith(element: FakeElement, attribute: string, value: string): FakeElement | undefined {
  return descendants(element).find((candidate) => candidate.getAttribute(attribute) === value);
}

function bucketRow(element: FakeElement, bucket: string): FakeElement {
  const row = rowWith(element, 'data-cache-bucket', bucket);
  expect(row).toBeDefined();
  return row as FakeElement;
}

function createDialog(overrides: Partial<ExtensionCacheDialogOptions> = {}) {
  const mount = fakeElement('div');
  const calls = {
    projects: 0,
    digests: [] as string[],
    totals: 0,
    releasedProjects: [] as string[],
    releasedDigests: [] as Array<[string, string]>
  };
  const dialog = createExtensionCacheDialog({
    document: fakeDocument(),
    mount: mount as unknown as HTMLElement,
    locales: {en: labels},
    initialLocale: 'en',
    listProjects: async () => {
      calls.projects += 1;
      return projects;
    },
    listDigests: async (bucket) => {
      calls.digests.push(bucket);
      return digests;
    },
    totals: async () => {
      calls.totals += 1;
      return {entries: 3, bytes: 5120};
    },
    onReleaseProject: (bucket) => {
      calls.releasedProjects.push(bucket);
      return {released: 2, freed: 4096};
    },
    onReleaseDigest: (bucket, key) => {
      calls.releasedDigests.push([bucket, key]);
      return {released: 1, freed: 1024};
    },
    formatSize: (bytes) => `${bytes}B`,
    formatDate: (epoch) => new Date(epoch).toISOString().slice(0, 10),
    ...overrides
  });
  return {dialog, mount, calls, element: dialog.element as unknown as FakeElement};
}

function textOf(element: FakeElement): string[] {
  return descendants(element).map((node) => node.textContent);
}

/**
 * Expands a bucket and waits for the rendered rows.
 *
 * Expanding re-lists the bucket, so the click only starts the work; waiting on the button that
 * folds it again is waiting on the render that the following assertions read.
 */
async function expand(element: FakeElement, bucket: string): Promise<void> {
  buttonsWithText(bucketRow(element, bucket), labels.expand)[0]?.click();
  await vi.waitFor(() =>
    expect(buttonsWithText(bucketRow(element, bucket), labels.collapse)).toHaveLength(1)
  );
}

describe('mounting', () => {
  it('stays hidden until it is shown', () => {
    const {element} = createDialog();
    expect(element.style['display']).toBe('none');
  });

  it('lists the buckets and the total when shown', async () => {
    const {dialog, element, calls} = createDialog();
    await dialog.show();

    expect(element.style['display']).toBe('flex');
    expect(calls.projects).toBe(1);
    expect(calls.totals).toBe(1);
    expect(textOf(element)).toContain('In all: 3 entries, 5120B');
  });

  it('renders the empty message when nothing is cached', async () => {
    const {dialog, element} = createDialog({listProjects: async () => []});
    await dialog.show();

    expect(textOf(element)).toContain(labels.empty);
  });

  it('removes itself from the mount on dispose', async () => {
    const {dialog, mount} = createDialog();
    await dialog.show();
    dialog.dispose();

    expect(mount.children).toHaveLength(0);
  });

  it('refuses to be shown after dispose', async () => {
    const {dialog} = createDialog();
    dialog.dispose();
    await expect(dialog.show()).rejects.toThrow(/disposed/);
  });
});

describe('wording', () => {
  /** The notice is the whole reason this screen can be shown to an operator at all. */
  it('always states what releasing does and does not promise', async () => {
    const {dialog, element} = createDialog();
    await dialog.show();

    expect(textOf(element)).toContain(labels.notice);
  });

  it('shows the title beside the URI, because the URI is opaque', async () => {
    const {dialog, element} = createDialog();
    await dialog.show();

    const row = bucketRow(element, projectUri);
    expect(textOf(row)).toContain('Kamishibai demo');
    expect(textOf(row)).toContain(projectUri);
  });

  it('says so plainly when no title was recorded, instead of leaving the row blank', async () => {
    const {dialog, element} = createDialog({
      listProjects: async () => [{bucket: projectUri, shared: false, entries: 1, bytes: 1024}]
    });
    await dialog.show();

    expect(textOf(bucketRow(element, projectUri))).toContain(labels.untitled);
  });

  it('names the shared bucket by its label and shows no URI for it', async () => {
    const {dialog, element} = createDialog();
    await dialog.show();

    const row = bucketRow(element, 'shared');
    expect(textOf(row)).toContain(labels.shared);
    expect(textOf(row)).not.toContain('shared');
  });
});

describe('expanding a bucket', () => {
  it('lists the digests of the chosen bucket only when asked', async () => {
    const {dialog, element, calls} = createDialog();
    await dialog.show();
    expect(calls.digests).toEqual([]);

    rowWith(element, 'data-cache-expand', projectUri)?.click();
    await vi.waitFor(() => expect(calls.digests).toEqual([projectUri]));
    expect(dialog.expanded).toBe(projectUri);
    await vi.waitFor(() =>
      expect(rowWith(element, 'data-cache-digest', 'a'.repeat(64))).toBeDefined()
    );
  });

  it('folds the bucket again on a second click', async () => {
    const {dialog, element} = createDialog();
    await dialog.show();
    await expand(element, projectUri);

    buttonsWithText(bucketRow(element, projectUri), labels.collapse)[0]?.click();
    await vi.waitFor(() =>
      expect(rowWith(element, 'data-cache-digest', 'a'.repeat(64))).toBeUndefined()
    );
    expect(dialog.expanded).toBe(null);
  });

  it('expands one bucket at a time', async () => {
    const {dialog, element} = createDialog();
    await dialog.show();

    await expand(element, projectUri);
    await expand(element, 'shared');

    expect(dialog.expanded).toBe('shared');
    expect(buttonsWithText(element, labels.collapse)).toHaveLength(1);
  });
});

describe('releasing', () => {
  it('requires a confirmation before releasing a project', async () => {
    const {dialog, element, calls} = createDialog();
    await dialog.show();

    buttonsWithText(bucketRow(element, projectUri), labels.release)[0]?.click();
    expect(calls.releasedProjects).toEqual([]);

    buttonsWithText(bucketRow(element, projectUri), labels.confirmRelease)[0]?.click();
    await vi.waitFor(() => expect(calls.releasedProjects).toEqual([projectUri]));
  });

  it('cancels the confirmation without releasing', async () => {
    const {dialog, element, calls} = createDialog();
    await dialog.show();

    buttonsWithText(bucketRow(element, projectUri), labels.release)[0]?.click();
    buttonsWithText(bucketRow(element, projectUri), labels.cancel)[0]?.click();

    expect(calls.releasedProjects).toEqual([]);
    expect(buttonsWithText(bucketRow(element, projectUri), labels.release)).toHaveLength(1);
  });

  it('confirms only one row at a time', async () => {
    const {dialog, element} = createDialog();
    await dialog.show();

    buttonsWithText(bucketRow(element, projectUri), labels.release)[0]?.click();
    buttonsWithText(bucketRow(element, 'shared'), labels.release)[0]?.click();

    expect(buttonsWithText(element, labels.confirmRelease)).toHaveLength(1);
  });

  it('releases the shared bucket too, since catalog bytes also take room', async () => {
    const {dialog, element, calls} = createDialog();
    await dialog.show();

    buttonsWithText(bucketRow(element, 'shared'), labels.release)[0]?.click();
    buttonsWithText(bucketRow(element, 'shared'), labels.confirmRelease)[0]?.click();

    await vi.waitFor(() => expect(calls.releasedProjects).toEqual(['shared']));
  });

  it('reports what the release actually did rather than what was asked', async () => {
    const {dialog, element} = createDialog();
    await dialog.show();

    buttonsWithText(bucketRow(element, projectUri), labels.release)[0]?.click();
    buttonsWithText(bucketRow(element, projectUri), labels.confirmRelease)[0]?.click();

    await vi.waitFor(() => expect(textOf(element)).toContain('Released 2, freed 4096B'));
  });

  it('releases one digest from the bucket that claims it', async () => {
    const {dialog, element, calls} = createDialog();
    await dialog.show();

    await expand(element, projectUri);

    const row = rowWith(element, 'data-cache-digest', 'b'.repeat(64)) as FakeElement;
    buttonsWithText(row, labels.release)[0]?.click();
    buttonsWithText(
      rowWith(element, 'data-cache-digest', 'b'.repeat(64)) as FakeElement,
      labels.confirmRelease
    )[0]?.click();

    await vi.waitFor(() =>
      expect(calls.releasedDigests).toEqual([[projectUri, 'b'.repeat(64)]])
    );
  });

  /** Releasing from one bucket can free bytes a second bucket claimed, so nothing is reused. */
  it('reloads the buckets, the total, and the open bucket after a release', async () => {
    const {dialog, element, calls} = createDialog();
    await dialog.show();
    await expand(element, projectUri);
    const before = {projects: calls.projects, totals: calls.totals, digests: calls.digests.length};

    buttonsWithText(bucketRow(element, projectUri), labels.release)[0]?.click();
    buttonsWithText(bucketRow(element, projectUri), labels.confirmRelease)[0]?.click();

    await vi.waitFor(() => expect(calls.projects).toBe(before.projects + 1));
    expect(calls.totals).toBe(before.totals + 1);
    expect(calls.digests).toHaveLength(before.digests + 1);
  });

  it('folds a bucket that the release removed entirely', async () => {
    let remaining = projects;
    const {dialog, element} = createDialog({
      listProjects: async () => remaining,
      onReleaseProject: (bucket) => {
        remaining = remaining.filter((entry) => entry.bucket !== bucket);
        return {released: 1, freed: 1024};
      }
    });
    await dialog.show();
    await expand(element, projectUri);

    buttonsWithText(bucketRow(element, projectUri), labels.release)[0]?.click();
    buttonsWithText(bucketRow(element, projectUri), labels.confirmRelease)[0]?.click();

    await vi.waitFor(() => expect(dialog.expanded).toBe(null));
  });
});

describe('failures', () => {
  it('shows the described error and keeps the dialog usable', async () => {
    const {dialog, element, calls} = createDialog({
      onReleaseProject: () => {
        throw new Error('storage is blocked');
      },
      describeError: (error) => `NG: ${(error as Error).message}`
    });
    await dialog.show();

    buttonsWithText(bucketRow(element, projectUri), labels.release)[0]?.click();
    buttonsWithText(bucketRow(element, projectUri), labels.confirmRelease)[0]?.click();

    await vi.waitFor(() => expect(textOf(element)).toContain('NG: storage is blocked'));
    expect(calls.projects).toBe(1);
    expect(bucketRow(element, projectUri)).toBeDefined();
  });

  it('reports a listing failure instead of showing an empty cache', async () => {
    const onError = vi.fn();
    const {dialog, element} = createDialog({
      listProjects: async () => {
        throw new Error('cache unavailable');
      },
      onError
    });

    await dialog.show();

    expect(onError).toHaveBeenCalledTimes(1);
    expect(textOf(element)).toContain('cache unavailable');
    // Showing "nothing is cached" here would be a different, false claim.
    expect(textOf(element)).not.toContain(labels.empty);
  });

  it('clears a stale error once a release succeeds', async () => {
    let failing = true;
    const {dialog, element} = createDialog({
      onReleaseProject: () => {
        if (failing) throw new Error('blocked');
        return {released: 1, freed: 1024};
      }
    });
    await dialog.show();

    buttonsWithText(bucketRow(element, projectUri), labels.release)[0]?.click();
    buttonsWithText(bucketRow(element, projectUri), labels.confirmRelease)[0]?.click();
    await vi.waitFor(() => expect(textOf(element)).toContain('blocked'));

    failing = false;
    buttonsWithText(bucketRow(element, projectUri), labels.release)[0]?.click();
    buttonsWithText(bucketRow(element, projectUri), labels.confirmRelease)[0]?.click();
    await vi.waitFor(() => expect(textOf(element)).not.toContain('blocked'));
  });
});

describe('locale', () => {
  it('renders another locale on demand', async () => {
    const {dialog, element} = createDialog({
      locales: {
        en: labels,
        ja: {...labels, title: '機能拡張キャッシュ', release: '手放す'}
      }
    });
    await dialog.show('ja');

    expect(textOf(element)).toContain('機能拡張キャッシュ');
    expect(buttonsWithText(bucketRow(element, projectUri), '手放す')).toHaveLength(1);
  });

  it('falls back to English for an unknown locale', async () => {
    const {dialog, element} = createDialog();
    await dialog.show('fr');

    expect(textOf(element)).toContain(labels.title);
  });
});

describe('reloading', () => {
  it('asks the cache again when the operator reloads', async () => {
    const {dialog, element, calls} = createDialog();
    await dialog.show();

    buttonsWithText(element, labels.refresh)[0]?.click();

    await vi.waitFor(() => expect(calls.projects).toBe(2));
  });
});
