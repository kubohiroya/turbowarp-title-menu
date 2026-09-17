import {IDBFactory} from 'fake-indexeddb';
import {beforeEach, describe, expect, it} from 'vitest';

import {createDslStore, DslStoreError, type DslStore} from '../src/dsl-store';

let store: DslStore;
let clock: number;

function createStore(overrides: Parameters<typeof createDslStore>[0] = {}) {
  let sequence = 0;
  return createDslStore({
    indexedDB: new IDBFactory(),
    now: () => new Date(clock),
    createId: () => `id-${++sequence}`,
    ...overrides
  });
}

beforeEach(() => {
  clock = Date.UTC(2026, 0, 1);
  store = createStore();
});

function tick(milliseconds = 1000): void {
  clock += milliseconds;
}

describe('createDslStore', () => {
  it('refuses to start without IndexedDB', () => {
    expect(() => createDslStore({indexedDB: undefined as unknown as IDBFactory})).toThrow(DslStoreError);
  });
});

describe('save', () => {
  it('stores the source with its byte length and timestamps', async () => {
    const record = await store.save({name: 'stage.yaml', source: 'a: 1'});

    expect(record).toMatchObject({
      id: 'id-1',
      name: 'stage.yaml',
      source: 'a: 1',
      byteLength: 4,
      savedAt: new Date(clock).toISOString(),
      updatedAt: new Date(clock).toISOString()
    });
  });

  it('measures the byte length rather than the character count', async () => {
    const record = await store.save({name: 'ja.yaml', source: 'あ'});
    expect(record.byteLength).toBe(3);
  });

  it('updates a file with the same name in place and keeps its first saved time', async () => {
    const first = await store.save({name: 'stage.yaml', source: 'a: 1'});
    tick();
    const second = await store.save({name: 'stage.yaml', source: 'a: 2'});

    expect(second.id).toBe(first.id);
    expect(second.savedAt).toBe(first.savedAt);
    expect(second.updatedAt).not.toBe(first.updatedAt);
    expect(await store.count()).toBe(1);
  });

  it('trims the name it stores', async () => {
    const record = await store.save({name: '  stage.yaml  ', source: ''});
    expect(record.name).toBe('stage.yaml');
  });

  it('rejects an empty name', async () => {
    await expect(store.save({name: '   ', source: 'a'})).rejects.toMatchObject({code: 'invalid-name'});
  });

  it('rejects a name containing control characters', async () => {
    const name = `stage${String.fromCharCode(9)}.yaml`;
    await expect(store.save({name, source: 'a'})).rejects.toMatchObject({code: 'invalid-name'});
  });

  it('rejects a source over the configured byte limit', async () => {
    const limited = createStore({maxSourceBytes: 4});
    await expect(limited.save({name: 'big.yaml', source: 'abcde'})).rejects.toMatchObject({
      code: 'too-large'
    });
  });

  it('refuses a new file once the store is full instead of evicting one', async () => {
    const limited = createStore({maxFileCount: 2});
    await limited.save({name: 'one.yaml', source: '1'});
    await limited.save({name: 'two.yaml', source: '2'});

    await expect(limited.save({name: 'three.yaml', source: '3'})).rejects.toMatchObject({
      code: 'too-many'
    });
    expect(await limited.count()).toBe(2);
    expect((await limited.get('id-1'))?.source).toBe('1');
  });

  it('still updates an existing file when the store is full', async () => {
    const limited = createStore({maxFileCount: 1});
    await limited.save({name: 'one.yaml', source: '1'});
    await expect(limited.save({name: 'one.yaml', source: '2'})).resolves.toMatchObject({source: '2'});
  });
});

