import {createHash} from 'node:crypto';

import {
  createIndexedDBContentCache,
  SHARED_BUCKET
} from '@kubohiroya/turbowarp-extension-loader/indexeddb-cache';
import {IDBFactory} from 'fake-indexeddb';
import {beforeEach, describe, expect, it} from 'vitest';

import {
  createExtensionCache,
  ExtensionCacheError,
  type ExtensionCache,
  type ExtensionCacheOptions
} from '../src/extension-cache';

/**
 * These tests run against a real IndexedDB implementation and the real Loader cache.
 *
 * The screen's wording rests on how the Loader actually accounts for shared bytes — a digest
 * claimed twice survives one release — so a hand-written double would only confirm whatever this
 * package believed about it. Seeding goes through the Loader's own `put`, for the same reason.
 */
const projectA = 'https://example.com/turbowarp-plus-projects/aa/bb/one';
const projectB = 'https://example.com/turbowarp-plus-projects/cc/dd/two';

let indexedDB: IDBFactory;
let clock: number;

function digestOf(source: string): string {
  return createHash('sha256').update(source).digest('hex');
}

/** Writes bytes the way the Loader does, so the claims under test are the Loader's own. */
async function seed(appURI: string | undefined, sources: readonly string[]): Promise<string[]> {
  const cache = createIndexedDBContentCache({
    indexedDB,
    ...(appURI === undefined ? {} : {appURI}),
    now: () => (clock += 1000)
  });
  const keys: string[] = [];
  for (const source of sources) {
    const key = digestOf(source);
    await cache.put(key, new TextEncoder().encode(source));
    keys.push(key);
  }
  await cache.close();
  return keys;
}

function createCache(overrides: ExtensionCacheOptions = {}): ExtensionCache {
  return createExtensionCache({indexedDB, ...overrides});
}

beforeEach(() => {
  indexedDB = new IDBFactory();
  clock = Date.UTC(2026, 0, 1);
});

describe('listProjects', () => {
  it('reports nothing for an untouched cache', async () => {
    expect(await createCache().listProjects()).toEqual([]);
  });

  it('files bytes under the project that fetched them', async () => {
    await seed(projectA, ['alpha']);

    const [project, ...rest] = await createCache().listProjects();
    expect(rest).toEqual([]);
    expect(project).toMatchObject({bucket: projectA, shared: false, entries: 1});
    expect(project?.bytes).toBeGreaterThan(0);
  });

  it('marks the bucket that belongs to no one project', async () => {
    await seed(undefined, ['from the catalog']);

    const [project] = await createCache().listProjects();
    expect(project).toMatchObject({bucket: SHARED_BUCKET, shared: true, entries: 1});
  });

  it('leads with the shared bucket so it is not mistaken for one project', async () => {
    await seed(projectA, ['alpha', 'alpha two', 'alpha three']);
    await seed(undefined, ['catalog']);

    const buckets = (await createCache().listProjects()).map((entry) => entry.bucket);
    expect(buckets[0]).toBe(SHARED_BUCKET);
    expect(buckets).toContain(projectA);
  });

  it('puts the larger project first, because size is why the screen is open', async () => {
    await seed(projectA, ['a'.repeat(4096)]);
    await seed(projectB, ['b']);

    const buckets = (await createCache().listProjects()).map((entry) => entry.bucket);
    expect(buckets).toEqual([projectA, projectB]);
  });

  it('shows the title the host recorded for a URI', async () => {
    await seed(projectA, ['alpha']);
    const titles = new Map([[projectA, 'Kamishibai demo']]);

    const [project] = await createCache({titleFor: (bucket) => titles.get(bucket)}).listProjects();
    expect(project?.title).toBe('Kamishibai demo');
  });

  it('leaves the title out when no host recorded one', async () => {
    await seed(projectA, ['alpha']);

    const [project] = await createCache({titleFor: () => undefined}).listProjects();
    expect(project && 'title' in project).toBe(false);
  });
});

describe('listDigests', () => {
  it('lists what one project claims, most recently used first', async () => {
    const [first, second] = await seed(projectA, ['alpha', 'beta']);
    await seed(projectB, ['gamma']);

    const digests = await createCache().listDigests(projectA);
    expect(digests.map((entry) => entry.key)).toEqual([second, first]);
    expect(digests[0]?.originalBytes).toBe('beta'.length);
  });

  it('lists the shared bucket by its own name', async () => {
    const [key] = await seed(undefined, ['catalog']);

    const digests = await createCache().listDigests(SHARED_BUCKET);
    expect(digests.map((entry) => entry.key)).toEqual([key]);
  });
});

describe('releaseProject', () => {
  it('drops the digests the project names', async () => {
    await seed(projectA, ['alpha', 'beta']);
    const cache = createCache();

    const released = await cache.releaseProject(projectA);
    expect(released.released).toBe(2);
    expect(released.freed).toBeGreaterThan(0);
    expect(await cache.listProjects()).toEqual([]);
    expect(await cache.totals()).toEqual({entries: 0, bytes: 0});
  });

  /**
   * The honest half of the warning on screen: a digest two projects both claim survives, because
   * the second project did not ask to lose it. The other half — that releasing can take bytes a
   * project which has *not yet* claimed them would have reused — is not observable here, since
   * nothing records a claim before a project is opened. That is exactly why the notice promises
   * only a re-fetch rather than that no other project is affected.
   */
  it('keeps bytes a second project still claims', async () => {
    const [shared] = await seed(projectA, ['shared bytes']);
    await seed(projectB, ['shared bytes']);
    const cache = createCache();

    await cache.releaseProject(projectA);

    const buckets = await cache.listProjects();
    expect(buckets.map((entry) => entry.bucket)).toEqual([projectB]);
    expect((await cache.listDigests(projectB)).map((entry) => entry.key)).toEqual([shared]);
    expect((await cache.totals()).entries).toBe(1);
  });

  it('accounts a shared digest to both projects while both claim it', async () => {
    await seed(projectA, ['shared bytes']);
    await seed(projectB, ['shared bytes']);

    const buckets = await createCache().listProjects();
    expect(buckets.map((entry) => entry.entries)).toEqual([1, 1]);
    // One copy is stored, counted once in the total and once per claim in the list.
    expect((await createCache().totals()).entries).toBe(1);
  });
});

describe('releaseDigests', () => {
  it('drops only the named digest', async () => {
    const [first, second] = await seed(projectA, ['alpha', 'beta']);
    const cache = createCache();

    const released = await cache.releaseDigests(projectA, [first as string]);

    expect(released.released).toBe(1);
    expect((await cache.listDigests(projectA)).map((entry) => entry.key)).toEqual([second]);
  });

  it('refuses a key that is not a digest, rather than silently releasing nothing', async () => {
    await seed(projectA, ['alpha']);

    await expect(createCache().releaseDigests(projectA, ['not-a-digest'])).rejects.toThrow(TypeError);
  });
});

describe('totals', () => {
  it('counts the whole cache, not one project', async () => {
    await seed(projectA, ['alpha']);
    await seed(projectB, ['beta']);

    const totals = await createCache().totals();
    expect(totals.entries).toBe(2);
    expect(totals.bytes).toBeGreaterThan(0);
  });
});

describe('without storage', () => {
  it('reports an unavailable cache on first use rather than at construction', async () => {
    const cache = createExtensionCache({indexedDB: undefined as unknown as IDBFactory});

    await expect(cache.listProjects()).rejects.toThrow(ExtensionCacheError);
    await expect(cache.listProjects()).rejects.toMatchObject({code: 'unavailable'});
  });
});
