import { isRecord, requireDocument, requireElement } from './dom';
import { defaultDslSort } from './dsl-store';
const defaultSortDirections = Object.freeze({
    name: 'asc',
    updatedAt: 'desc',
    byteLength: 'desc'
});
function requireLocales(value) {
    if (!isRecord(value) || Object.keys(value).length === 0) {
        throw new TypeError('locales must contain at least one locale');
    }
    return value;
}
function textFor(locales, locale) {
    const text = locales[locale] ?? locales['en'] ?? Object.values(locales)[0];
    if (text === undefined)
        throw new TypeError('locales must contain at least one locale');
    return text;
}
function defaultFormatSize(byteLength) {
    if (byteLength < 1024)
        return `${byteLength} B`;
    if (byteLength < 1024 * 1024)
        return `${(byteLength / 1024).toFixed(1)} KB`;
    return `${(byteLength / (1024 * 1024)).toFixed(1)} MB`;
}
function defaultFormatDate(isoDate) {
    const parsed = new Date(isoDate);
    if (Number.isNaN(parsed.getTime()))
        return isoDate;
    const pad = (value) => String(value).padStart(2, '0');
    return `${parsed.getFullYear()}-${pad(parsed.getMonth() + 1)}-${pad(parsed.getDate())} ${pad(parsed.getHours())}:${pad(parsed.getMinutes())}`;
}
function defaultDescribeError(error) {
    if (error instanceof Error && error.message.length > 0)
        return error.message;
    return String(error);
}
export function createDslFilesDialog(options) {
    if (!isRecord(options))
        throw new TypeError('DSL files dialog options must be an object');
    const document = requireDocument(options.document ?? globalThis.document);
    const mount = requireElement(options.mount ?? document.body, 'mount');
    const locales = requireLocales(options.locales);
    const describeError = options.describeError ?? defaultDescribeError;
    const formatSize = options.formatSize ?? defaultFormatSize;
    const formatDate = options.formatDate ?? defaultFormatDate;
    let locale = options.initialLocale ?? 'en';
    let sort = options.initialSort ?? defaultDslSort;
    let summaries = [];
    let renamingId = null;
    let confirmingRemovalId = null;
    let status = '';
    let disposed = false;
    const root = document.createElement('section');
    const panel = document.createElement('div');
    const heading = document.createElement('h1');
    const closeButton = document.createElement('button');
    const toolbar = document.createElement('div');
    const addButton = document.createElement('button');
    const sortBar = document.createElement('div');
    const listElement = document.createElement('div');
    const statusElement = document.createElement('p');
    root.setAttribute('data-turbowarp-title-menu-dsl-files', 'true');
    root.style.cssText =
        'position:absolute;inset:0;z-index:2147483646;align-items:center;justify-content:center;padding:16px;box-sizing:border-box;background:rgba(0,0,0,.6);font-family:sans-serif;';
    // Visibility is the one property the dialog toggles, so it is set apart from the style sheet.
    root.style.display = 'none';
    panel.style.cssText =
        'width:min(720px,96%);max-height:90%;display:flex;flex-direction:column;gap:10px;padding:18px;box-sizing:border-box;background:#ffffff;color:#1b1f27;border-radius:10px;box-shadow:0 10px 36px rgba(0,0,0,.45);overflow:hidden;';
    heading.style.cssText = 'margin:0;font-size:20px;line-height:1.3;';
    toolbar.style.cssText = 'display:flex;gap:8px;align-items:center;flex-wrap:wrap;';
    sortBar.style.cssText = 'display:flex;gap:6px;align-items:center;flex-wrap:wrap;';
    listElement.style.cssText = 'flex:1;min-height:0;overflow:auto;display:flex;flex-direction:column;gap:6px;';
    statusElement.style.cssText = 'margin:0;min-height:18px;font-size:13px;color:#8a1c1c;';
    const headerRow = document.createElement('div');
    headerRow.style.cssText = 'display:flex;align-items:center;justify-content:space-between;gap:8px;';
    headerRow.appendChild(heading);
    headerRow.appendChild(closeButton);
    panel.appendChild(headerRow);
    toolbar.appendChild(addButton);
    toolbar.appendChild(sortBar);
    panel.appendChild(toolbar);
    panel.appendChild(listElement);
    panel.appendChild(statusElement);
    root.appendChild(panel);
    const previousMountPosition = mount.style.position;
    if (previousMountPosition === '' || previousMountPosition === 'static') {
        mount.style.position = 'relative';
    }
    mount.appendChild(root);
    function styleButton(button, tone) {
        const palette = {
            primary: 'background:#1f6feb;color:#ffffff;border:1px solid #1f6feb;',
            plain: 'background:#f2f4f8;color:#1b1f27;border:1px solid #ccd2de;',
            danger: 'background:#b42318;color:#ffffff;border:1px solid #b42318;',
            active: 'background:#d7e6ff;color:#0b3a82;border:1px solid #1f6feb;'
        }[tone];
        button.style.cssText = `${palette}padding:5px 10px;border-radius:6px;font-size:13px;cursor:pointer;`;
    }
    function run(operation) {
        try {
            Promise.resolve(operation()).catch(handleFailure);
        }
        catch (error) {
            handleFailure(error);
        }
    }
    function handleFailure(error) {
        status = describeError(error);
        options.onError?.(error);
        render();
    }
    /** Every mutation goes through here so the list and the status line stay in step. */
    function mutate(operation) {
        run(async () => {
            status = '';
            try {
                await operation();
            }
            catch (error) {
                status = describeError(error);
                options.onError?.(error);
                render();
                return;
            }
            await reload();
        });
    }
    async function reload() {
        if (disposed)
            return;
        summaries = await options.list(sort);
        render();
    }
    function selectSort(field) {
        if (sort.field === field) {
            sort = { field, direction: sort.direction === 'asc' ? 'desc' : 'asc' };
        }
        else {
            sort = { field, direction: defaultSortDirections[field] };
        }
        renamingId = null;
        confirmingRemovalId = null;
        mutate(() => undefined);
    }
    function createButton(label, tone, onClick) {
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = label;
        styleButton(button, tone);
        button.addEventListener('click', onClick);
        return button;
    }
    function renderSortBar(text) {
        const arrow = sort.direction === 'asc' ? ' ▲' : ' ▼';
        const fields = [
            ['name', text.sortByName],
            ['updatedAt', text.sortByDate],
            ['byteLength', text.sortBySize]
        ];
        for (const [field, label] of fields) {
            const active = sort.field === field;
            const button = createButton(active ? `${label}${arrow}` : label, active ? 'active' : 'plain', () => selectSort(field));
            button.setAttribute('data-sort-field', field);
            if (active)
                button.setAttribute('aria-pressed', 'true');
            sortBar.appendChild(button);
        }
    }
    function renderRow(summary, text) {
        const row = document.createElement('div');
        row.setAttribute('data-dsl-file-id', summary.id);
        row.style.cssText =
            'display:flex;align-items:center;gap:8px;padding:8px;border:1px solid #e2e6ee;border-radius:8px;';
        if (renamingId === summary.id) {
            const input = document.createElement('input');
            input.type = 'text';
            input.value = summary.name;
            input.setAttribute('data-rename-input', summary.id);
            input.style.cssText = 'flex:1;min-width:0;padding:5px 8px;border:1px solid #1f6feb;border-radius:6px;font-size:14px;';
            const commit = () => {
                const nextName = input.value;
                renamingId = null;
                mutate(() => options.onRename(summary.id, nextName));
            };
            input.addEventListener('keydown', (event) => {
                const key = event.key;
                if (key === 'Enter')
                    commit();
                if (key === 'Escape') {
                    renamingId = null;
                    render();
                }
            });
            row.appendChild(input);
            row.appendChild(createButton(text.confirm, 'primary', commit));
            row.appendChild(createButton(text.cancel, 'plain', () => {
                renamingId = null;
                render();
            }));
            return row;
        }
        const name = document.createElement('span');
        name.textContent = summary.name;
        name.style.cssText = 'flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:14px;';
        const date = document.createElement('span');
        date.textContent = formatDate(summary.updatedAt);
        date.style.cssText = 'font-size:12px;color:#5a6172;white-space:nowrap;';
        const size = document.createElement('span');
        size.textContent = formatSize(summary.byteLength);
        size.style.cssText = 'font-size:12px;color:#5a6172;white-space:nowrap;min-width:64px;text-align:right;';
        row.appendChild(name);
        row.appendChild(date);
        row.appendChild(size);
        if (confirmingRemovalId === summary.id) {
            row.appendChild(createButton(text.confirmRemove, 'danger', () => {
                confirmingRemovalId = null;
                mutate(() => options.onRemove(summary.id));
            }));
            row.appendChild(createButton(text.cancel, 'plain', () => {
                confirmingRemovalId = null;
                render();
            }));
            return row;
        }
        row.appendChild(createButton(text.open, 'primary', () => {
            mutate(() => options.onOpen(summary.id));
        }));
        row.appendChild(createButton(text.rename, 'plain', () => {
            renamingId = summary.id;
            confirmingRemovalId = null;
            render();
        }));
        row.appendChild(createButton(text.remove, 'plain', () => {
            confirmingRemovalId = summary.id;
            renamingId = null;
            render();
        }));
        return row;
    }
    function render() {
        if (disposed)
            return;
        const text = textFor(locales, locale);
        heading.textContent = text.title;
        closeButton.textContent = text.close;
        closeButton.setAttribute('aria-label', text.close);
        addButton.textContent = text.add;
        statusElement.textContent = status;
        sortBar.replaceChildren();
        renderSortBar(text);
        listElement.replaceChildren();
        if (summaries.length === 0) {
            const empty = document.createElement('p');
            empty.textContent = text.empty;
            empty.style.cssText = 'margin:8px 0;font-size:14px;color:#5a6172;';
            listElement.appendChild(empty);
        }
        else {
            for (const summary of summaries)
                listElement.appendChild(renderRow(summary, text));
        }
    }
    styleButton(closeButton, 'plain');
    styleButton(addButton, 'primary');
    closeButton.type = 'button';
    addButton.type = 'button';
    closeButton.addEventListener('click', () => hide());
    addButton.addEventListener('click', () => {
        mutate(() => options.onAdd());
    });
    function hide() {
        if (disposed)
            return;
        renamingId = null;
        confirmingRemovalId = null;
        root.style.display = 'none';
    }
    function ensureActive() {
        if (disposed)
            throw new TypeError('DSL files dialog is disposed');
    }
    render();
    return Object.freeze({
        element: root,
        get locale() {
            return locale;
        },
        get sort() {
            return sort;
        },
        async show(nextLocale) {
            ensureActive();
            if (nextLocale !== undefined)
                locale = nextLocale;
            status = '';
            root.style.display = 'flex';
            await reload();
            return locale;
        },
        hide,
        async refresh() {
            ensureActive();
            await reload();
        },
        setLocale(nextLocale) {
            ensureActive();
            locale = nextLocale;
            render();
            return locale;
        },
        dispose() {
            if (disposed)
                return;
            disposed = true;
            root.remove();
            if (previousMountPosition === '' || previousMountPosition === 'static') {
                mount.style.position = previousMountPosition;
            }
        }
    });
}
