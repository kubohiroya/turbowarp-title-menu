// SPDX-License-Identifier: MPL-2.0
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
import { SHARED_BUCKET } from '@kubohiroya/turbowarp-extension-loader/indexeddb-cache';
const separator = '\n';
export const cacheAssetRowId = (bucket, key) => `${bucket}${separator}${key}`;
/** Turn the Loader's listing into rows: one per project that claims a stored copy. */
export function cacheAssetRows(entries, titleFor) {
    const rows = [];
    for (const entry of entries) {
        for (const claim of entry.claims) {
            const labels = entry.labels.filter((label) => label.bucket === claim.bucket);
            const unique = (values) => [...new Set(values.filter((value) => value !== undefined && value !== ''))];
            const recordedTitle = unique(labels.map((label) => label.projectName))[0];
            const hostTitle = titleFor?.(claim.bucket);
            const projectTitle = hostTitle !== undefined && hostTitle !== '' ? hostTitle : recordedTitle;
            rows.push(Object.freeze({
                id: cacheAssetRowId(claim.bucket, entry.key),
                key: entry.key,
                bucket: claim.bucket,
                shared: claim.bucket === SHARED_BUCKET,
                ...(projectTitle === undefined ? {} : { projectTitle }),
                names: Object.freeze(unique(labels.map((label) => label.name))),
                kinds: Object.freeze(unique(labels.map((label) => label.kind))),
                urls: Object.freeze(unique(labels.map((label) => label.url))),
                urlRedacted: labels.some((label) => label.urlRedacted === true),
                refs: Object.freeze(unique(labels.map((label) => label.ref))),
                bytes: entry.bytes,
                originalBytes: entry.originalBytes,
                lastAccess: claim.lastAccess,
                uses: entry.claims.length
            }));
        }
    }
    return rows;
}
const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
function sortValue(row, column) {
    switch (column) {
        case 'name':
            return row.names[0] ?? '';
        case 'kind':
            return row.kinds[0] ?? '';
        case 'project':
            return row.shared ? '' : (row.projectTitle ?? row.bucket);
        case 'size':
            return row.bytes;
        case 'lastAccess':
            return row.lastAccess;
    }
}
/**
 * Filter and sort rows. Rows that compare equal keep a fixed order, by digest then bucket, so the
 * table does not reshuffle between listings. Rows with no value for the sorted column go last in
 * either direction, because "unknown" is not the smallest name.
 */
export function queryCacheAssets(rows, query = {}) {
    const text = query.text?.trim().toLocaleLowerCase() ?? '';
    const filtered = rows.filter((row) => {
        if (query.bucket !== undefined && row.bucket !== query.bucket)
            return false;
        if (query.kind !== undefined) {
            if (query.kind === 'unknown' ? row.kinds.length > 0 : !row.kinds.includes(query.kind))
                return false;
        }
        if (!text)
            return true;
        return [...row.names, ...row.urls, row.projectTitle ?? '', row.bucket, row.key].some((value) => value.toLocaleLowerCase().includes(text));
    });
    const column = query.sort ?? 'lastAccess';
    const sign = (query.direction ?? (column === 'lastAccess' || column === 'size' ? 'descending' : 'ascending')) === 'ascending' ? 1 : -1;
    return filtered.sort((left, right) => {
        const a = sortValue(left, column);
        const b = sortValue(right, column);
        const aMissing = a === '';
        const bMissing = b === '';
        if (aMissing !== bMissing)
            return aMissing ? 1 : -1;
        const order = typeof a === 'number' && typeof b === 'number' ? a - b : collator.compare(String(a), String(b));
        if (order !== 0)
            return order * sign;
        return left.key < right.key ? -1 : left.key > right.key ? 1 : left.bucket < right.bucket ? -1 : left.bucket > right.bucket ? 1 : 0;
    });
}
/** Totals that count each stored copy once, however many rows use it. */
export function cacheAssetTotals(rows) {
    const sizes = new Map(rows.map((row) => [row.key, row.bytes]));
    let bytes = 0;
    for (const size of sizes.values())
        bytes += size;
    return Object.freeze({ uses: rows.length, entries: sizes.size, bytes });
}
/**
 * What releasing the selected uses would do, judged from the listing on screen. The Loader decides
 * for real and reports what it did; this is the estimate shown before asking.
 */
export function estimateCacheRelease(all, selected) {
    const chosen = all.filter((row) => selected.has(row.id));
    const totals = cacheAssetTotals(chosen);
    let freedBytes = 0;
    let keptEntries = 0;
    for (const key of new Set(chosen.map((row) => row.key))) {
        const uses = all.filter((row) => row.key === key);
        if (uses.every((row) => selected.has(row.id)))
            freedBytes += uses[0].bytes;
        else
            keptEntries++;
    }
    return Object.freeze({ ...totals, freedBytes, keptEntries });
}
/** Drop selected ids that are no longer listed, so a stale selection never releases anything. */
export function pruneCacheSelection(rows, selected) {
    const listed = new Set(rows.map((row) => row.id));
    return new Set([...selected].filter((id) => listed.has(id)));
}
/** The claims a selection releases, in the shape the Loader takes. */
export function cacheClaimsFor(rows, selected) {
    return rows.filter((row) => selected.has(row.id)).map((row) => ({ bucket: row.bucket, key: row.key }));
}
