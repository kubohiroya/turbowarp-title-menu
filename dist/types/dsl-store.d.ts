/**
 * Multi-file DSL storage backed by IndexedDB.
 *
 * The previous single-slot `localStorage` design could only remember the last opened file. A venue
 * keeps several performances side by side, so records are addressed by a stable id, names are unique
 * so a list stays meaningful, and the store never deletes a record on its own: exceeding the file
 * limit fails loudly instead of silently dropping someone's DSL.
 */
export interface DslFileRecord {
    readonly id: string;
    readonly name: string;
    readonly source: string;
    readonly byteLength: number;
    readonly savedAt: string;
    readonly updatedAt: string;
}
export type DslFileSummary = Omit<DslFileRecord, 'source'>;
export type DslSortField = 'name' | 'updatedAt' | 'byteLength';
export type DslSortDirection = 'asc' | 'desc';
export interface DslSort {
    readonly field: DslSortField;
    readonly direction: DslSortDirection;
}
export type DslStoreErrorCode = 'unavailable' | 'invalid-name' | 'invalid-source' | 'name-taken' | 'too-large' | 'too-many' | 'not-found' | 'quota' | 'failed';
export declare class DslStoreError extends Error {
    readonly code: DslStoreErrorCode;
    constructor(code: DslStoreErrorCode, message: string, cause?: unknown);
}
export interface DslStoreOptions {
    readonly indexedDB?: IDBFactory;
    readonly databaseName?: string;
    readonly maxSourceBytes?: number;
    readonly maxFileCount?: number;
    readonly now?: () => Date;
    readonly createId?: () => string;
}
export interface DslStore {
    readonly databaseName: string;
    list(sort?: DslSort): Promise<DslFileSummary[]>;
    count(): Promise<number>;
    get(id: string): Promise<DslFileRecord | null>;
    save(file: {
        name: string;
        source: string;
    }): Promise<DslFileRecord>;
    rename(id: string, name: string): Promise<DslFileRecord>;
    remove(id: string): Promise<void>;
    clear(): Promise<void>;
    lastOpened(): Promise<DslFileRecord | null>;
    markOpened(id: string): Promise<void>;
    close(): void;
}
export declare const defaultDslSort: DslSort;
export declare function createDslStore(options?: DslStoreOptions): DslStore;
/** Reads a picked browser file into a record shape the store accepts. */
export declare function readDslFile(file: File, maxSourceBytes?: number): Promise<{
    name: string;
    source: string;
}>;
