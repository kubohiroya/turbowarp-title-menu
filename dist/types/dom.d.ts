export type DomDocument = Document;
export type DomElement = HTMLElement;
export declare function isRecord(value: unknown): value is Record<string, unknown>;
export declare function requireDocument(value: unknown): DomDocument;
export declare function requireElement(value: unknown, name: string): DomElement;
export declare function ensureRelativeMount(mount: DomElement): () => void;
export declare function invokeSafely(operation: () => unknown | Promise<unknown>, onError?: (error: unknown) => void): void;
