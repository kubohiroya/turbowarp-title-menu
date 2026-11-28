/**
 * The table model behind the cache manager: rows, search, filters, sort, selection and totals.
 *
 * It holds no DOM and no storage. It takes what the Loader's `listEntries()` returns and turns it
 * into what a person can read: one row per project that uses one stored copy, with the names,
 * kinds and addresses that project recorded for it. Everything about what is stored stays the
 * Loader's; this module only decides how it is shown and what a selection means.
 *
 * Two numbers are kept apart on purpose. A row's `bytes` is the size of the stored copy it uses,
 * and the same copy appears once per project that uses it, so adding rows up overstates what the
 * cache holds. Totals therefore count each stored copy once, and "what a release frees" counts
 * only copies whose every use is selected.
 */
import type { CacheEntry, CacheEntryKind } from '@kubohiroya/turbowarp-extension-loader/indexeddb-cache';
/** One project's use of one stored copy. */
export interface CacheAssetRow {
    /** Stable across listings: the bucket and the digest. */
    readonly id: string;
    readonly key: string;
    /** A project URI, or the shared bucket. */
    readonly bucket: string;
    readonly shared: boolean;
    /** What the host or the project called the project. Self-declared. */
    readonly projectTitle?: string;
    /** Names this project recorded for the copy, in the order recorded. Empty when none. */
    readonly names: readonly string[];
    /** Kinds this project recorded. Empty means unknown. */
    readonly kinds: readonly CacheEntryKind[];
    readonly urls: readonly string[];
    /** Some recorded address had credentials, a query or a fragment removed. */
    readonly urlRedacted: boolean;
    readonly refs: readonly string[];
    /** Compressed size of the one stored copy this row uses. */
    readonly bytes: number;
    readonly originalBytes: number;
    readonly lastAccess: number;
    /** How many projects (including this one) use the same copy. */
    readonly uses: number;
}
export type CacheAssetSortColumn = 'name' | 'kind' | 'project' | 'size' | 'lastAccess';
export type CacheAssetSortDirection = 'ascending' | 'descending';
export interface CacheAssetQuery {
    /** Matched, ignoring case, against names, addresses, project titles and URIs, and digests. */
    readonly text?: string;
    /** Only rows with this kind; `unknown` matches rows that recorded none. */
    readonly kind?: CacheEntryKind | 'unknown';
    /** Only rows of this bucket. Use the shared bucket's name for the shared area. */
    readonly bucket?: string;
    readonly sort?: CacheAssetSortColumn;
    readonly direction?: CacheAssetSortDirection;
}
export interface CacheAssetTotals {
    /** Rows: uses of stored copies. */
    readonly uses: number;
    /** Distinct stored copies. */
    readonly entries: number;
    /** What those copies occupy, each counted once. */
    readonly bytes: number;
}
export interface CacheReleaseEstimate extends CacheAssetTotals {
    /** What releasing these uses frees: copies whose every use is among them. */
    readonly freedBytes: number;
    /** Copies that stay because another project still uses them. */
    readonly keptEntries: number;
}
export declare const cacheAssetRowId: (bucket: string, key: string) => string;
/** Turn the Loader's listing into rows: one per project that claims a stored copy. */
export declare function cacheAssetRows(entries: readonly CacheEntry[], titleFor?: (bucket: string) => string | undefined): CacheAssetRow[];
/**
 * Filter and sort rows. Rows that compare equal keep a fixed order, by digest then bucket, so the
 * table does not reshuffle between listings. Rows with no value for the sorted column go last in
 * either direction, because "unknown" is not the smallest name.
 */
export declare function queryCacheAssets(rows: readonly CacheAssetRow[], query?: CacheAssetQuery): CacheAssetRow[];
/** Totals that count each stored copy once, however many rows use it. */
export declare function cacheAssetTotals(rows: readonly CacheAssetRow[]): CacheAssetTotals;
/**
 * What releasing the selected uses would do, judged from the listing on screen. The Loader decides
 * for real and reports what it did; this is the estimate shown before asking.
 */
export declare function estimateCacheRelease(all: readonly CacheAssetRow[], selected: ReadonlySet<string>): CacheReleaseEstimate;
/** Drop selected ids that are no longer listed, so a stale selection never releases anything. */
export declare function pruneCacheSelection(rows: readonly CacheAssetRow[], selected: ReadonlySet<string>): Set<string>;
/** The claims a selection releases, in the shape the Loader takes. */
export declare function cacheClaimsFor(rows: readonly CacheAssetRow[], selected: ReadonlySet<string>): {
    bucket: string;
    key: string;
}[];
