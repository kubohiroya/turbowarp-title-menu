export type ApplicationMenuAction = 'open' | 'reload' | 'about' | 'close';
export interface ApplicationMenuItemText {
    open: string;
    reload: string;
    about: string;
    close: string;
}
export interface ApplicationMenuOptions {
    document?: Document;
    mount?: HTMLElement;
    locales: Record<string, ApplicationMenuItemText>;
    initialLocale?: string;
    onOpen?: () => unknown | Promise<unknown>;
    onReload?: () => unknown | Promise<unknown>;
    onAbout?: () => unknown | Promise<unknown>;
    onClose?: () => unknown | Promise<unknown>;
    onError?: (error: unknown) => void;
    reloadEnabled?: boolean;
}
export interface ApplicationMenu {
    readonly element: HTMLElement;
    show(locale?: string): string;
    hide(): void;
    setReloadEnabled(enabled: boolean): void;
    dispose(): void;
}
export declare function createApplicationMenu(options: ApplicationMenuOptions): ApplicationMenu;
