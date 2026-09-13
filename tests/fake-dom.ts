type Listener = (event: unknown) => void;

export interface FakeElement {
  tagName: string;
  children: FakeElement[];
  parentNode: FakeElement | null;
  style: Record<string, string>;
  attributes: Map<string, string>;
  textContent: string;
  type: string;
  value: string;
  accept: string;
  files: unknown[] | null;
  disabled: boolean;
  removed: boolean;
  appendChild(child: FakeElement): FakeElement;
  append(...children: FakeElement[]): void;
  replaceChildren(...children: FakeElement[]): void;
  remove(): void;
  setAttribute(name: string, value: string): void;
  getAttribute(name: string): string | null;
  addEventListener(name: string, listener: Listener): void;
  removeEventListener(name: string, listener: Listener): void;
  click(): void;
  keyDown(key: string): void;
  dispatch(name: string, event?: Record<string, unknown>): void;
}

/** A DOM stand-in covering only what the dialogs touch, so the suite needs no browser environment. */
export function fakeElement(tagName: string): FakeElement {
  const children: FakeElement[] = [];
  const listeners = new Map<string, Listener[]>();
  const element: FakeElement = {
    tagName,
    children,
    parentNode: null,
    style: {},
    attributes: new Map<string, string>(),
    textContent: '',
    type: '',
    value: '',
    accept: '',
    files: null,
    disabled: false,
    removed: false,
    appendChild(child: FakeElement) {
      children.push(child);
      child.parentNode = element;
      return child;
    },
    append(...next: FakeElement[]) {
      for (const child of next) element.appendChild(child);
    },
    replaceChildren(...next: FakeElement[]) {
      for (const child of children.splice(0, children.length)) child.parentNode = null;
      for (const child of next) element.appendChild(child);
    },
    remove() {
      const parent = element.parentNode;
      if (parent !== null) {
        const index = parent.children.indexOf(element);
        if (index >= 0) parent.children.splice(index, 1);
        element.parentNode = null;
      }
      element.removed = true;
    },
    setAttribute(name: string, value: string) {
      element.attributes.set(name, value);
    },
    getAttribute(name: string) {
      return element.attributes.get(name) ?? null;
    },
    addEventListener(name: string, listener: Listener) {
      listeners.set(name, [...(listeners.get(name) ?? []), listener]);
    },
    removeEventListener(name: string, listener: Listener) {
      listeners.set(name, (listeners.get(name) ?? []).filter((entry) => entry !== listener));
    },
    click() {
      for (const listener of [...(listeners.get('click') ?? [])]) {
        listener({preventDefault() {}, stopPropagation() {}});
      }
    },
    keyDown(key: string) {
      element.dispatch('keydown', {key});
    },
    dispatch(name: string, event: Record<string, unknown> = {}) {
      for (const listener of [...(listeners.get(name) ?? [])]) {
        listener({...event, preventDefault() {}, stopPropagation() {}});
      }
    }
  };
  return element;
}

export function fakeDocument(): Document {
  return {
    body: fakeElement('body'),
    createElement: (tagName: string) => fakeElement(tagName)
  } as unknown as Document;
}

export function descendants(element: FakeElement): FakeElement[] {
  return [element, ...element.children.flatMap((child) => descendants(child))];
}

export function buttonsWithText(element: FakeElement, text: string): FakeElement[] {
  return descendants(element).filter(
    (candidate) => candidate.tagName === 'button' && candidate.textContent === text
  );
}

export function rowFor(element: FakeElement, id: string): FakeElement | undefined {
  return descendants(element).find((candidate) => candidate.getAttribute('data-dsl-file-id') === id);
}
