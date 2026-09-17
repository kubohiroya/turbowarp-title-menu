import { type DslFileSummary, type DslSort } from './dsl-store';
/**
 * The stage-mounted DSL file manager.
 *
 * The dialog owns presentation and interaction state only: sort order, which row is being renamed,
 * and which row is awaiting delete confirmation. Every storage operation is a caller-supplied
 * callback, so the same dialog works against the IndexedDB store, a test double, or a future
 * file-system backend.
 */
export interface DslFilesDialogLocaleText {
    title: string;
    add: string;
    open: string;
    rename: string;
    remove: string;
    confirmRemove: string;
    confirm: string;
    cancel: string;
    close: string;
    sortByName: string;
    sortByDate: string;
    sortBySize: string;
    empty: string;
}
export interface DslFilesDialogOptions {
    document?: Document;
    mount?: HTMLElement;
    locales: Record<string, DslFilesDialogLocaleText>;
    initialLocale?: string;
    initialSort?: DslSort;
    list(sort: DslSort): Promise<readonly DslFileSummary[]>;
    onOpen(id: string): unknown | Promise<unknown>;
    onAdd(): unknown | Promise<unknown>;
    onRename(id: string, name: string): unknown | Promise<unknown>;
    onRemove(id: string): unknown | Promise<unknown>;
    describeError?(error: unknown): string;
    formatSize?(byteLength: number): string;
    formatDate?(isoDate: string): string;
    onError?(error: unknown): void;
}
export interface DslFilesDialog {
    readonly element: HTMLElement;
    readonly locale: string;
    readonly sort: DslSort;
    show(locale?: string): Promise<string>;
    hide(): void;
    refresh(): Promise<void>;
    setLocale(locale: string): string;
    dispose(): void;
}
export declare function createDslFilesDialog(options: DslFilesDialogOptions): DslFilesDialog;
