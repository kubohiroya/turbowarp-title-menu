export const dslOpenEventName = 'turbowarp-title-menu:dsl-open';
export const dslReloadEventName = 'turbowarp-title-menu:dsl-reload';
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
