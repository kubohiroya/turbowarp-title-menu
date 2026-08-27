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

const encoder = new TextEncoder();

function requireStorage(value: unknown): Storage {
  if (
    typeof value !== 'object' ||
    value === null ||
    typeof (value as Storage).getItem !== 'function' ||
    typeof (value as Storage).setItem !== 'function'
  ) {
    throw new TypeError('storage must provide the Web Storage contract');
  }
  return value as Storage;
}

export function createDslStorage(options: DslStorageOptions = {}): DslStorage {
  const storage = requireStorage(options.storage ?? globalThis.localStorage);
  const namespace = options.namespace ?? 'turbowarp-title-menu';
  if (!/^[A-Za-z0-9._:-]+$/.test(namespace)) {
    throw new TypeError('namespace must contain only URL-safe identifier characters');
  }
  const maxSourceBytes = options.maxSourceBytes ?? 1024 * 1024;
  if (!Number.isSafeInteger(maxSourceBytes) || maxSourceBytes < 1) {
    throw new TypeError('maxSourceBytes must be a positive safe integer');
  }
  const key = `${namespace}:dsl-source`;

  return Object.freeze({
    key,
    save(file: Pick<DslFileRecord, 'name' | 'source'>) {
      if (typeof file.name !== 'string' || file.name.length === 0) {
        throw new TypeError('DSL file name must be a non-empty string');
      }
      if (typeof file.source !== 'string') throw new TypeError('DSL source must be a string');
      if (encoder.encode(file.source).byteLength > maxSourceBytes) {
        throw new TypeError('DSL source exceeds the configured byte limit');
      }
      const record = {name: file.name, source: file.source, savedAt: new Date().toISOString()};
      storage.setItem(key, JSON.stringify(record));
      return record;
    },
    load() {
      const raw = storage.getItem(key);
      if (raw === null) return null;
      let parsed: Partial<DslFileRecord>;
      try {
        parsed = JSON.parse(raw) as Partial<DslFileRecord>;
      } catch {
        storage.removeItem(key);
        return null;
      }
      if (
        typeof parsed.name !== 'string' ||
        typeof parsed.source !== 'string' ||
        typeof parsed.savedAt !== 'string'
      ) {
        storage.removeItem(key);
        return null;
      }
      return {name: parsed.name, source: parsed.source, savedAt: parsed.savedAt};
    },
    clear() {
      storage.removeItem(key);
    }
  });
}

export async function readDslFile(file: File, maxSourceBytes = 1024 * 1024): Promise<DslFileRecord> {
  if (!(file instanceof File)) throw new TypeError('file must be a browser File');
  if (file.size > maxSourceBytes) throw new TypeError('DSL file exceeds the configured byte limit');
  return {name: file.name, source: await file.text(), savedAt: new Date().toISOString()};
}
