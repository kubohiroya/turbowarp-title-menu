import {IDBFactory} from 'fake-indexeddb';
import {beforeEach, describe, expect, it, vi} from 'vitest';

import {buttonsWithText, descendants, fakeElement, rowFor, type FakeElement} from './fake-dom';

const startedHats: string[] = [];
const dispatchedEvents: Array<{type: string; detail: unknown}> = [];
let stage: FakeElement;
let createdInputs: FakeElement[] = [];

function installGlobals(): void {
  stage = fakeElement('div');
  createdInputs = [];
  const globals = globalThis as Record<string, unknown>;
  globals['document'] = {
    body: stage,
    createElement(tagName: string) {
      const element = fakeElement(tagName);
      if (tagName === 'input') createdInputs.push(element);
      return element;
    }
  };
  globals['indexedDB'] = new IDBFactory();
  globals['dispatchEvent'] = (event: {type: string; detail?: unknown}) => {
    dispatchedEvents.push({type: event.type, detail: event.detail});
    return true;
  };
  globals['Scratch'] = {
    extensions: {unsandboxed: true, register() {}},
    BlockType: {COMMAND: 'command', REPORTER: 'reporter', BOOLEAN: 'Boolean', HAT: 'hat'},
    ArgumentType: {STRING: 'string', NUMBER: 'number', BOOLEAN: 'Boolean'},
    Cast: {toString: String},
    translate: (value: unknown) => (typeof value === 'string' ? value : ''),
    vm: {
      renderer: {canvas: {parentElement: stage}},
      runtime: {
        startHats(opcode: string) {
          startedHats.push(opcode);
        }
      }
    }
  };
}

installGlobals();

const {TurboWarpTitleMenuExtension} = await import('../src/extension');
const {createDslStore} = await import('../src/dsl-store');
const {dslFilesLocales} = await import('../src/locales');
const {dslOpenEventName, dslReloadEventName} = await import('../src/events');

const databaseName = 'kubohiroyaturbowarptitlemenu';
const labels = dslFilesLocales.en;

function createExtension() {
  return new TurboWarpTitleMenuExtension();
}

/** Seeds the same database the extension opens, so the dialog lists real stored records. */
async function seed(files: Array<{name: string; source: string}>) {
  const store = createDslStore({databaseName});
  for (const file of files) await store.save(file);
  const saved = await store.list({field: 'name', direction: 'asc'});
  store.close();
  return saved;
}

function rowOf(id: string | undefined): FakeElement {
  const row = rowFor(stage, id ?? '');
  expect(row).toBeDefined();
  return row as FakeElement;
}

beforeEach(() => {
  startedHats.length = 0;
  dispatchedEvents.length = 0;
  installGlobals();
});

describe('getInfo', () => {
  it('publishes the extension identity and every block', () => {
    const info = createExtension().getInfo();
    expect(info['id']).toBe(databaseName);
    expect(info['blocks']).toHaveLength(10);
  });

  it('declares the DSL hat as a non edge-activated hat', () => {
    const blocks = createExtension().getInfo()['blocks'] as Array<Record<string, unknown>>;
    const hat = blocks.find((block) => block['opcode'] === 'whenDslSourceOpened');
    expect(hat?.['blockType']).toBe('hat');
    expect(hat?.['isEdgeActivated']).toBe(false);
  });
});

describe('dialogs', () => {
  it('mounts the title dialog on the stage container', () => {
    createExtension().showTitle();
    expect(stage.children.length).toBeGreaterThan(0);
  });

  it('mounts the application menu with its four actions', () => {
    createExtension().showMenu();
    const rendered = descendants(stage).map((node) => node.textContent);
    for (const label of ['DSL files', 'Reload DSL', 'About', 'Close']) {
      expect(rendered).toContain(label);
    }
  });

  it('lists the stored DSL files in the file manager', async () => {
    const [alpha] = await seed([{name: 'alpha.yaml', source: 'a: 1'}]);
    await createExtension().showDslFiles();

    expect(rowOf(alpha?.id)).toBeDefined();
  });

  it('shows the empty state when nothing is stored', async () => {
    await createExtension().showDslFiles();
    expect(descendants(stage).some((node) => node.textContent === labels.empty)).toBe(true);
  });
});

describe('opening a DSL file', () => {
  it('exposes the opened name and source, starts the hat, and announces the event', async () => {
    const [alpha] = await seed([{name: 'alpha.yaml', source: 'a: 1'}]);
    const extension = createExtension();
    await extension.showDslFiles();

    buttonsWithText(rowOf(alpha?.id), labels.open)[0]?.click();

    await vi.waitFor(() => expect(extension.openedDslName()).toBe('alpha.yaml'));
    expect(extension.openedDslSource()).toBe('a: 1');
    expect(startedHats).toContain(`${databaseName}_whenDslSourceOpened`);
    expect(dispatchedEvents.map((event) => event.type)).toContain(dslOpenEventName);
  });

  it('records the opened file so a later session can restore it', async () => {
    const [alpha] = await seed([{name: 'alpha.yaml', source: 'a: 1'}]);
    const extension = createExtension();
    await extension.showDslFiles();
    buttonsWithText(rowOf(alpha?.id), labels.open)[0]?.click();
    await vi.waitFor(() => expect(extension.openedDslName()).toBe('alpha.yaml'));

    const reopened = createDslStore({databaseName});
    expect((await reopened.lastOpened())?.name).toBe('alpha.yaml');
    reopened.close();
  });
});

