export type TitleMenuLocale = string;
export interface TitleDialogLocaleText {
    title: string;
    author?: string;
    license?: string;
    website: string;
    close: string;
    language?: string;
}
export interface TitleDialogOptions {
    document?: Document;
    mount?: HTMLElement;
    locales: Record<string, TitleDialogLocaleText>;
    initialLocale?: TitleMenuLocale;
    websiteUrl?: string;
    onWebsite?: () => unknown | Promise<unknown>;
    onClose?: () => unknown | Promise<unknown>;
    onLocaleChange?: (locale: TitleMenuLocale) => unknown | Promise<unknown>;
    onError?: (error: unknown) => void;
}
export interface TitleDialog {
    readonly element: HTMLElement;
    readonly locale: TitleMenuLocale;
    show(locale?: TitleMenuLocale): TitleMenuLocale;
    hide(): void;
    setLocale(locale: TitleMenuLocale): TitleMenuLocale;
    dispose(): void;
}
export declare function createTitleDialog(options: TitleDialogOptions): TitleDialog;
