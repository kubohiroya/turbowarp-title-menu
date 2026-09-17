import {describe, expect, it, vi} from 'vitest';

import {createDslFilesDialog, type DslFilesDialogOptions} from '../src/dsl-files-dialog';
import type {DslFileSummary, DslSort} from '../src/dsl-store';

import {buttonsWithText, descendants, fakeDocument, fakeElement, rowFor, type FakeElement} from './fake-dom';

const labels = {
  title: 'DSL files',
  add: 'Add file',
  open: 'Open',
  rename: 'Rename',
  remove: 'Delete',
  confirmRemove: 'Delete?',
  confirm: 'OK',
  cancel: 'Cancel',
  close: 'Close',
  sortByName: 'Name',
  sortByDate: 'Date',
  sortBySize: 'Size',
  empty: 'No DSL files saved'
};

function summary(id: string, name: string, byteLength: number, updatedAt: string): DslFileSummary {
  return {id, name, byteLength, savedAt: updatedAt, updatedAt};
}

const files: DslFileSummary[] = [
  summary('a', 'alpha.yaml', 2048, '2026-01-03T00:00:00.000Z'),
  summary('b', 'beta.yaml', 512, '2026-01-01T00:00:00.000Z')
];

function createDialog(overrides: Partial<DslFilesDialogOptions> = {}) {
  const mount = fakeElement('div');
  const calls = {
    list: [] as DslSort[],
    open: [] as string[],
    add: 0,
    rename: [] as Array<[string, string]>,
    remove: [] as string[]
  };
  const dialog = createDslFilesDialog({
    document: fakeDocument(),
    mount: mount as unknown as HTMLElement,
    locales: {en: labels},
    initialLocale: 'en',
    list: async (sort) => {
      calls.list.push(sort);
      return files;
    },
    onOpen: (id) => {
      calls.open.push(id);
    },
    onAdd: () => {
      calls.add += 1;
    },
    onRename: (id, name) => {
      calls.rename.push([id, name]);
    },
    onRemove: (id) => {
      calls.remove.push(id);
    },
    formatDate: (iso) => iso.slice(0, 10),
    ...overrides
  });
  return {dialog, mount, calls, element: dialog.element as unknown as FakeElement};
}