describe('reloading', () => {
  it('announces the opened source again', async () => {
    const [alpha] = await seed([{name: 'alpha.yaml', source: 'a: 1'}]);
    const extension = createExtension();
    await extension.showDslFiles();
    buttonsWithText(rowOf(alpha?.id), labels.open)[0]?.click();
    await vi.waitFor(() => expect(extension.openedDslName()).toBe('alpha.yaml'));

    extension.reloadOpenedDsl();

    expect(dispatchedEvents.map((event) => event.type)).toContain(dslReloadEventName);
    expect(startedHats.filter((opcode) => opcode.endsWith('whenDslSourceOpened'))).toHaveLength(2);
  });

  it('does nothing when no file is open', () => {
    createExtension().reloadOpenedDsl();
    expect(dispatchedEvents).toEqual([]);
    expect(startedHats).toEqual([]);
  });
});

describe('renaming and deleting through the dialog', () => {
  it('renames a stored file', async () => {
    const [alpha] = await seed([{name: 'alpha.yaml', source: 'a: 1'}]);
    await createExtension().showDslFiles();

    buttonsWithText(rowOf(alpha?.id), labels.rename)[0]?.click();
    const input = descendants(stage).find((node) => node.getAttribute('data-rename-input') !== null);
    (input as FakeElement).value = 'show.yaml';
    buttonsWithText(rowOf(alpha?.id), labels.confirm)[0]?.click();

    await vi.waitFor(() =>
      expect(descendants(stage).some((node) => node.textContent === 'show.yaml')).toBe(true)
    );
  });

  it('reports a duplicate name instead of renaming', async () => {
    const files = await seed([
      {name: 'alpha.yaml', source: '1'},
      {name: 'beta.yaml', source: '2'}
    ]);
    const extension = createExtension();
    await extension.showDslFiles();

    const target = files[1];
    buttonsWithText(rowOf(target?.id), labels.rename)[0]?.click();
    const input = descendants(stage).find((node) => node.getAttribute('data-rename-input') !== null);
    (input as FakeElement).value = 'alpha.yaml';
    buttonsWithText(rowOf(target?.id), labels.confirm)[0]?.click();

    await vi.waitFor(() => expect(extension.lastDslError()).toMatch(/already uses that name/));
  });

  it('deletes a stored file after the confirmation click', async () => {
    const [alpha] = await seed([{name: 'alpha.yaml', source: 'a: 1'}]);
    const extension = createExtension();
    await extension.showDslFiles();

    buttonsWithText(rowOf(alpha?.id), labels.remove)[0]?.click();
    buttonsWithText(rowOf(alpha?.id), labels.confirmRemove)[0]?.click();

    await vi.waitFor(() => expect(rowFor(stage, alpha?.id ?? '')).toBeUndefined());
    await expect(extension.savedDslCount()).resolves.toBe(0);
  });

  it('forgets the opened file when that file is deleted', async () => {
    const [alpha] = await seed([{name: 'alpha.yaml', source: 'a: 1'}]);
    const extension = createExtension();
    await extension.showDslFiles();
    buttonsWithText(rowOf(alpha?.id), labels.open)[0]?.click();
    await vi.waitFor(() => expect(extension.openedDslName()).toBe('alpha.yaml'));

    buttonsWithText(rowOf(alpha?.id), labels.remove)[0]?.click();
    buttonsWithText(rowOf(alpha?.id), labels.confirmRemove)[0]?.click();

    await vi.waitFor(() => expect(extension.openedDslName()).toBe(''));
    expect(extension.openedDslSource()).toBe('');
  });
});

describe('adding a file through the picker', () => {
  it('stores the chosen file without opening it', async () => {
    const extension = createExtension();
    await extension.showDslFiles();

    buttonsWithText(stage, labels.add)[0]?.click();
    await vi.waitFor(() => expect(createdInputs).toHaveLength(1));
    const input = createdInputs[0] as FakeElement;
    expect(input.type).toBe('file');
    input.files = [{name: 'new.yaml', size: 4, text: async () => 'a: 1'}];
    input.dispatch('change');

    await vi.waitFor(async () => {
      expect(await extension.savedDslCount()).toBe(1);
    });
    expect(extension.openedDslName()).toBe('');
  });

  it('stores nothing when the operator cancels the picker', async () => {
    const extension = createExtension();
    await extension.showDslFiles();

    buttonsWithText(stage, labels.add)[0]?.click();
    await vi.waitFor(() => expect(createdInputs).toHaveLength(1));
    (createdInputs[0] as FakeElement).dispatch('change');

    await vi.waitFor(async () => {
      expect(await extension.savedDslCount()).toBe(0);
    });
  });
});

describe('storage reporters', () => {
  it('counts the stored files', async () => {
    await seed([
      {name: 'one.yaml', source: '1'},
      {name: 'two.yaml', source: '2'}
    ]);
    const extension = createExtension();

    await expect(extension.savedDslCount()).resolves.toBe(2);
    await expect(extension.hasSavedDsl()).resolves.toBe(true);
  });

  it('reports an empty store', async () => {
    const extension = createExtension();
    await expect(extension.hasSavedDsl()).resolves.toBe(false);
    await expect(extension.savedDslCount()).resolves.toBe(0);
  });

  it('starts with no recorded error', () => {
    expect(createExtension().lastDslError()).toBe('');
  });

  it('reports unavailable storage instead of throwing into a script', async () => {
    (globalThis as Record<string, unknown>)['indexedDB'] = undefined;
    const extension = createExtension();

    await expect(extension.savedDslCount()).resolves.toBe(0);
    expect(extension.lastDslError()).toMatch(/storage is unavailable/);
  });
});
