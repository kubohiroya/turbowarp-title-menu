import { type CacheAssetRow } from './cache-asset-model.js';
import type { CacheReleaseResult } from './extension-cache.js';
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
    /** What embedding does: it changes the open project, unsaved, and keeps the address. */
    embedNotice: string;
    embedFormat: string;
    embedFormats: Record<CacheEmbedFormat, string>;
    /** `{uses}` is substituted: selected uses of the project open in the host. */
    embed: string;
    /** `{uses}` is substituted. */
    embedAndRelease: string;
    /** `{uses}` is substituted: selected uses that belong to other projects. */
    embedOtherProjects: string;
    /** `{embedded}` and `{requested}` are substituted. */
    embedResult: string;
    /** `{count}` and `{reasons}` are substituted. */
    embedSkipped: string;
    embedSkipReasons: Record<CacheEmbedSkipReason, string>;
    /** Shown while the release waits for the project to be saved. */
    embedReleasePending: string;
    /** `{released}`, `{freed}` and `{kept}` are substituted. */
    embedReleaseResult: string;
}
export type CacheEmbedFormat = 'embedded-data' | 'embedded-file';
export type CacheEmbedSkipReason = 'not-in-project' | 'changed' | 'unsupported';
/** What the host reports after embedding selected copies into its open project. */
export interface CacheEmbedOutcome {
    readonly embedded: number;
    readonly skipped: readonly {
        readonly key: string;
        readonly reason: CacheEmbedSkipReason;
    }[];
    /**
     * Present when a release was asked for: it settles once the host saw the project saved and
     * released that project's claims, with how many it kept (other projects and the shared area
     * always stay). It never settles if the project is not saved.
     */
    readonly released?: Promise<CacheReleaseResult & {
        readonly kept: number;
    }>;
}
/**
 * Embedding into the project the host has open. The dialog never decides which references
 * change: it passes digests of rows filed under the open project, and the host embeds only what
 * that project pins with the same digest, reporting the rest.
 */
export interface CacheEmbeddingHost {
    /** The bucket the open project's rows are filed under, or undefined when it has none. */
    currentBucket(): string | undefined;
    embed(keys: readonly string[], options: {
        format: CacheEmbedFormat;
        release: boolean;
    }): Promise<CacheEmbedOutcome>;
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
    /** Offered only when the host has an open project to embed into. */
    embedding?: CacheEmbeddingHost;
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
