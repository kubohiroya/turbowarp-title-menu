import { ensureRelativeMount, invokeSafely, requireDocument, requireElement } from './dom';
function requireLocaleText(locales, locale) {
    const text = locales[locale] ?? locales.en ?? Object.values(locales)[0];
    if (!text)
        throw new TypeError('locales must contain at least one locale');
    for (const key of ['title', 'website', 'close']) {
        if (typeof text[key] !== 'string' || text[key].length === 0) {
            throw new TypeError(`locales.${locale}.${key} must be a non-empty string`);
        }
    }
    return text;
}
function openWebsite(url) {
    const opener = globalThis.open;
    if (typeof opener === 'function') {
        opener(url, '_blank', 'noopener,noreferrer');
    }
    else if (globalThis.location) {
        globalThis.location.href = url;
    }
}
export function createTitleDialog(options) {
    const document = requireDocument(options.document ?? globalThis.document);
    const mount = requireElement(options.mount ?? document.body, 'mount');
    const locales = options.locales;
    if (!locales || typeof locales !== 'object')
        throw new TypeError('locales must be an object');
    const root = document.createElement('section');
    const panel = document.createElement('div');
    const language = document.createElement('button');
    const close = document.createElement('button');
    const heading = document.createElement('h1');
    const meta = document.createElement('p');
    const website = document.createElement('button');
    root.setAttribute('data-turbowarp-title-dialog', 'true');
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-modal', 'true');
    root.style.cssText =
        'position:absolute;inset:0;z-index:2147483647;display:none;align-items:center;justify-content:center;box-sizing:border-box;background:rgba(0,0,0,.35);font-family:sans-serif;';
    panel.style.cssText =
        'position:relative;box-sizing:border-box;width:min(88%,420px);padding:36px 28px 28px;text-align:center;background:#f4fffb;border:1px solid #007d66;border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,.3);color:#006b58;';
    language.style.cssText =
        'position:absolute;top:14px;left:16px;border:0;background:transparent;color:#007d66;font-size:14px;cursor:pointer;';
    close.style.cssText =
        'position:absolute;top:12px;right:12px;width:32px;height:32px;border:0;border-radius:50%;background:#007d66;color:#fff;font-size:22px;line-height:28px;cursor:pointer;';
    heading.style.cssText = 'margin:0 24px 8px;font-size:30px;font-weight:600;line-height:1.15;';
    meta.style.cssText = 'margin:0 0 22px;font-size:14px;line-height:1.4;';
    website.style.cssText =
        'display:inline-flex;align-items:center;justify-content:center;min-height:48px;padding:8px 18px;border:0;border-radius:10px;background:#007d66;color:#fff;font-size:16px;cursor:pointer;';
    language.type = 'button';
    close.type = 'button';
    website.type = 'button';
    close.textContent = 'x';
    panel.append(language, close, heading, meta, website);
    root.appendChild(panel);
    const restoreMount = ensureRelativeMount(mount);
    mount.appendChild(root);
    let locale = options.initialLocale ?? (locales.ja ? 'ja' : Object.keys(locales)[0] ?? 'en');
    let disposed = false;
    const render = () => {
        const text = requireLocaleText(locales, locale);
        heading.textContent = text.title;
        meta.textContent = [text.author, text.license].filter(Boolean).join(' / ');
        meta.hidden = meta.textContent.length === 0;
        website.textContent = text.website;
        website.setAttribute('aria-label', text.website);
        close.setAttribute('aria-label', text.close);
        close.setAttribute('title', text.close);
        language.textContent = text.language ?? locale;
        language.setAttribute('aria-label', text.language ?? locale);
    };
    const handleWebsite = () => {
        if (options.onWebsite)
            invokeSafely(options.onWebsite, options.onError);
        else if (options.websiteUrl)
            openWebsite(options.websiteUrl);
    };
    const handleClose = () => {
        hide();
        if (options.onClose)
            invokeSafely(options.onClose, options.onError);
    };
    const handleLanguage = () => {
        const keys = Object.keys(locales);
        locale = keys[(Math.max(keys.indexOf(locale), 0) + 1) % keys.length] ?? locale;
        render();
        if (options.onLocaleChange)
            invokeSafely(() => options.onLocaleChange?.(locale), options.onError);
    };
    website.addEventListener('click', handleWebsite);
    close.addEventListener('click', handleClose);
    language.addEventListener('click', handleLanguage);
    function show(nextLocale = locale) {
        if (disposed)
            throw new TypeError('title dialog is disposed');
        locale = nextLocale;
        render();
        root.style.display = 'flex';
        return locale;
    }
    function hide() {
        if (!disposed)
            root.style.display = 'none';
    }
    function setLocale(nextLocale) {
        if (disposed)
            throw new TypeError('title dialog is disposed');
        locale = nextLocale;
        render();
        return locale;
    }
    function dispose() {
        if (disposed)
            return;
        disposed = true;
        website.removeEventListener('click', handleWebsite);
        close.removeEventListener('click', handleClose);
        language.removeEventListener('click', handleLanguage);
        root.remove();
        restoreMount();
    }
    render();
    return Object.freeze({
        element: root,
        get locale() {
            return locale;
        },
        show,
        hide,
        setLocale,
        dispose
    });
}
