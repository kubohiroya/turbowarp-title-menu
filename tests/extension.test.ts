import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {createApplicationMenu} from '../src/application-menu.js';
import {dslOpenEventName, dslReloadEventName} from '../src/composition.js';
import {createDslStorage} from '../src/dsl-storage.js';
import {TurboWarpTitleMenuExtension} from '../src/extension.js';
import {createTitleDialog} from '../src/title-dialog.js';

const locales = {
  en: {
    title: 'Sample',
    author: 'Author',
    license: 'MPL-2.0',
    website: 'Official Website',
    close: 'Close',
    open: 'Open DSL',
    reload: 'Reload DSL',
    about: 'About'
  },
  ja: {
    title: 'サンプル',
    author: '作者',
    license: 'MPL-2.0',
    website: '公式Webサイト',
    close: '閉じる',
    open: 'DSLを開く',
    reload: 'DSLを再読み込み',
    about: '情報'
  }
};

beforeEach(() => {
  vi.stubGlobal('Scratch', {
    BlockType: {COMMAND: 'command', REPORTER: 'reporter', BOOLEAN: 'boolean'},
    ArgumentType: {STRING: 'string'},
    Cast: {
      toString: (value: unknown) => String(value),
      toNumber: (value: unknown) => Number(value),
      toBoolean: (value: unknown) => Boolean(value)
    },
    extensions: {unsandboxed: true, register: vi.fn()},
    translate: (message: string | {default: string}) =>
      typeof message === 'string' ? message : message.default
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('TurboWarpTitleMenuExtension', () => {
  it('publishes title menu blocks and metadata', () => {
    const info = new TurboWarpTitleMenuExtension().getInfo() as {
      id: string;
      docsURI: string;
      blocks: Array<{opcode: string; blockType: string}>;
    };
    expect(info.id).toBe('kubohiroyaturbowarptitlemenu');
    expect(info.docsURI).toBe('https://kubohiroya.github.io/turbowarp-title-menu/');
    expect(info.blocks.map((block) => block.opcode)).toEqual([
      'showTitle',
      'showMenu',
      'hasSavedDsl',
      'savedDslName'
    ]);
  });
});

describe('createDslStorage', () => {
  it('saves, loads, and clears one DSL source record', () => {
    const storage = new MemoryStorage();
    const dsl = createDslStorage({storage, namespace: 'test-title-menu'});
    const saved = dsl.save({name: 'story.k4.yml', source: "title: 'Story'\n"});

    expect(dsl.key).toBe('test-title-menu:dsl-source');
    expect(dsl.load()).toEqual(saved);

    dsl.clear();
    expect(dsl.load()).toBeNull();
  });

  it('treats invalid stored records as absent', () => {
    const storage = new MemoryStorage();
    storage.setItem('test-title-menu:dsl-source', '{');
    const dsl = createDslStorage({storage, namespace: 'test-title-menu'});

    expect(dsl.load()).toBeNull();
    expect(storage.getItem('test-title-menu:dsl-source')).toBeNull();

    storage.setItem('test-title-menu:dsl-source', JSON.stringify({name: 'story.k4.yml'}));
    expect(dsl.load()).toBeNull();
    expect(storage.getItem('test-title-menu:dsl-source')).toBeNull();
  });
});

describe('Composition API', () => {
  it('exports stable DSL source event names', () => {
    expect(dslOpenEventName).toBe('turbowarp-title-menu:dsl-open');
    expect(dslReloadEventName).toBe('turbowarp-title-menu:dsl-reload');
  });
});

describe('DOM controls', () => {
  it('shows localized title dialog metadata', () => {
    const fixtureDocument = new FakeDocument();
    const mount = fixtureDocument.createElement('main');
    fixtureDocument.body.appendChild(mount);

    const dialog = createTitleDialog({
      document: fixtureDocument as unknown as Document,
      mount: mount as unknown as HTMLElement,
      locales
    });
    dialog.show('ja');

    expect(dialog.element.style.display).toBe('flex');
    expect(dialog.element.textContent).toContain('サンプル');
    expect(dialog.element.textContent).toContain('作者');
    expect(dialog.element.getAttribute('data-turbowarp-title-dialog')).toBe('true');
  });

  it('disables reload until a saved DSL source is available', () => {
    const fixtureDocument = new FakeDocument();
    const mount = fixtureDocument.createElement('main');
    fixtureDocument.body.appendChild(mount);

    const menu = createApplicationMenu({
      document: fixtureDocument as unknown as Document,
      mount: mount as unknown as HTMLElement,
      locales,
      reloadEnabled: false
    });
    menu.show('en');

    const reload = menu.element.querySelector(
      '[data-turbowarp-menu-action="reload"]'
    ) as HTMLButtonElement | null;
    expect(reload?.disabled).toBe(true);

    menu.setReloadEnabled(true);
    expect(reload?.disabled).toBe(false);
  });
});

class MemoryStorage implements Storage {
  private readonly values = new Map<string, string>();

  public get length(): number {
    return this.values.size;
  }

  public clear(): void {
    this.values.clear();
  }

  public getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  public key(index: number): string | null {
    return [...this.values.keys()][index] ?? null;
  }

  public removeItem(key: string): void {
    this.values.delete(key);
  }

  public setItem(key: string, value: string): void {
    this.values.set(key, value);
  }
}

class FakeStyle {
  public cssText = '';
  public position = '';
  public display = '';
  public opacity = '';
  public cursor = '';
}

class FakeElement {
  public readonly children: FakeElement[] = [];
  public readonly style = new FakeStyle();
  public readonly attributes = new Map<string, string>();
  public type = '';
  public disabled = false;
  public hidden = false;
  public parentElement: FakeElement | null = null;
  private ownText = '';

  public constructor(public readonly tagName: string) {}

  public get textContent(): string {
    return `${this.ownText}${this.children.map((child) => child.textContent).join('')}`;
  }

  public set textContent(value: string) {
    this.ownText = value;
    this.children.length = 0;
  }

  public get lastElementChild(): FakeElement | null {
    return this.children[this.children.length - 1] ?? null;
  }

  public append(...children: FakeElement[]): void {
    for (const child of children) this.appendChild(child);
  }

  public appendChild(child: FakeElement): FakeElement {
    child.parentElement = this;
    this.children.push(child);
    return child;
  }

  public remove(): void {
    if (!this.parentElement) return;
    const index = this.parentElement.children.indexOf(this);
    if (index >= 0) this.parentElement.children.splice(index, 1);
    this.parentElement = null;
  }

  public setAttribute(name: string, value: string): void {
    this.attributes.set(name, value);
  }

  public getAttribute(name: string): string | null {
    return this.attributes.get(name) ?? null;
  }

  public addEventListener(): void {}

  public removeEventListener(): void {}

  public querySelector(selector: string): FakeElement | null {
    const match = selector.match(/^\[([^=]+)="([^"]+)"\]$/);
    if (!match) return null;
    const name = match[1];
    const value = match[2];
    if (!name || !value) return null;
    return this.find((element) => element.getAttribute(name) === value);
  }

  private find(predicate: (element: FakeElement) => boolean): FakeElement | null {
    for (const child of this.children) {
      if (predicate(child)) return child;
      const nested = child.find(predicate);
      if (nested) return nested;
    }
    return null;
  }
}

class FakeDocument {
  public readonly body = new FakeElement('body');

  public createElement(tagName: string): FakeElement {
    return new FakeElement(tagName);
  }
}
