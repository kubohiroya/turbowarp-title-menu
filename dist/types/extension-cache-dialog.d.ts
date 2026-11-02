import type { CachedDigestSummary, CachedProjectSummary, CacheReleaseResult, ExtensionCacheTotals } from './extension-cache';
/**
 * The stage-mounted manager for cached extension bytes.
 *
 * Like the DSL file dialog, this owns presentation and interaction state only — which bucket is
 * expanded and which row is awaiting confirmation — while every cache operation is a
 * caller-supplied callback. That is what keeps this file free of any knowledge of how the Loader
 * stores anything.
 *
 * Two things the wording must not overstate, both of which the locale text carries:
 *
 * - **A bucket is a claim, not ownership.** Entries are keyed by the digest of their bytes, so
 *   releasing a project drops the digests that project named and may take bytes another project
 *   would have reused. It costs a re-fetch and nothing else, and the notice says exactly that.
 * - **A project URI is what the project called itself.** Nothing verifies it, so a project can
 *   file its bytes under another project's URI. Only the ledger is wrong if it does: the Loader
 *   re-checks SHA-256 on every hit, so a mislabelled bucket can still never hand over the wrong
 *   bytes. The notice states this the same way the DSL dialog and the security dialog state that
 *   an author's name is self-declared.
 *
 * The list is readable because each row shows the title beside the URI. The URI is an opaque UUID
 * path by design, so it is the title that tells an operator which project a row is.
 */
export interface ExtensionCacheDialogLocaleText {
    title: string;
    /** Why releasing is safe, and why neither the URI nor the bucket proves anything. */
    notice: string;
    /** Total line. `{entries}` and `{bytes}` are substituted. */
    total: string;
    /** Row label for the bucket that belongs to no one project. */
    shared: string;
    /** Row label when no host recorded a title for the URI. */
    untitled: string;
    /** `{entries}` is substituted. */
    entryCount: string;
    expand: string;
    collapse: string;
    release: string;
    confirmRelease: string;
    cancel: string;
    close: string;
    refresh: string;
    empty: string;
    /** Result line after a release. `{released}` and `{freed}` are substituted. */
    releaseResult: string;
    /** `{date}` is substituted. */
    lastUsed: string;
    /** `{bytes}` is substituted with the decompressed size of one digest. */
    originalSize: string;
}
export interface ExtensionCacheDialogOptions {
    document?: Document;
    mount?: HTMLElement;
    locales: Record<string, ExtensionCacheDialogLocaleText>;
    initialLocale?: string;
    listProjects(): Promise<readonly CachedProjectSummary[]>;
    listDigests(bucket: string): Promise<readonly CachedDigestSummary[]>;
    totals(): Promise<ExtensionCacheTotals>;
    onReleaseProject(bucket: string): CacheReleaseResult | Promise<CacheReleaseResult>;
    onReleaseDigest(bucket: string, key: string): CacheReleaseResult | Promise<CacheReleaseResult>;
    describeError?(error: unknown): string;
    formatSize?(byteLength: number): string;
    formatDate?(epochMilliseconds: number): string;
    onError?(error: unknown): void;
}
export interface ExtensionCacheDialog {
    readonly element: HTMLElement;
    readonly locale: string;
    readonly expanded: string | null;
    show(locale?: string): Promise<string>;
    hide(): void;
    refresh(): Promise<void>;
    setLocale(locale: string): string;
    dispose(): void;
}
export declare function createExtensionCacheDialog(options: ExtensionCacheDialogOptions): ExtensionCacheDialog;
