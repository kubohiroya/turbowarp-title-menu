export const dslOpenEventName = 'turbowarp-title-menu:dsl-open';
export const dslReloadEventName = 'turbowarp-title-menu:dsl-reload';
/**
 * Announces an opened DSL source on the window.
 *
 * The extension also starts a Scratch hat, but a packaged host that embeds this extension may run
 * its own runtime outside the VM, so the DOM event stays the transport that assumes no Scratch.
 */
export function dispatchDslSourceEvent(type, record) {
    const target = globalThis;
    if (typeof target.dispatchEvent !== 'function')
        return;
    const event = typeof CustomEvent === 'function'
        ? new CustomEvent(type, { detail: { record } })
        : new Event(type);
    if (!('detail' in event)) {
        Object.defineProperty(event, 'detail', { value: { record } });
    }
    target.dispatchEvent(event);
}
