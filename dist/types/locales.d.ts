import type { DslFilesDialogLocaleText } from './dsl-files-dialog';
import type { ExtensionCacheDialogLocaleText } from './extension-cache-dialog';
import type { TitleDialogLocaleText } from './title-dialog';
export type SupportedLocale = 'en' | 'ja';
export interface MenuActionLabels {
    files: string;
    cache: string;
    reload: string;
    about: string;
    close: string;
}
export declare const titleLocales: Readonly<Record<SupportedLocale, TitleDialogLocaleText>>;
export declare const menuLocales: Readonly<Record<SupportedLocale, MenuActionLabels>>;
export declare const dslFilesLocales: Readonly<Record<SupportedLocale, DslFilesDialogLocaleText>>;
/**
 * Wording for the extension cache screen.
 *
 * The notice is the load-bearing part, and it says three things on purpose. Releasing is phrased
 * as letting go of what a project *names*, never as deleting what it owns, because the cache is
 * addressed by content and one copy can be claimed by several projects. It states that nothing is
 * lost for good, so that an operator freeing space is not frightened into leaving it alone. And it
 * states that a project URI is self-declared, the same admission the DSL dialog and the security
 * dialog make about an author's name — the Loader re-checks every digest on use, so a project
 * that files its bytes under somebody else's URI corrupts this list and nothing else.
 */
export declare const extensionCacheLocales: Readonly<Record<SupportedLocale, ExtensionCacheDialogLocaleText>>;
/**
 * Turns a cache failure into operator-facing text.
 *
 * Only the codes this package assigns itself are translated. A failure raised inside IndexedDB
 * keeps its own message, because inventing a friendlier sentence for an unclassified error would
 * hide the one detail that makes it reportable.
 */
export declare function describeCacheError(locale: SupportedLocale, error: unknown): string;
/** Turns a store error code into operator-facing text, falling back to the raw message. */
export declare function describeStoreError(locale: SupportedLocale, error: unknown): string;
