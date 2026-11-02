import { SHARED_BUCKET } from '@kubohiroya/turbowarp-extension-loader/indexeddb-cache';
/**
 * A read-and-release view over the extension bytes the Loader caches in IndexedDB.
 *
 * Every operation goes through `@kubohiroya/turbowarp-extension-loader/indexeddb-cache`. This
 * package never opens that database by name and never names its object stores: a second package
 * that knew the schema would be a second place to change when the schema moves, and the
 * cross-layer mismatch that follows is a bug this family has already paid for more than once.
 * The Loader owns the store; this module owns only the screen in front of it.
 *
 * What the cache records is a *claim*, not ownership. Entries are addressed by the SHA-256 of
 * their bytes, so one copy can be claimed by several projects, and the cache does not record who
 * fetched it first. Releasing a project therefore means "drop the digests this project named",
 * which may take bytes another project would have reused. Nothing is lost for good — a dropped
 * digest is fetched again on the next open — and the wording on screen promises no more than that.
 */
export type ExtensionCacheErrorCode = 'unavailable' | 'failed';
export declare class ExtensionCacheError extends Error {
    readonly code: ExtensionCacheErrorCode;
    constructor(code: ExtensionCacheErrorCode, message: string, cause?: unknown);
}
/** One bucket of cached bytes: a project that claims them, or the shared bucket. */
export interface CachedProjectSummary {
    /** The bucket name the Loader filed the claims under: a project URI, or the shared bucket. */
    readonly bucket: string;
    /** True for the bucket that belongs to no one project, which carries no URI to show. */
    readonly shared: boolean;
    /** A human-readable name a host recorded for this URI. Self-declared and unverified. */
    readonly title?: string;
    readonly entries: number;
    readonly bytes: number;
}
/** One cached digest as it is claimed by one bucket. */
export interface CachedDigestSummary {
    /** The SHA-256 digest of the extension bytes, which is also the cache key. */
    readonly key: string;
    /** Stored (compressed) size, which is what the quota counts. */
    readonly bytes: number;
    /** Size of the JavaScript the digest decompresses to. */
    readonly originalBytes: number;
    readonly lastAccess: number;
}
/** What a release actually did, so the screen can report it instead of guessing. */
export interface CacheReleaseResult {
    readonly released: number;
    readonly freed: number;
}
export interface ExtensionCacheTotals {
    readonly entries: number;
    readonly bytes: number;
}
export interface ExtensionCacheOptions {
    readonly indexedDB?: IDBFactory;
    /**
     * The database the Loader was configured with, when the host chose one.
     *
     * Left out, the Loader's own default applies. This module deliberately does not spell that
     * default: knowing the name is the Loader's business, and a copy here would be one more thing
     * to keep in step.
     */
    readonly databaseName?: string;
    /**
     * A title for one bucket, read at list time.
     *
     * Bucket names are project URIs, and a project URI is deliberately opaque — a UUID path, so
     * that it does not have to change when the project is renamed. Nobody reads that; people read
     * titles. The cache cannot supply one, so the host does, and passing a lookup the host keeps
     * updating is enough because it is consulted on every listing.
     *
     * The screen never fetches the URI to discover a title. A project URI serves nothing until its
     * author publishes, so an unpublished project answers 404 — and a screen that treated that as
     * meaningful would invite operators to clear the cache of every project still being written.
     */
    titleFor?(bucket: string): string | undefined;
}
export interface ExtensionCache {
    /** Every bucket that holds something, most storage first, with the shared bucket at the top. */
    listProjects(): Promise<CachedProjectSummary[]>;
    /** What one bucket claims, most recently used first. */
    listDigests(bucket: string): Promise<CachedDigestSummary[]>;
    /** Drop every digest one bucket claims; bytes another bucket still claims stay. */
    releaseProject(bucket: string): Promise<CacheReleaseResult>;
    /** Drop named digests from one bucket, under the same rule. */
    releaseDigests(bucket: string, keys: readonly string[]): Promise<CacheReleaseResult>;
    totals(): Promise<ExtensionCacheTotals>;
    close(): Promise<void>;
}
export { SHARED_BUCKET };
export declare function createExtensionCache(options?: ExtensionCacheOptions): ExtensionCache;
