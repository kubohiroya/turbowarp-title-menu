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

export type DslStoreErrorCode =
  | 'unavailable'
  | 'invalid-name'
  | 'invalid-source'
  | 'name-taken'
  | 'too-large'
  | 'too-many'
  | 'not-found'
  | 'quota'
  | 'failed';

export class DslStoreError extends Error {
  public readonly code: DslStoreErrorCode;

  public constructor(code: DslStoreErrorCode, message: string, cause?: unknown) {
    super(message, cause === undefined ? undefined : {cause});
    this.name = 'DslStoreError';
    this.code = code;
  }
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
  save(file: {name: string; source: string}): Promise<DslFileRecord>;
  rename(id: string, name: string): Promise<DslFileRecord>;
  remove(id: string): Promise<void>;
  clear(): Promise<void>;
  lastOpened(): Promise<DslFileRecord | null>;
  markOpened(id: string): Promise<void>;
  close(): void;
}

export const defaultDslSort: DslSort = Object.freeze({field: 'updatedAt', direction: 'desc'});

const fileStoreName = 'files';
const metaStoreName = 'meta';
const lastOpenedKey = 'last-opened';
const nameIndexName = 'by-name';
const encoder = new TextEncoder();
const maximumNameLength = 200;
/** Rejects control characters so a name cannot break the dialog's text rendering. */
function hasControlCharacter(value: string): boolean {
  for (const character of value) {
    const code = character.codePointAt(0) ?? 0;
    if (code < 0x20 || code === 0x7f) return true;
  }
  return false;
}

function normalizeName(value: unknown): string {
  if (typeof value !== 'string') throw new DslStoreError('invalid-name', 'DSL name must be a string.');
  const name = value.trim();
  if (name.length === 0) throw new DslStoreError('invalid-name', 'DSL name must not be empty.');
  if (name.length > maximumNameLength) {
    throw new DslStoreError('invalid-name', `DSL name must be at most ${maximumNameLength} characters.`);
  }
  if (hasControlCharacter(name)) {
    throw new DslStoreError('invalid-name', 'DSL name must not contain control characters.');
  }
  return name;
}

function request<T>(input: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    input.onsuccess = () => resolve(input.result);
    input.onerror = () => reject(toStoreError(input.error));
  });
}

function transactionDone(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onabort = () => reject(toStoreError(transaction.error));
    transaction.onerror = () => reject(toStoreError(transaction.error));
  });
}

function toStoreError(cause: unknown): DslStoreError {
  const name = (cause as {name?: string} | null)?.name;
  if (name === 'QuotaExceededError') {
    return new DslStoreError('quota', 'Browser storage is full. Delete a saved DSL file first.', cause);
  }
  if (name === 'ConstraintError') {
    return new DslStoreError('name-taken', 'A DSL file with that name already exists.', cause);
  }
  return new DslStoreError('failed', 'The DSL storage operation failed.', cause);
}

function compareSummaries(sort: DslSort) {
  const direction = sort.direction === 'asc' ? 1 : -1;
  return (left: DslFileSummary, right: DslFileSummary): number => {
    if (sort.field === 'name') {
      return direction * left.name.localeCompare(right.name, undefined, {numeric: true});
    }
    if (sort.field === 'byteLength') {
      return direction * (left.byteLength - right.byteLength) || left.name.localeCompare(right.name);
    }
    return direction * left.updatedAt.localeCompare(right.updatedAt) || left.name.localeCompare(right.name);
  };
}

function toSummary(record: DslFileRecord): DslFileSummary {
  return {
    id: record.id,
    name: record.name,
    byteLength: record.byteLength,
    savedAt: record.savedAt,
    updatedAt: record.updatedAt
  };
}

