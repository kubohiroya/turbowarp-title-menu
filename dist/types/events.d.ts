import type { DslFileRecord } from './dsl-store';
export declare const dslOpenEventName = "turbowarp-title-menu:dsl-open";
export declare const dslReloadEventName = "turbowarp-title-menu:dsl-reload";
export interface DslSourceEventDetail {
    record: DslFileRecord;
}
/**
 * Announces an opened DSL source on the window.
 *
 * The extension also starts a Scratch hat, but a packaged host that embeds this extension may run
 * its own runtime outside the VM, so the DOM event stays the transport that assumes no Scratch.
 */
export declare function dispatchDslSourceEvent(type: string, record: DslFileRecord): void;
