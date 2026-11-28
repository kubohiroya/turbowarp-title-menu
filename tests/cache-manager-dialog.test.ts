import {describe, expect, it, vi} from 'vitest';

import {cacheAssetRowId, type CacheAssetRow} from '../src/cache-asset-model';
import {createCacheManagerDialog, type CacheManagerDialogOptions} from '../src/cache-manager-dialog';
import {cacheManagerLocales} from '../src/locales';

import {descendants, fakeDocument, type FakeElement} from './fake-dom';

const one = 'https://example.com/p/one';
const two = 'https://example.com/p/two';
const row = (bucket: string, key: string, extra: Partial<CacheAssetRow> = {}): CacheAssetRow => ({
  id: cacheAssetRowId(bucket, key),
  key,
  bucket,
  shared: bucket === 'shared',
  names: [],
  kinds: [],
  urls: [],
  urlRedacted: false,
  refs: [],
  bytes: 100,
  originalBytes: 300,
  lastAccess: 1,
  uses: 1,
  ...extra
});
const cat = 'a'.repeat(64);
const pop = 'b'.repeat(64);
const rows: CacheAssetRow[] = [
  row(one, cat, {names: ['cat.svg'], kinds: ['costume'], projectTitle: 'One', bytes: 1000, uses: 2, lastAccess: 3}),
  row(two, cat, {names: ['wall'], kinds: ['backdrop'], bytes: 1000, uses: 2, lastAccess: 2}),
  row(one, pop, {names: ['pop'], kinds: ['sound'], projectTitle: 'One', bytes: 200, lastAccess: 1})
];

function find(root: FakeElement, attribute: string, value?: string): FakeElement[] {
  return descendants(root).filter((element) =>
    value === undefined ? element.getAttribute(attribute) !== null : element.getAttribute(attribute) === value
  );
}
const shownRows = (root: FakeElement) => find(root, 'data-cache-row').map((element) => element.getAttribute('data-cache-row'));
const text = (root: FakeElement) => descendants(root).map((element) => element.textContent).join('\n');

function open(overrides: Partial<CacheManagerDialogOptions> = {}) {
  const document = fakeDocument();
  const onRelease = vi.fn(async (claims: readonly {bucket: string; key: string}[]) => ({released: claims.length, freed: 1200}));
  const listAssets = vi.fn(async () => rows);
  const dialog = createCacheManagerDialog({
    document,
    locales: cacheManagerLocales,
    listAssets,
    onRelease,
    formatSize: (bytes) => `${bytes} B`,
    ...overrides
  });
  return {dialog, root: dialog.element as unknown as FakeElement, onRelease, listAssets};
}

describe('cache manager dialog', () => {
  it('lists every use, newest first, with totals that count a shared copy once', async () => {
    const {dialog, root} = open();
    await dialog.show('en');
    expect(dialog.phase).toBe('ready');
    expect(shownRows(root)).toEqual(rows.map((item) => item.id));
    expect(find(root, 'data-cache-summary')[0]!.textContent).toBe('2 cached copies, 1200 B (3 uses). Showing 3 of 3.');
    expect(text(root)).toContain('used by 2 projects');
  });

  it('searches, filters and sorts', async () => {
    const {dialog, root} = open();
    await dialog.show('en');
    const search = find(root, 'data-cache-search')[0]!;
    search.value = 'wall';
    search.dispatch('input');
    expect(shownRows(root)).toEqual([rows[1]!.id]);
    search.value = '';
    search.dispatch('input');
    const kind = find(root, 'data-cache-kind')[0]!;
    kind.value = 'sound';
    kind.dispatch('change');
    expect(shownRows(root)).toEqual([rows[2]!.id]);
    kind.value = '';
    kind.dispatch('change');
    find(root, 'data-cache-sort', 'size')[0]!.click();
    expect(shownRows(root)).toEqual([rows[0]!.id, rows[1]!.id, rows[2]!.id]);
    find(root, 'data-cache-sort', 'size')[0]!.click();
    expect(shownRows(root)).toEqual([rows[2]!.id, rows[0]!.id, rows[1]!.id]);
    expect(find(root, 'aria-sort', 'ascending')).toHaveLength(1);
  });

  it('selects what is shown or the whole cache, says which, and releases after confirming', async () => {
    const {dialog, root, onRelease, listAssets} = open();
    await dialog.show('en');
    const search = find(root, 'data-cache-search')[0]!;
    search.value = 'One';
    search.dispatch('input');
    find(root, 'data-cache-select-shown')[0]!.click();
    expect([...dialog.selected]).toEqual([rows[0]!.id, rows[2]!.id]);
    // The copy of cat.svg is also used by project two, so only pop is freed.
    expect(find(root, 'data-cache-selection')[0]!.textContent).toBe(
      '2 selected. Frees about 200 B; 1 copies stay because another project uses them.'
    );
    find(root, 'data-cache-select-all')[0]!.click();
    expect(dialog.selected.size).toBe(3);
    find(root, 'data-cache-clear')[0]!.click();
    expect(dialog.selected.size).toBe(0);

    find(root, 'data-cache-select', rows[2]!.id)[0]!.dispatch('change');
    find(root, 'data-cache-release')[0]!.click();
    expect(onRelease).not.toHaveBeenCalled();
    find(root, 'data-cache-confirm')[0]!.click();
    await vi.waitFor(() => expect(listAssets).toHaveBeenCalledTimes(2));
    expect(onRelease).toHaveBeenCalledWith([{bucket: one, key: pop}]);
    expect(text(root)).toContain('Released 1 of 1 and freed 1200 B.');
    expect(dialog.selected.size).toBe(0);
  });

  it('says when a release found uses already gone', async () => {
    const {dialog, root} = open({onRelease: async () => ({released: 1, freed: 0})});
    await dialog.show('en');
    find(root, 'data-cache-select-all')[0]!.click();
    find(root, 'data-cache-release')[0]!.click();
    find(root, 'data-cache-confirm')[0]!.click();
    await vi.waitFor(() => expect(text(root)).toContain('2 had already been released elsewhere.'));
  });

  it('never shows a failed listing as an empty cache, and tells empty from no matches', async () => {
    const failing = open({listAssets: async () => Promise.reject(new Error('storage blocked'))});
    await failing.dialog.show('en');
    expect(failing.dialog.phase).toBe('error');
    expect(text(failing.root)).toContain('storage blocked');
    expect(text(failing.root)).not.toContain('Nothing is cached');

    const empty = open({listAssets: async () => []});
    await empty.dialog.show('ja');
    expect(text(empty.root)).toContain('キャッシュは空です');
  });

  it('shows only the newest listing when two overlap', async () => {
    let finishSlow: (value: readonly CacheAssetRow[]) => void = () => {};
    const listAssets = vi
      .fn<() => Promise<readonly CacheAssetRow[]>>()
      .mockImplementationOnce(() => new Promise((resolve) => (finishSlow = resolve)))
      .mockImplementation(async () => [rows[2]!]);
    const {dialog, root} = open({listAssets});
    const first = dialog.show('en');
    await dialog.refresh();
    finishSlow(rows);
    await first;
    expect(shownRows(root)).toEqual([rows[2]!.id]);
  });

  it('follows the host theme and closes on Escape', async () => {
    const {dialog, root} = open({colorScheme: 'dark'});
    expect(root.getAttribute('data-color-scheme')).toBe('dark');
    dialog.setColorScheme('light');
    expect(root.getAttribute('data-color-scheme')).toBe('light');
    await dialog.show('en');
    root.keyDown('Escape');
    expect(root.style.display).toBe('none');
  });
});
