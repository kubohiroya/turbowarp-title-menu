import type {CacheEntry} from '@kubohiroya/turbowarp-extension-loader/indexeddb-cache';
import {describe, expect, it} from 'vitest';

import {
  cacheAssetRowId,
  cacheAssetRows,
  cacheAssetTotals,
  cacheClaimsFor,
  estimateCacheRelease,
  pruneCacheSelection,
  queryCacheAssets
} from '../src/cache-asset-model';

const one = 'https://example.com/p/one';
const two = 'https://example.com/p/two';
const cat = 'a'.repeat(64);
const pop = 'b'.repeat(64);
const lib = 'c'.repeat(64);

const entries: CacheEntry[] = [
  {
    key: cat,
    bytes: 1000,
    originalBytes: 3000,
    lastAccess: 30,
    claims: [
      {bucket: one, lastAccess: 30},
      {bucket: two, lastAccess: 10}
    ],
    labels: [
      {bucket: one, ref: 'costume:cat', kind: 'costume', name: 'cat.svg', url: 'https://assets.example/cat.svg', projectName: 'One', observedAt: 1},
      {bucket: two, ref: 'backdrop:wall', kind: 'backdrop', name: 'wall', url: 'https://assets.example/wall.svg', urlRedacted: true, observedAt: 1}
    ]
  },
  {key: pop, bytes: 200, originalBytes: 400, lastAccess: 20, claims: [{bucket: one, lastAccess: 20}], labels: []},
  {
    key: lib,
    bytes: 500,
    originalBytes: 900,
    lastAccess: 5,
    claims: [{bucket: 'shared', lastAccess: 5}],
    labels: [{bucket: 'shared', ref: 'extension:lib', kind: 'extension', name: 'Lib', observedAt: 1}]
  }
];

describe('cache asset rows', () => {
  const rows = cacheAssetRows(entries, (bucket) => (bucket === two ? 'Two (host title)' : undefined));

  it('makes one row per project that uses a copy, with that project\'s own labels', () => {
    expect(rows.map((row) => row.id)).toEqual([
      cacheAssetRowId(one, cat),
      cacheAssetRowId(two, cat),
      cacheAssetRowId(one, pop),
      cacheAssetRowId('shared', lib)
    ]);
    expect(rows[0]).toMatchObject({names: ['cat.svg'], kinds: ['costume'], projectTitle: 'One', uses: 2});
    expect(rows[1]).toMatchObject({names: ['wall'], kinds: ['backdrop'], projectTitle: 'Two (host title)', urlRedacted: true});
    // An entry stored before labels existed is listed with nothing recorded, not hidden.
    expect(rows[2]).toMatchObject({names: [], kinds: [], urls: []});
    expect(rows[3]).toMatchObject({shared: true});
  });

  it('counts each stored copy once in totals', () => {
    expect(cacheAssetTotals(rows)).toEqual({uses: 4, entries: 3, bytes: 1700});
  });

  it('searches names, addresses, projects and digests, and filters by kind and project', () => {
    expect(queryCacheAssets(rows, {text: 'WALL'}).map((row) => row.bucket)).toEqual([two]);
    expect(queryCacheAssets(rows, {text: 'assets.example'})).toHaveLength(2);
    expect(queryCacheAssets(rows, {text: 'host title'})).toHaveLength(1);
    expect(queryCacheAssets(rows, {text: 'bbbbbb'}).map((row) => row.key)).toEqual([pop]);
    expect(queryCacheAssets(rows, {kind: 'unknown'}).map((row) => row.key)).toEqual([pop]);
    expect(queryCacheAssets(rows, {bucket: 'shared'}).map((row) => row.key)).toEqual([lib]);
  });

  it('sorts both ways with a stable order and unknown values last', () => {
    const byName = queryCacheAssets(rows, {sort: 'name', direction: 'ascending'}).map((row) => row.names[0] ?? '-');
    expect(byName).toEqual(['cat.svg', 'Lib', 'wall', '-']);
    const byNameDown = queryCacheAssets(rows, {sort: 'name', direction: 'descending'}).map((row) => row.names[0] ?? '-');
    expect(byNameDown).toEqual(['wall', 'Lib', 'cat.svg', '-']);
    // Two rows of the same copy have the same size; the digest and bucket keep their order fixed.
    const bySize = queryCacheAssets(rows, {sort: 'size'}).map((row) => row.id);
    expect(bySize).toEqual([cacheAssetRowId(one, cat), cacheAssetRowId(two, cat), cacheAssetRowId('shared', lib), cacheAssetRowId(one, pop)]);
    expect(queryCacheAssets(rows).map((row) => row.lastAccess)).toEqual([30, 20, 10, 5]);
  });

  it('estimates only copies whose every use is selected as freed', () => {
    const onlyOne = new Set([cacheAssetRowId(one, cat), cacheAssetRowId(one, pop)]);
    expect(estimateCacheRelease(rows, onlyOne)).toEqual({uses: 2, entries: 2, bytes: 1200, freedBytes: 200, keptEntries: 1});
    const both = new Set([...onlyOne, cacheAssetRowId(two, cat)]);
    expect(estimateCacheRelease(rows, both).freedBytes).toBe(1200);
    expect(cacheClaimsFor(rows, both)).toEqual([
      {bucket: one, key: cat},
      {bucket: two, key: cat},
      {bucket: one, key: pop}
    ]);
  });

  it('drops selected ids that are no longer listed', () => {
    const stale = new Set([cacheAssetRowId(one, cat), cacheAssetRowId(one, 'd'.repeat(64))]);
    expect([...pruneCacheSelection(rows, stale)]).toEqual([cacheAssetRowId(one, cat)]);
  });
});
