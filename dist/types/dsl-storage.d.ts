export interface DslFileRecord {
    name: string;
    source: string;
    savedAt: string;
}
export interface DslStorageOptions {
    storage?: Storage;
    namespace?: string;
    maxSourceBytes?: number;
}
export interface DslStorage {
    readonly key: string;
    save(file: Pick<DslFileRecord, 'name' | 'source'>): DslFileRecord;
    load(): DslFileRecord | null;
    clear(): void;
}
export declare function createDslStorage(options?: DslStorageOptions): DslStorage;
export declare function readDslFile(file: File, maxSourceBytes?: number): Promise<DslFileRecord>;
