import type { DslFilesDialogLocaleText } from './dsl-files-dialog';
import type { TitleDialogLocaleText } from './title-dialog';
export type SupportedLocale = 'en' | 'ja';
export interface MenuActionLabels {
    files: string;
    reload: string;
    about: string;
    close: string;
}
export declare const titleLocales: Readonly<Record<SupportedLocale, TitleDialogLocaleText>>;
export declare const menuLocales: Readonly<Record<SupportedLocale, MenuActionLabels>>;
export declare const dslFilesLocales: Readonly<Record<SupportedLocale, DslFilesDialogLocaleText>>;
/** Turns a store error code into operator-facing text, falling back to the raw message. */
export declare function describeStoreError(locale: SupportedLocale, error: unknown): string;
