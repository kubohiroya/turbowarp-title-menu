import { ensureRelativeMount, invokeSafely, requireDocument, requireElement } from './dom';
const defaultIcons = {
    open: '📂',
    reload: '↻',
    about: 'i',
    close: 'x'
};
function textFor(locales, locale) {
    const text = locales[locale] ?? locales.en ?? Object.values(locales)[0];
    if (!text)
        throw new TypeError('locales must contain at least one locale');
    for (const key of ['open', 'reload', 'about', 'close']) {
        if (typeof text[key] !== 'string' || text[key].length === 0) {
            throw new TypeError(`locales.${locale}.${key} must be a non-empty string`);
        }
    }
    return text;
}
export function createApplicationMenu(options) {
    const document = requireDocument(options.document ?? globalThis.document);
    const mount = requireElement(options.mount ?? document.body, 'mount');
    const locales = options.locales;
    if (!locales || typeof locales !== 'object')
        throw new TypeError('locales must be an object');
    const root = document.createElement('section');
    root.setAttribute('data-turbowarp-application-menu', 'true');
    root.setAttribute('aria-label', 'TurboWarp title menu');
    root.style.cssText =
        'position:absolute;inset:0;z-index:2147483600;display:none;box-sizing:border-box;overflow:hidden;pointer-events:auto;font-family:sans-serif;container-type:inline-size;';
    const restoreMount = ensureRelativeMount(mount);
    mount.appendChild(root);
    const callbacks = {
        open: options.onOpen,
        reload: options.onReload,
        about: options.onAbout,
        close: options.onClose
    };
    const positions = {
        open: ['10%', '25.5556%'],
        reload: ['53.3333%', '25.5556%'],
        about: ['10%', '58.8889%'],
        close: ['53.3333%', '58.8889%']
    };
    const buttons = new Map();
    let locale = options.initialLocale ?? (locales.ja ? 'ja' : Object.keys(locales)[0] ?? 'en');
    let reloadEnabled = options.reloadEnabled ?? true;
    let disposed = false;
    for (const action of ['open', 'reload', 'about', 'close']) {
        const button = document.createElement('button');
        const icon = document.createElement('span');
        const label = document.createElement('span');
        const [left, top] = positions[action];
        button.type = 'button';
        button.setAttribute('data-turbowarp-menu-action', action);
        button.style.cssText = `position:absolute;left:${left};top:${top};width:36.6667%;height:24.4444%;display:flex;min-width:0;min-height:0;align-items:center;justify-content:center;flex-direction:column;gap:.4167cqw;border:.4167cqw solid #005f50;border-radius:2.9167cqw;background:#007d66;color:#fff;box-shadow:0 .625cqw 1.6667cqw rgba(0,0,0,.2);cursor:pointer;font:inherit;`;
        icon.setAttribute('aria-hidden', 'true');
        icon.style.cssText = 'display:block;font-size:8cqw;line-height:1;';
        icon.textContent = defaultIcons[action];
        label.style.cssText = 'font-size:3.8cqw;line-height:1.15;text-align:center;';
        button.append(icon, label);
        button.addEventListener('click', () => {
            if (action === 'reload' && !reloadEnabled)
                return;
            const callback = callbacks[action];
            if (callback)
                invokeSafely(callback, options.onError);
            if (action === 'close')
                hide();
        });
        root.appendChild(button);
        buttons.set(action, button);
    }
    const render = () => {
        const text = textFor(locales, locale);
        for (const [action, button] of buttons) {
            const label = button.lastElementChild;
            if (label)
                label.textContent = text[action];
            button.setAttribute('aria-label', text[action]);
            const disabled = action === 'reload' && !reloadEnabled;
            button.disabled = disabled;
            button.setAttribute('aria-disabled', String(disabled));
            button.style.opacity = disabled ? '0.42' : '1';
            button.style.cursor = disabled ? 'not-allowed' : 'pointer';
        }
    };
    function show(nextLocale = locale) {
        if (disposed)
            throw new TypeError('application menu is disposed');
        locale = nextLocale;
        render();
        root.style.display = 'block';
        return locale;
    }
    function hide() {
        if (!disposed)
            root.style.display = 'none';
    }
    function setReloadEnabled(enabled) {
        if (disposed)
            throw new TypeError('application menu is disposed');
        if (typeof enabled !== 'boolean')
            throw new TypeError('reload enabled state must be boolean');
        reloadEnabled = enabled;
        render();
    }
    function dispose() {
        if (disposed)
            return;
        disposed = true;
        root.remove();
        restoreMount();
    }
    render();
    return Object.freeze({ element: root, show, hide, setReloadEnabled, dispose });
}