export function createDslStore(options: DslStoreOptions = {}): DslStore {
  const factory = options.indexedDB ?? globalThis.indexedDB;
  if (factory === undefined || typeof factory.open !== 'function') {
    throw new DslStoreError('unavailable', 'IndexedDB is not available in this environment.');
  }
  const databaseName = options.databaseName ?? 'turbowarp-title-menu';
  const maxSourceBytes = options.maxSourceBytes ?? 1024 * 1024;
  const maxFileCount = options.maxFileCount ?? 64;
  const now = options.now ?? (() => new Date());
  const createId = options.createId ?? defaultCreateId;

  let connection: Promise<IDBDatabase> | null = null;

  function open(): Promise<IDBDatabase> {
    connection ??= new Promise<IDBDatabase>((resolve, reject) => {
      const opening = factory.open(databaseName, 1);
      opening.onupgradeneeded = () => {
        const database = opening.result;
        if (!database.objectStoreNames.contains(fileStoreName)) {
          const files = database.createObjectStore(fileStoreName, {keyPath: 'id'});
          files.createIndex(nameIndexName, 'name', {unique: true});
        }
        if (!database.objectStoreNames.contains(metaStoreName)) {
          database.createObjectStore(metaStoreName, {keyPath: 'key'});
        }
      };
      opening.onsuccess = () => resolve(opening.result);
      opening.onerror = () => reject(toStoreError(opening.error));
      opening.onblocked = () =>
        reject(new DslStoreError('failed', 'Another tab is upgrading the DSL database.'));
    });
    return connection;
  }

  async function readAll(): Promise<DslFileRecord[]> {
    const database = await open();
    const transaction = database.transaction(fileStoreName, 'readonly');
    const records = await request<DslFileRecord[]>(
      transaction.objectStore(fileStoreName).getAll() as IDBRequest<DslFileRecord[]>
    );
    await transactionDone(transaction);
    return records;
  }

  async function readOne(id: string): Promise<DslFileRecord | null> {
    const database = await open();
    const transaction = database.transaction(fileStoreName, 'readonly');
    const record = await request<DslFileRecord | undefined>(
      transaction.objectStore(fileStoreName).get(id) as IDBRequest<DslFileRecord | undefined>
    );
    await transactionDone(transaction);
    return record ?? null;
  }

  return Object.freeze({
    databaseName,

    async list(sort: DslSort = defaultDslSort) {
      const records = await readAll();
      return records.map(toSummary).sort(compareSummaries(sort));
    },

    async count() {
      const database = await open();
      const transaction = database.transaction(fileStoreName, 'readonly');
      const total = await request(transaction.objectStore(fileStoreName).count());
      await transactionDone(transaction);
      return total;
    },

    get(id: string) {
      return readOne(id);
    },

    async save(file: {name: string; source: string}) {
      const name = normalizeName(file.name);
      if (typeof file.source !== 'string') {
        throw new DslStoreError('invalid-source', 'DSL source must be a string.');
      }
      const byteLength = encoder.encode(file.source).byteLength;
      if (byteLength > maxSourceBytes) {
        throw new DslStoreError('too-large', `DSL source exceeds ${maxSourceBytes} bytes.`);
      }

      const database = await open();
      const transaction = database.transaction(fileStoreName, 'readwrite');
      const files = transaction.objectStore(fileStoreName);
      const existing = await request<DslFileRecord | undefined>(
        files.index(nameIndexName).get(name) as IDBRequest<DslFileRecord | undefined>
      );
      if (existing === undefined) {
        const total = await request(files.count());
        if (total >= maxFileCount) {
          transaction.abort();
          throw new DslStoreError('too-many', `The DSL store already holds ${maxFileCount} files.`);
        }
      }
      const timestamp = now().toISOString();
      const record: DslFileRecord = {
        id: existing?.id ?? createId(),
        name,
        source: file.source,
        byteLength,
        savedAt: existing?.savedAt ?? timestamp,
        updatedAt: timestamp
      };
      await request(files.put(record));
      await transactionDone(transaction);
      return record;
    },

    async rename(id: string, nextName: string) {
      const name = normalizeName(nextName);
      const database = await open();
      const transaction = database.transaction(fileStoreName, 'readwrite');
      const files = transaction.objectStore(fileStoreName);
      const existing = await request<DslFileRecord | undefined>(
        files.get(id) as IDBRequest<DslFileRecord | undefined>
      );
      if (existing === undefined) {
        transaction.abort();
        throw new DslStoreError('not-found', `No DSL file with id ${id}.`);
      }
      if (existing.name !== name) {
        const taken = await request<DslFileRecord | undefined>(
          files.index(nameIndexName).get(name) as IDBRequest<DslFileRecord | undefined>
        );
        if (taken !== undefined) {
          transaction.abort();
          throw new DslStoreError('name-taken', `A DSL file named ${name} already exists.`);
        }
      }
      const record: DslFileRecord = {...existing, name, updatedAt: now().toISOString()};
      await request(files.put(record));
      await transactionDone(transaction);
      return record;
    },

    async remove(id: string) {
      const database = await open();
      const transaction = database.transaction([fileStoreName, metaStoreName], 'readwrite');
      await request(transaction.objectStore(fileStoreName).delete(id));
      const meta = transaction.objectStore(metaStoreName);
      const pointer = await request<{key: string; id: string} | undefined>(
        meta.get(lastOpenedKey) as IDBRequest<{key: string; id: string} | undefined>
      );
      if (pointer?.id === id) await request(meta.delete(lastOpenedKey));
      await transactionDone(transaction);
    },

    async clear() {
      const database = await open();
      const transaction = database.transaction([fileStoreName, metaStoreName], 'readwrite');
      await request(transaction.objectStore(fileStoreName).clear());
      await request(transaction.objectStore(metaStoreName).clear());
      await transactionDone(transaction);
    },

    async lastOpened() {
      const database = await open();
      const transaction = database.transaction(metaStoreName, 'readonly');
      const pointer = await request<{key: string; id: string} | undefined>(
        transaction.objectStore(metaStoreName).get(lastOpenedKey) as IDBRequest<
          {key: string; id: string} | undefined
        >
      );
      await transactionDone(transaction);
      if (pointer === undefined) return null;
      return readOne(pointer.id);
    },

    async markOpened(id: string) {
      const record = await readOne(id);
      if (record === null) throw new DslStoreError('not-found', `No DSL file with id ${id}.`);
      const database = await open();
      const transaction = database.transaction(metaStoreName, 'readwrite');
      await request(transaction.objectStore(metaStoreName).put({key: lastOpenedKey, id}));
      await transactionDone(transaction);
    },

    close() {
      const pending = connection;
      connection = null;
      void pending?.then((database) => database.close()).catch(() => undefined);
    }
  });
}

function defaultCreateId(): string {
  const crypto = globalThis.crypto;
  if (typeof crypto?.randomUUID === 'function') return crypto.randomUUID();
  return `dsl-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/** Reads a picked browser file into a record shape the store accepts. */
export async function readDslFile(
  file: File,
  maxSourceBytes = 1024 * 1024
): Promise<{name: string; source: string}> {
  if (typeof file?.text !== 'function') {
    throw new DslStoreError('invalid-source', 'file must be a browser File.');
  }
  if (file.size > maxSourceBytes) {
    throw new DslStoreError('too-large', `DSL file exceeds ${maxSourceBytes} bytes.`);
  }
  return {name: file.name, source: await file.text()};
}
