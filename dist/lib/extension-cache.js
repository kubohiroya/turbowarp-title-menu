import { createIndexedDBContentCache, SHARED_BUCKET } from '@kubohiroya/turbowarp-extension-loader/indexeddb-cache';
export class ExtensionCacheError extends Error {
    constructor(code, message, cause) {
        super(message, cause === undefined ? undefined : { cause });
        this.name = 'ExtensionCacheError';
        this.code = code;
    }
}
export { SHARED_BUCKET };
/**
 * Compares two buckets for display.
 *
 * The shared bucket leads because it is the one row that is not a project: it holds what the
 * catalog pinned for everyone, and an operator hunting for space should see it before deciding
 * that some individual project is to blame. The rest follow by stored size, because size is the
 * only reason anyone opens this screen; the bucket name breaks ties so the order is stable
 * between listings rather than reflecting insertion order.
 */
function compareBuckets(left, right) {
    if (left.shared !== right.shared)
        return left.shared ? -1 : 1;
    if (left.bytes !== right.bytes)
        return right.bytes - left.bytes;
    return left.bucket < right.bucket ? -1 : left.bucket > right.bucket ? 1 : 0;
}
export function createExtensionCache(options = {}) {
    let cache = null;
    /**
     * Opens the cache on first use.
     *
     * A browser with storage blocked fails here rather than when the dialog is built, so the menu
     * entry stays clickable and the failure is reported in the dialog's own status line.
     */
    function requireCache() {
        if (cache !== null)
            return cache;
        try {
            cache = createIndexedDBContentCache({
                ...(options.indexedDB === undefined ? {} : { indexedDB: options.indexedDB }),
                ...(options.databaseName === undefined ? {} : { databaseName: options.databaseName })
            });
        }
        catch (error) {
            throw new ExtensionCacheError('unavailable', 'the extension cache is unavailable', error);
        }
        return cache;
    }
    return Object.freeze({
        async listProjects() {
            const buckets = await requireCache().listBuckets();
            return buckets
                .map((bucket) => {
                const title = options.titleFor?.(bucket.bucket);
                return {
                    bucket: bucket.bucket,
                    shared: bucket.bucket === SHARED_BUCKET,
                    ...(title === undefined || title.length === 0 ? {} : { title }),
                    entries: bucket.entries,
                    bytes: bucket.bytes
                };
            })
                .sort(compareBuckets);
        },
        async listDigests(bucket) {
            const usage = await requireCache().listBucket(bucket);
            return usage
                .map((entry) => ({
                key: entry.key,
                bytes: entry.bytes,
                originalBytes: entry.originalBytes,
                lastAccess: entry.lastAccess
            }))
                .sort((left, right) => right.lastAccess - left.lastAccess);
        },
        releaseProject(bucket) {
            return requireCache().deleteBucket(bucket);
        },
        releaseDigests(bucket, keys) {
            return requireCache().deleteFromBucket(bucket, keys);
        },
        totals() {
            return requireCache().getSize();
        },
        async close() {
            const open = cache;
            cache = null;
            if (open !== null)
                await open.close();
        }
    });
}
