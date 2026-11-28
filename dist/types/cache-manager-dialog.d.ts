import { type CacheAssetRow } from './cache-asset-model';
import type { CacheReleaseResult } from './extension-cache';
/**
 * The cache manager: a table of every use of every cached copy, with search, filters, sorting,
 * selection and release.
 *
 * Like the other dialogs here it owns presentation only. Listing and releasing are callbacks, so a
 * host decides what store sits behind them; title-menu passes its Loader-backed cache, and the
 * Editor passes the same. What a selection would free is estimated from the list on screen and
 * shown before asking; what a release actually did is what the callback reports, shown after.
 */
export interface CacheManagerLocaleText {
    title: string;
    /** What releasing does and does not mean: a re-fetch, offline use, and self-declared names. */
    notice: string;
    search: string;
    kindFilter: string;
    kindAll: string;
    kinds: Record<'costume' | 'backdrop' | 'sound' | 'document' | 'extension' | 'other' | 'unknown', string>;
    projectFilter: string;
    projectAll: string;
    shared: string;
    untitled: string;
    unnamed: string;
    columns: Record<'select' | 'name' | 'kind' | 'project' | 'size' | 'lastAccess', string>;
    /** `{entries}`, `{bytes}` and `{uses}` are substituted. */
    total: string;
    /** `{shown}` and `{uses}` are substituted. */
    shown: string;
    /** `{count}` is substituted. */
    selectShown: string;
    /** `{count}` is substituted. */
    selectAll: string;
    clearSelection: string;
    /** `{uses}`, `{bytes}` and `{kept}` are substituted. */
    selection: string;
    release: string;
    /** `{uses}` is substituted. */
    confirmRelease: string;
    cancel: string;
    close: string;
    refresh: string;
    loading: string;
    empty: string;
    noMatches: string;
    /** `{released}`, `{requested}` and `{freed}` are substituted. */
    releaseResult: string;
    /** `{missing}` is substituted: uses that were already gone when the release ran. */
    releaseStale: string;
    /** `{uses}` is substituted. */
    sharedBy: string;
    redacted: string;
    /** `{key}` is substituted. */
    digest: string;
}
export interface CacheManagerDialogOptions {
    document?: Document;
    mount?: HTMLElement;
    locales: Record<string, CacheManagerLocaleText>;
    initialLocale?: string;
    listAssets(): Promise<readonly CacheAssetRow[]>;
    onRelease(claims: readonly {
        bucket: string;
        key: string;
    }[]): CacheReleaseResult | Promise<CacheReleaseResult>;
    /** `auto` follows the browser; a host with its own theme passes `light` or `dark`. */
    colorScheme?: 'light' | 'dark' | 'auto';
    describeError?(error: unknown): string;
    formatSize?(byteLength: number): string;
    formatDate?(epochMilliseconds: number): string;
    onError?(error: unknown): void;
}
export type CacheManagerPhase = 'idle' | 'loading' | 'ready' | 'error';
export interface CacheManagerDialog {
    readonly element: HTMLElement;
    readonly locale: string;
    readonly phase: CacheManagerPhase;
    readonly selected: ReadonlySet<string>;
    show(locale?: string): Promise<string>;
    hide(): void;
    refresh(): Promise<void>;
    setLocale(locale: string): string;
    setColorScheme(scheme: 'light' | 'dark' | 'auto'): void;
    dispose(): void;
}
export declare function createCacheManagerDialog(options: CacheManagerDialogOptions): CacheManagerDialog;
