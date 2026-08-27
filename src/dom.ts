export type DomDocument = Document;
export type DomElement = HTMLElement;

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function requireDocument(value: unknown): DomDocument {
  if (!isRecord(value) || typeof value.createElement !== 'function') {
    throw new TypeError('document must provide createElement');
  }
  return value as unknown as DomDocument;
}

export function requireElement(value: unknown, name: string): DomElement {
  if (!isRecord(value) || typeof value.appendChild !== 'function') {
    throw new TypeError(`${name} must be a DOM element`);
  }
  return value as unknown as DomElement;
}

export function ensureRelativeMount(mount: DomElement): () => void {
  const previous = mount.style.position;
  if (previous === '' || previous === 'static') {
    mount.style.position = 'relative';
    return () => {
      mount.style.position = previous;
    };
  }
  return () => {};
}

export function invokeSafely(operation: () => unknown | Promise<unknown>, onError?: (error: unknown) => void): void {
  try {
    Promise.resolve(operation()).catch((error: unknown) => onError?.(error));
  } catch (error) {
    onError?.(error);
  }
}