describe('list', () => {
  beforeEach(async () => {
    await store.save({name: 'beta.yaml', source: 'xx'});
    tick();
    await store.save({name: 'alpha.yaml', source: 'xxxx'});
    tick();
    await store.save({name: 'gamma.yaml', source: 'x'});
  });

  it('omits the source from summaries', async () => {
    const [first] = await store.list();
    expect(first).toBeDefined();
    expect(first).not.toHaveProperty('source');
  });

  it('sorts by name', async () => {
    const ascending = await store.list({field: 'name', direction: 'asc'});
    expect(ascending.map((file) => file.name)).toEqual(['alpha.yaml', 'beta.yaml', 'gamma.yaml']);

    const descending = await store.list({field: 'name', direction: 'desc'});
    expect(descending.map((file) => file.name)).toEqual(['gamma.yaml', 'beta.yaml', 'alpha.yaml']);
  });

  it('sorts by size', async () => {
    const ascending = await store.list({field: 'byteLength', direction: 'asc'});
    expect(ascending.map((file) => file.byteLength)).toEqual([1, 2, 4]);

    const descending = await store.list({field: 'byteLength', direction: 'desc'});
    expect(descending.map((file) => file.byteLength)).toEqual([4, 2, 1]);
  });

  it('sorts by update time, newest first by default', async () => {
    const byDefault = await store.list();
    expect(byDefault.map((file) => file.name)).toEqual(['gamma.yaml', 'alpha.yaml', 'beta.yaml']);

    const oldestFirst = await store.list({field: 'updatedAt', direction: 'asc'});
    expect(oldestFirst.map((file) => file.name)).toEqual(['beta.yaml', 'alpha.yaml', 'gamma.yaml']);
  });

  it('breaks a size tie by name so the order stays stable', async () => {
    const tied = createStore();
    await tied.save({name: 'b.yaml', source: 'xx'});
    await tied.save({name: 'a.yaml', source: 'xx'});
    const listed = await tied.list({field: 'byteLength', direction: 'asc'});
    expect(listed.map((file) => file.name)).toEqual(['a.yaml', 'b.yaml']);
  });
});

describe('rename', () => {
  it('changes the name and the update time but keeps the source', async () => {
    const saved = await store.save({name: 'stage.yaml', source: 'a: 1'});
    tick();

    const renamed = await store.rename(saved.id, 'show.yaml');
    expect(renamed.name).toBe('show.yaml');
    expect(renamed.updatedAt).not.toBe(saved.updatedAt);
    expect((await store.get(saved.id))?.source).toBe('a: 1');
  });

  it('accepts renaming a file to the name it already has', async () => {
    const saved = await store.save({name: 'stage.yaml', source: 'a'});
    await expect(store.rename(saved.id, 'stage.yaml')).resolves.toMatchObject({name: 'stage.yaml'});
  });

  it('rejects a name another file already uses', async () => {
    await store.save({name: 'one.yaml', source: '1'});
    const second = await store.save({name: 'two.yaml', source: '2'});

    await expect(store.rename(second.id, 'one.yaml')).rejects.toMatchObject({code: 'name-taken'});
    expect((await store.get(second.id))?.name).toBe('two.yaml');
  });

  it('rejects an unknown file', async () => {
    await expect(store.rename('missing', 'x.yaml')).rejects.toMatchObject({code: 'not-found'});
  });
});

describe('remove and clear', () => {
  it('deletes only the requested file', async () => {
    const first = await store.save({name: 'one.yaml', source: '1'});
    await store.save({name: 'two.yaml', source: '2'});

    await store.remove(first.id);

    expect(await store.get(first.id)).toBeNull();
    expect((await store.list()).map((file) => file.name)).toEqual(['two.yaml']);
  });

  it('forgets the last opened pointer when that file is deleted', async () => {
    const saved = await store.save({name: 'one.yaml', source: '1'});
    await store.markOpened(saved.id);

    await store.remove(saved.id);

    expect(await store.lastOpened()).toBeNull();
  });

  it('keeps the last opened pointer when another file is deleted', async () => {
    const kept = await store.save({name: 'one.yaml', source: '1'});
    const dropped = await store.save({name: 'two.yaml', source: '2'});
    await store.markOpened(kept.id);

    await store.remove(dropped.id);

    expect((await store.lastOpened())?.id).toBe(kept.id);
  });

  it('empties the store', async () => {
    const saved = await store.save({name: 'one.yaml', source: '1'});
    await store.markOpened(saved.id);

    await store.clear();

    expect(await store.count()).toBe(0);
    expect(await store.lastOpened()).toBeNull();
  });
});

describe('last opened', () => {
  it('is empty before anything is opened', async () => {
    expect(await store.lastOpened()).toBeNull();
  });

  it('returns the whole record, source included', async () => {
    const saved = await store.save({name: 'one.yaml', source: 'a: 1'});
    await store.markOpened(saved.id);

    expect(await store.lastOpened()).toMatchObject({id: saved.id, source: 'a: 1'});
  });

  it('rejects marking a file that is not stored', async () => {
    await expect(store.markOpened('missing')).rejects.toMatchObject({code: 'not-found'});
  });
});