describe('mounting', () => {
  it('stays hidden until it is shown', () => {
    const {dialog, element} = createDialog();
    expect(element.style['display']).toBe('none');
    expect(dialog.element).toBeDefined();
  });

  it('loads the list when shown and reveals the panel', async () => {
    const {dialog, element, calls} = createDialog();
    await dialog.show();

    expect(element.style['display']).toBe('flex');
    expect(calls.list).toHaveLength(1);
    expect(rowFor(element, 'a')).toBeDefined();
    expect(rowFor(element, 'b')).toBeDefined();
  });

  it('renders the empty message when nothing is stored', async () => {
    const {dialog, element} = createDialog({list: async () => []});
    await dialog.show();

    expect(descendants(element).some((node) => node.textContent === labels.empty)).toBe(true);
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

describe('row actions', () => {
  it('opens the selected file', async () => {
    const {dialog, element, calls} = createDialog();
    await dialog.show();

    buttonsWithText(rowFor(element, 'b') as FakeElement, labels.open)[0]?.click();
    await vi.waitFor(() => expect(calls.open).toEqual(['b']));
  });

  it('adds a file through the caller-owned picker', async () => {
    const {dialog, element, calls} = createDialog();
    await dialog.show();

    buttonsWithText(element, labels.add)[0]?.click();
    await vi.waitFor(() => expect(calls.add).toBe(1));
  });

  it('reloads the list after a mutation so the dialog shows the new state', async () => {
    const {dialog, element, calls} = createDialog();
    await dialog.show();
    expect(calls.list).toHaveLength(1);

    buttonsWithText(rowFor(element, 'a') as FakeElement, labels.open)[0]?.click();
    await vi.waitFor(() => expect(calls.list).toHaveLength(2));
  });
});

describe('rename', () => {
  it('edits the name inline and commits the new value', async () => {
    const {dialog, element, calls} = createDialog();
    await dialog.show();

    buttonsWithText(rowFor(element, 'a') as FakeElement, labels.rename)[0]?.click();
    const input = descendants(element).find((node) => node.getAttribute('data-rename-input') === 'a');
    expect(input?.value).toBe('alpha.yaml');

    (input as FakeElement).value = 'show.yaml';
    buttonsWithText(rowFor(element, 'a') as FakeElement, labels.confirm)[0]?.click();

    await vi.waitFor(() => expect(calls.rename).toEqual([['a', 'show.yaml']]));
  });

  it('commits on Enter', async () => {
    const {dialog, element, calls} = createDialog();
    await dialog.show();

    buttonsWithText(rowFor(element, 'a') as FakeElement, labels.rename)[0]?.click();
    const input = descendants(element).find((node) => node.getAttribute('data-rename-input') === 'a');
    (input as FakeElement).value = 'renamed.yaml';
    (input as FakeElement).keyDown('Enter');

    await vi.waitFor(() => expect(calls.rename).toEqual([['a', 'renamed.yaml']]));
  });

  it('abandons the edit on Escape without calling back', async () => {
    const {dialog, element, calls} = createDialog();
    await dialog.show();

    buttonsWithText(rowFor(element, 'a') as FakeElement, labels.rename)[0]?.click();
    const input = descendants(element).find((node) => node.getAttribute('data-rename-input') === 'a');
    (input as FakeElement).keyDown('Escape');

    expect(calls.rename).toEqual([]);
    expect(descendants(element).some((node) => node.getAttribute('data-rename-input') === 'a')).toBe(false);
  });

  it('edits only one row at a time', async () => {
    const {dialog, element} = createDialog();
    await dialog.show();

    buttonsWithText(rowFor(element, 'a') as FakeElement, labels.rename)[0]?.click();
    buttonsWithText(rowFor(element, 'b') as FakeElement, labels.rename)[0]?.click();

    const inputs = descendants(element).filter((node) => node.getAttribute('data-rename-input') !== null);
    expect(inputs).toHaveLength(1);
    expect(inputs[0]?.getAttribute('data-rename-input')).toBe('b');
  });
});

describe('delete', () => {
  it('requires a confirmation click before removing', async () => {
    const {dialog, element, calls} = createDialog();
    await dialog.show();

    buttonsWithText(rowFor(element, 'a') as FakeElement, labels.remove)[0]?.click();
    expect(calls.remove).toEqual([]);

    buttonsWithText(rowFor(element, 'a') as FakeElement, labels.confirmRemove)[0]?.click();
    await vi.waitFor(() => expect(calls.remove).toEqual(['a']));
  });

  it('cancels the confirmation without removing', async () => {
    const {dialog, element, calls} = createDialog();
    await dialog.show();

    buttonsWithText(rowFor(element, 'a') as FakeElement, labels.remove)[0]?.click();
    buttonsWithText(rowFor(element, 'a') as FakeElement, labels.cancel)[0]?.click();

    expect(calls.remove).toEqual([]);
    expect(buttonsWithText(rowFor(element, 'a') as FakeElement, labels.remove)).toHaveLength(1);
  });

  it('confirms only one row at a time', async () => {
    const {dialog, element} = createDialog();
    await dialog.show();

    buttonsWithText(rowFor(element, 'a') as FakeElement, labels.remove)[0]?.click();
    buttonsWithText(rowFor(element, 'b') as FakeElement, labels.remove)[0]?.click();

    expect(buttonsWithText(element, labels.confirmRemove)).toHaveLength(1);
  });
});

describe('sorting', () => {
  it('starts at the requested sort', async () => {
    const {dialog, calls} = createDialog({initialSort: {field: 'name', direction: 'asc'}});
    await dialog.show();

    expect(calls.list[0]).toEqual({field: 'name', direction: 'asc'});
  });

  it('selects a field with its natural direction', async () => {
    const {dialog, element, calls} = createDialog({initialSort: {field: 'name', direction: 'asc'}});
    await dialog.show();

    descendants(element).find((node) => node.getAttribute('data-sort-field') === 'byteLength')?.click();

    await vi.waitFor(() => expect(calls.list.at(-1)).toEqual({field: 'byteLength', direction: 'desc'}));
  });

  it('flips the direction when the active field is chosen again', async () => {
    const {dialog, element, calls} = createDialog({initialSort: {field: 'name', direction: 'asc'}});
    await dialog.show();

    descendants(element).find((node) => node.getAttribute('data-sort-field') === 'name')?.click();

    await vi.waitFor(() => expect(calls.list.at(-1)).toEqual({field: 'name', direction: 'desc'}));
    expect(dialog.sort).toEqual({field: 'name', direction: 'desc'});
  });

  it('marks the active sort button', async () => {
    const {dialog, element} = createDialog({initialSort: {field: 'updatedAt', direction: 'desc'}});
    await dialog.show();

    const active = descendants(element).filter((node) => node.getAttribute('aria-pressed') === 'true');
    expect(active).toHaveLength(1);
    expect(active[0]?.getAttribute('data-sort-field')).toBe('updatedAt');
  });

  it('leaves a pending rename when the sort changes', async () => {
    const {dialog, element} = createDialog();
    await dialog.show();

    buttonsWithText(rowFor(element, 'a') as FakeElement, labels.rename)[0]?.click();
    descendants(element).find((node) => node.getAttribute('data-sort-field') === 'name')?.click();

    await vi.waitFor(() =>
      expect(descendants(element).some((node) => node.getAttribute('data-rename-input') !== null)).toBe(false)
    );
  });
});

describe('failures', () => {
  it('shows the described error and keeps the dialog usable', async () => {
    const {dialog, element, calls} = createDialog({
      onRemove: () => {
        throw new Error('storage is full');
      },
      describeError: (error) => `NG: ${(error as Error).message}`
    });
    await dialog.show();

    buttonsWithText(rowFor(element, 'a') as FakeElement, labels.remove)[0]?.click();
    buttonsWithText(rowFor(element, 'a') as FakeElement, labels.confirmRemove)[0]?.click();

    await vi.waitFor(() =>
      expect(descendants(element).some((node) => node.textContent === 'NG: storage is full')).toBe(true)
    );
    expect(calls.list).toHaveLength(1);
    expect(rowFor(element, 'a')).toBeDefined();
  });

  it('reports the failure to the caller', async () => {
    const onError = vi.fn();
    const {dialog, element} = createDialog({
      onOpen: () => {
        throw new Error('gone');
      },
      onError
    });
    await dialog.show();

    buttonsWithText(rowFor(element, 'b') as FakeElement, labels.open)[0]?.click();
    await vi.waitFor(() => expect(onError).toHaveBeenCalledTimes(1));
  });

  it('clears a stale error once an action succeeds', async () => {
    let failing = true;
    const {dialog, element} = createDialog({
      onOpen: () => {
        if (failing) throw new Error('gone');
      }
    });
    await dialog.show();

    buttonsWithText(rowFor(element, 'b') as FakeElement, labels.open)[0]?.click();
    await vi.waitFor(() => expect(descendants(element).some((node) => node.textContent === 'gone')).toBe(true));

    failing = false;
    buttonsWithText(rowFor(element, 'b') as FakeElement, labels.open)[0]?.click();
    await vi.waitFor(() =>
      expect(descendants(element).some((node) => node.textContent === 'gone')).toBe(false)
    );
  });
});

describe('locale', () => {
  it('renders another locale on demand', async () => {
    const {dialog, element} = createDialog({
      locales: {en: labels, ja: {...labels, title: 'DSLファイル', open: '開く'}}
    });
    await dialog.show('ja');

    expect(descendants(element).some((node) => node.textContent === 'DSLファイル')).toBe(true);
    expect(buttonsWithText(rowFor(element, 'a') as FakeElement, '開く')).toHaveLength(1);
  });

  it('falls back to English for an unknown locale', async () => {
    const {dialog, element} = createDialog();
    await dialog.show('fr');

    expect(descendants(element).some((node) => node.textContent === labels.title)).toBe(true);
  });
});
