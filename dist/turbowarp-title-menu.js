// Name: TurboWarp Title Menu
// ID: kubohiroyaturbowarptitlemenu
// Description: Reusable title, application menu, and DSL source storage controls for TurboWarp.
// By: Hiroya Kubo
// License: MPL-2.0

(function (Scratch) {
  'use strict';

//#region node_modules/.pnpm/@kubohiroya+turbowarp-app-shell@0.6.1/node_modules/@kubohiroya/turbowarp-app-shell/dist/index.js
function isRecord$1(value) {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}
function requireElement$1(value, name) {
	if (!isRecord$1(value) || typeof value["appendChild"] !== "function") throw new TypeError(`${name} must be a DOM element.`);
	return value;
}
function requireDocument$1(value) {
	if (!isRecord$1(value) || typeof value["createElement"] !== "function") throw new TypeError("document must provide the DOM document contract.");
	return value;
}
function requireString(value, name) {
	if (typeof value !== "string" || value.length === 0) throw new TypeError(`${name} must be a non-empty string.`);
	return value;
}
function optionalBoolean(value, name, fallback) {
	if (value === void 0) return fallback;
	if (typeof value !== "boolean") throw new TypeError(`${name} must be a boolean.`);
	return value;
}
function optionalString(value, name) {
	if (value === void 0) return void 0;
	if (typeof value !== "string") throw new TypeError(`${name} must be a string.`);
	return value;
}
function requireLocalizedLabels(value, name) {
	if (!isRecord$1(value)) throw new TypeError(`${name} must be an object.`);
	const entries = Object.entries(value);
	if (entries.length === 0) throw new TypeError(`${name} must include at least one locale.`);
	for (const [locale, label] of entries) if (typeof label !== "string" || label.length === 0) throw new TypeError(`${name}.${locale} must be a non-empty string.`);
	return value;
}
function firstLocale(locales, name) {
	const [locale] = Object.keys(locales);
	if (locale === void 0) throw new TypeError(`${name} must include at least one locale.`);
	return locale;
}
function resolveInjectedLocale(locales, requested, fallback, name) {
	if (requested !== void 0 && Object.hasOwn(locales, requested)) return requested;
	if (fallback !== void 0 && Object.hasOwn(locales, fallback)) return fallback;
	if (Object.hasOwn(locales, "en")) return "en";
	return firstLocale(locales, name);
}
function localized(locales, locale, fallback, name) {
	return locales[resolveInjectedLocale(locales, locale, fallback, name)];
}
function requireIcon(value, name) {
	if (value === void 0) return void 0;
	if (!isRecord$1(value)) throw new TypeError(`${name} must be an object.`);
	const url = optionalString(value["url"], `${name}.url`);
	const text = optionalString(value["text"], `${name}.text`);
	const filter = optionalString(value["filter"], `${name}.filter`);
	const size = optionalString(value["size"], `${name}.size`);
	const fontSize = optionalString(value["fontSize"], `${name}.fontSize`);
	if ((url === void 0 || url.length === 0) && (text === void 0 || text.length === 0)) throw new TypeError(`${name} must include a non-empty url or text.`);
	return {
		...url === void 0 ? {} : { url },
		...text === void 0 ? {} : { text },
		...filter === void 0 ? {} : { filter },
		...size === void 0 ? {} : { size },
		...fontSize === void 0 ? {} : { fontSize }
	};
}
function requireAttributes(value, name) {
	if (value === void 0) return void 0;
	if (!isRecord$1(value)) throw new TypeError(`${name} must be an object.`);
	for (const [attribute, attributeValue] of Object.entries(value)) {
		if (attribute.length === 0) throw new TypeError(`${name} names must be non-empty.`);
		if (typeof attributeValue !== "string") throw new TypeError(`${name}.${attribute} must be a string.`);
	}
	return value;
}
function applyAttributes(element, attributes) {
	if (attributes === void 0) return;
	for (const [name, value] of Object.entries(attributes)) element.setAttribute(name, value);
}
function requireRect(value, name) {
	if (value === void 0) return void 0;
	if (!isRecord$1(value)) throw new TypeError(`${name} must be an object.`);
	const left = optionalString(value["left"], `${name}.left`);
	const top = optionalString(value["top"], `${name}.top`);
	const width = optionalString(value["width"], `${name}.width`);
	const height = optionalString(value["height"], `${name}.height`);
	return {
		...left === void 0 ? {} : { left },
		...top === void 0 ? {} : { top },
		...width === void 0 ? {} : { width },
		...height === void 0 ? {} : { height }
	};
}
function applyRect(element, rect) {
	if (rect === void 0) return;
	if (rect.left !== void 0) element.style.left = rect.left;
	if (rect.top !== void 0) element.style.top = rect.top;
	if (rect.width !== void 0) element.style.width = rect.width;
	if (rect.height !== void 0) element.style.height = rect.height;
}
function requireTestId(value, name) {
	if (value === void 0) return void 0;
	if (typeof value !== "string" || value.length === 0) throw new TypeError(`${name} must be a non-empty string.`);
	return value;
}
function applyTestId(element, testId) {
	if (testId !== void 0) element.setAttribute("data-testid", testId);
}
function restoreableMountPosition(document, mount) {
	if (mount === document.body) return null;
	const previous = mount.style.position;
	if (previous === void 0 || previous === "" || previous === "static") {
		mount.style.position = "relative";
		return () => {
			mount.style.position = previous ?? "";
		};
	}
	return null;
}
function setButtonEnabled(button, enabled) {
	button.disabled = !enabled;
	button.setAttribute("aria-disabled", String(!enabled));
	button.style.cursor = enabled ? "pointer" : "not-allowed";
	button.style.opacity = enabled ? "1" : "0.42";
}
function setElementVisible(element, visible, display) {
	element.hidden = !visible;
	element.style.display = visible ? display : "none";
}
function reportActionError(onError, error) {
	try {
		onError?.(error);
	} catch {}
}
function invokeAction(action, onError, event) {
	event?.preventDefault();
	event?.stopPropagation();
	try {
		Promise.resolve(action()).catch((error) => {
			reportActionError(onError, error);
		});
	} catch (error) {
		reportActionError(onError, error);
	}
}
function iconCssUrl(url) {
	return `url("${url.replaceAll("\\", "\\\\").replaceAll("\"", "\\\"")}")`;
}
function renderIcon(element, icon) {
	element.textContent = "";
	element.style.backgroundImage = "";
	element.style.display = icon === void 0 ? "none" : "inline-flex";
	if (icon === void 0) return;
	element.style.filter = icon.filter ?? "";
	if (icon.size !== void 0) {
		element.style.width = icon.size;
		element.style.height = icon.size;
	}
	if (icon.fontSize !== void 0) element.style.fontSize = icon.fontSize;
	if (icon.url !== void 0) {
		element.style.backgroundImage = iconCssUrl(icon.url);
		element.style.backgroundPosition = "center";
		element.style.backgroundRepeat = "no-repeat";
		element.style.backgroundSize = "contain";
		return;
	}
	element.textContent = icon.text ?? "";
}
function loadingTone(tone) {
	if (tone === "warning") return "#805300";
	if (tone === "error") return "#a00020";
	if (tone === "info") return "#176e9f";
	return "#35524c";
}
function resolveAppShellLocale(input) {
	const preferred = input?.language ?? input?.languages?.[0] ?? globalThis.navigator?.language ?? "";
	return /^ja(?:-|$)/iu.test(preferred) ? "ja" : "en";
}
function boundedText(value, limit = 2e3) {
	const text = String(value ?? "");
	const scalars = [...text];
	return scalars.length <= limit ? text : `${scalars.slice(0, limit - 1).join("")}...`;
}
/**
* Where the application menu places its actions: two columns of up to two rows, as it always has,
* and more columns and rows when there are more actions, so that every action stays on the stage.
* The band starts under the title area and ends above the status row; labels and icons shrink with
* the cells. An action's own `position` still overrides its cell.
*/
function applicationMenuGrid(count) {
	const columns = count <= 4 ? 2 : count <= 12 ? 3 : 4;
	const rows = Math.ceil(count / columns);
	const top = 25.5556;
	const bottom = rows <= 2 ? 80 : 90;
	const gapX = columns === 2 ? 6.6667 : 3.3333;
	const gapY = rows <= 2 ? 5.5556 : 2.7778;
	const width = (80 - (columns - 1) * gapX) / columns;
	const height = (bottom - top - (rows - 1) * gapY) / rows;
	const scale = Math.min(1, width / 36.6667, height / 24.4444);
	const percent = (value) => `${Number(value.toFixed(4))}%`;
	return {
		cell(index) {
			const row = Math.floor(index / columns);
			const column = index % columns;
			if (count <= 4) return {
				left: column === 0 ? "10%" : "53.3333%",
				top: `${25.5556 + row * 30}%`,
				width: "36.6667%",
				height: "24.4444%"
			};
			return {
				left: percent(10 + column * (width + gapX)),
				top: percent(top + row * (height + gapY)),
				width: percent(width),
				height: percent(height)
			};
		},
		cqw(size) {
			return `${count <= 4 ? size : Number((size * scale).toFixed(4))}cqw`;
		}
	};
}
function createAppShellApplicationMenu(options) {
	if (!isRecord$1(options)) throw new TypeError("application menu options must be an object.");
	const document = requireDocument$1(options.document);
	const mount = requireElement$1(options.mount, "mount");
	if (!Array.isArray(options.actions) || options.actions.length === 0) throw new TypeError("actions must include at least one menu action.");
	const fallbackLocale = optionalString(options.fallbackLocale, "fallbackLocale");
	const rootTestId = requireTestId(options.rootTestId, "rootTestId");
	const statusTestId = requireTestId(options.statusTestId, "statusTestId");
	const menuAttributes = options.attributes ?? {};
	if (!isRecord$1(menuAttributes)) throw new TypeError("attributes must be an object.");
	const rootAttributes = requireAttributes(menuAttributes.root, "attributes.root");
	const statusAttributes = requireAttributes(menuAttributes.status, "attributes.status");
	const root = document.createElement("section");
	const status = document.createElement("p");
	const restoreMountPosition = restoreableMountPosition(document, mount);
	root.setAttribute("data-turbowarp-app-shell-application-menu", "true");
	root.setAttribute("aria-label", options.ariaLabel ?? "Application menu");
	root.style.cssText = "position:absolute;inset:0;z-index:2147483600;display:none;box-sizing:border-box;overflow:hidden;pointer-events:auto;font-family:sans-serif;container-type:inline-size;";
	root.style.position = "absolute";
	root.style.display = "none";
	root.style.cursor = "pointer";
	applyTestId(root, rootTestId);
	applyAttributes(root, rootAttributes);
	status.setAttribute("data-turbowarp-app-shell-menu-status", "true");
	status.setAttribute("role", "status");
	status.setAttribute("aria-live", "polite");
	status.style.cssText = "position:absolute;left:10%;top:93%;width:80%;margin:0;color:#35524c;font-size:2.7cqw;line-height:1.1;text-align:center;";
	applyTestId(status, statusTestId);
	applyAttributes(status, statusAttributes);
	const buttons = /* @__PURE__ */ new Map();
	const seen = /* @__PURE__ */ new Set();
	let locale = optionalString(options.initialLocale, "initialLocale") ?? resolveAppShellLocale();
	const grid = applicationMenuGrid(options.actions.length);
	for (const [index, definition] of options.actions.entries()) {
		if (!isRecord$1(definition)) throw new TypeError(`actions.${index} must be an object.`);
		const id = requireString(definition.id, `actions.${index}.id`);
		if (seen.has(id)) throw new TypeError(`Duplicate application menu action id: ${id}.`);
		seen.add(id);
		const labels = requireLocalizedLabels(definition.labels, `actions.${index}.labels`);
		const icon = requireIcon(definition.icon, `actions.${index}.icon`);
		const enabled = optionalBoolean(definition.enabled, `actions.${index}.enabled`, true);
		const visible = optionalBoolean(definition.visible, `actions.${index}.visible`, true);
		const testId = requireTestId(definition.testId, `actions.${index}.testId`);
		const position = requireRect(definition.position, `actions.${index}.position`);
		const actionAttributes = requireAttributes(definition.attributes, `actions.${index}.attributes`);
		if (typeof definition.onSelect !== "function") throw new TypeError(`actions.${index}.onSelect must be a function.`);
		const onSelect = definition.onSelect;
		const button = document.createElement("button");
		const iconElement = document.createElement("span");
		const label = document.createElement("span");
		const cell = grid.cell(index);
		button.type = "button";
		button.setAttribute("data-turbowarp-app-shell-menu-action", id);
		button.style.cssText = `position:absolute;left:${cell.left};top:${cell.top};width:${cell.width};height:${cell.height};display:flex;min-width:0;min-height:0;align-items:center;justify-content:center;flex-direction:column;gap:.4167cqw;border:.4167cqw solid #005f50;border-radius:2.9167cqw;background:#007d66;color:#fff;box-shadow:0 .625cqw 1.6667cqw rgba(0,0,0,.2);cursor:pointer;font:inherit;`;
		button.style.cursor = "pointer";
		applyTestId(button, testId);
		applyAttributes(button, actionAttributes);
		iconElement.setAttribute("aria-hidden", "true");
		iconElement.style.cssText = `display:inline-flex;width:${grid.cqw(10)};height:${grid.cqw(10)};align-items:center;justify-content:center;line-height:1;font-size:${grid.cqw(6)};`;
		label.style.cssText = `font-size:${grid.cqw(3.8)};line-height:1.15;text-align:center;`;
		button.appendChild(iconElement);
		button.appendChild(label);
		const onClick = (event) => {
			const current = buttons.get(id);
			if (current === void 0 || !current.enabled || !current.visible) return;
			invokeAction(current.onSelect, options.onError, event);
		};
		button.addEventListener("click", onClick);
		buttons.set(id, {
			button,
			icon: iconElement,
			label,
			labels,
			iconDefinition: icon,
			enabled,
			visible,
			position,
			onSelect,
			onClick
		});
		root.appendChild(button);
	}
	root.appendChild(status);
	mount.appendChild(root);
	let statusState = {
		text: options.status?.text ?? "",
		visible: options.status?.visible ?? false,
		tone: options.status?.tone ?? "neutral",
		color: optionalString(options.status?.color, "status.color")
	};
	if (typeof statusState.text !== "string") throw new TypeError("status.text must be a string.");
	if (typeof statusState.visible !== "boolean") throw new TypeError("status.visible must be a boolean.");
	if (![
		"neutral",
		"info",
		"warning",
		"error"
	].includes(statusState.tone)) throw new TypeError("status.tone must be neutral, info, warning, or error.");
	let disposed = false;
	function renderMenu() {
		for (const [id, value] of buttons) {
			const label = localized(value.labels, locale, fallbackLocale, `menu action ${id} labels`);
			value.label.textContent = label;
			value.button.setAttribute("aria-label", label);
			renderIcon(value.icon, value.iconDefinition);
			setButtonEnabled(value.button, value.enabled);
			setElementVisible(value.button, value.visible, "flex");
			value.button.style.boxShadow = value.enabled ? "0 .625cqw 1.6667cqw rgba(0,0,0,.2)" : "none";
			applyRect(value.button, value.position);
		}
		status.textContent = boundedText(statusState.text, 500);
		status.style.color = statusState.color ?? loadingTone(statusState.tone);
		setElementVisible(status, statusState.visible && statusState.text.length > 0, "block");
	}
	function ensureActive() {
		if (disposed) throw new TypeError("application menu is disposed.");
	}
	renderMenu();
	return Object.freeze({
		show(nextLocale) {
			ensureActive();
			locale = optionalString(nextLocale, "nextLocale") ?? locale;
			renderMenu();
			root.style.display = "block";
			return locale;
		},
		hide() {
			if (!disposed) root.style.display = "none";
		},
		setLocale(nextLocale) {
			ensureActive();
			locale = requireString(nextLocale, "nextLocale");
			renderMenu();
			return locale;
		},
		setActionState(id, state) {
			ensureActive();
			const action = buttons.get(requireString(id, "action id"));
			if (action === void 0) throw new TypeError(`Unknown application menu action: ${id}.`);
			if (!isRecord$1(state)) throw new TypeError("application menu action state must be an object.");
			if (state.enabled !== void 0) {
				if (typeof state.enabled !== "boolean") throw new TypeError("action enabled must be a boolean.");
				action.enabled = state.enabled;
			}
			if (state.visible !== void 0) {
				if (typeof state.visible !== "boolean") throw new TypeError("action visible must be a boolean.");
				action.visible = state.visible;
			}
			if (state.labels !== void 0) action.labels = requireLocalizedLabels(state.labels, "action state labels");
			if (state.icon !== void 0) action.iconDefinition = requireIcon(state.icon, "action state icon");
			if (state.position !== void 0) action.position = requireRect(state.position, "action state position");
			renderMenu();
		},
		setStatus(nextStatus) {
			ensureActive();
			if (!isRecord$1(nextStatus)) throw new TypeError("application menu status must be an object.");
			const nextToneValue = nextStatus["tone"] ?? statusState.tone;
			if (![
				"neutral",
				"info",
				"warning",
				"error"
			].includes(String(nextToneValue))) throw new TypeError("status.tone must be neutral, info, warning, or error.");
			const nextTone = nextToneValue;
			statusState = {
				text: optionalString(nextStatus["text"], "status.text") ?? statusState.text,
				visible: optionalBoolean(nextStatus["visible"], "status.visible", statusState.visible),
				tone: nextTone,
				color: optionalString(nextStatus["color"], "status.color") ?? statusState.color
			};
			renderMenu();
		},
		dispose() {
			if (disposed) return;
			disposed = true;
			for (const { button, onClick } of buttons.values()) button.removeEventListener("click", onClick);
			buttons.clear();
			root.remove();
			restoreMountPosition?.();
		},
		get element() {
			return root;
		}
	});
}
//#endregion
//#region src/config.ts
var extensionConfig = {
	id: "kubohiroyaturbowarptitlemenu",
	slug: "turbowarp-title-menu",
	name: "TurboWarp Title Menu",
	description: "Reusable title, application menu, and DSL source storage controls for TurboWarp.",
	author: "Hiroya Kubo",
	license: "MPL-2.0",
	unsandboxed: true,
	homepage: "https://github.com/kubohiroya/turbowarp-title-menu",
	docsURI: "https://kubohiroya.github.io/turbowarp-title-menu/",
	blockIconURI: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0OCA0OCI+PHJlY3QgeD0iNSIgeT0iOCIgd2lkdGg9IjM4IiBoZWlnaHQ9IjMyIiByeD0iNCIgZmlsbD0iIzAwN2Q2NiIvPjxyZWN0IHg9IjkiIHk9IjEyIiB3aWR0aD0iMzAiIGhlaWdodD0iMjQiIHJ4PSIyIiBmaWxsPSIjZjRmZmZiIi8+PHBhdGggZD0iTTE1IDE5aDE4TTE1IDI0aDE4TTE1IDI5aDEyIiBzdHJva2U9IiMwMDdkNjYiIHN0cm9rZS13aWR0aD0iMyIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PC9zdmc+"
};
//#endregion
//#region src/dom.ts
function isRecord(value) {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}
function requireDocument(value) {
	if (!isRecord(value) || typeof value.createElement !== "function") throw new TypeError("document must provide createElement");
	return value;
}
function requireElement(value, name) {
	if (!isRecord(value) || typeof value.appendChild !== "function") throw new TypeError(`${name} must be a DOM element`);
	return value;
}
function ensureRelativeMount(mount) {
	const previous = mount.style.position;
	if (previous === "" || previous === "static") {
		mount.style.position = "relative";
		return () => {
			mount.style.position = previous;
		};
	}
	return () => {};
}
function invokeSafely(operation, onError) {
	try {
		Promise.resolve(operation()).catch((error) => onError?.(error));
	} catch (error) {
		onError?.(error);
	}
}
//#endregion
//#region src/dsl-store.ts
var DslStoreError = class extends Error {
	constructor(code, message, cause) {
		super(message, cause === void 0 ? void 0 : { cause });
		this.name = "DslStoreError";
		this.code = code;
	}
};
var defaultDslSort = Object.freeze({
	field: "updatedAt",
	direction: "desc"
});
var fileStoreName = "files";
var metaStoreName = "meta";
var lastOpenedKey = "last-opened";
var nameIndexName = "by-name";
var encoder = new TextEncoder();
var maximumNameLength = 200;
/** Rejects control characters so a name cannot break the dialog's text rendering. */
function hasControlCharacter(value) {
	for (const character of value) {
		const code = character.codePointAt(0) ?? 0;
		if (code < 32 || code === 127) return true;
	}
	return false;
}
function normalizeName(value) {
	if (typeof value !== "string") throw new DslStoreError("invalid-name", "DSL name must be a string.");
	const name = value.trim();
	if (name.length === 0) throw new DslStoreError("invalid-name", "DSL name must not be empty.");
	if (name.length > maximumNameLength) throw new DslStoreError("invalid-name", `DSL name must be at most ${maximumNameLength} characters.`);
	if (hasControlCharacter(name)) throw new DslStoreError("invalid-name", "DSL name must not contain control characters.");
	return name;
}
function request(input) {
	return new Promise((resolve, reject) => {
		input.onsuccess = () => resolve(input.result);
		input.onerror = () => reject(toStoreError(input.error));
	});
}
function transactionDone(transaction) {
	return new Promise((resolve, reject) => {
		transaction.oncomplete = () => resolve();
		transaction.onabort = () => reject(toStoreError(transaction.error));
		transaction.onerror = () => reject(toStoreError(transaction.error));
	});
}
function toStoreError(cause) {
	const name = cause?.name;
	if (name === "QuotaExceededError") return new DslStoreError("quota", "Browser storage is full. Delete a saved DSL file first.", cause);
	if (name === "ConstraintError") return new DslStoreError("name-taken", "A DSL file with that name already exists.", cause);
	return new DslStoreError("failed", "The DSL storage operation failed.", cause);
}
function compareSummaries(sort) {
	const direction = sort.direction === "asc" ? 1 : -1;
	return (left, right) => {
		if (sort.field === "name") return direction * left.name.localeCompare(right.name, void 0, { numeric: true });
		if (sort.field === "byteLength") return direction * (left.byteLength - right.byteLength) || left.name.localeCompare(right.name);
		return direction * left.updatedAt.localeCompare(right.updatedAt) || left.name.localeCompare(right.name);
	};
}
function toSummary(record) {
	return {
		id: record.id,
		name: record.name,
		byteLength: record.byteLength,
		savedAt: record.savedAt,
		updatedAt: record.updatedAt
	};
}
function createDslStore(options = {}) {
	const factory = options.indexedDB ?? globalThis.indexedDB;
	if (factory === void 0 || typeof factory.open !== "function") throw new DslStoreError("unavailable", "IndexedDB is not available in this environment.");
	const databaseName = options.databaseName ?? "turbowarp-title-menu";
	const maxSourceBytes = options.maxSourceBytes ?? 1048576;
	const maxFileCount = options.maxFileCount ?? 64;
	const now = options.now ?? (() => /* @__PURE__ */ new Date());
	const createId = options.createId ?? defaultCreateId;
	let connection = null;
	function open() {
		connection ?? (connection = new Promise((resolve, reject) => {
			const opening = factory.open(databaseName, 1);
			opening.onupgradeneeded = () => {
				const database = opening.result;
				if (!database.objectStoreNames.contains(fileStoreName)) database.createObjectStore(fileStoreName, { keyPath: "id" }).createIndex(nameIndexName, "name", { unique: true });
				if (!database.objectStoreNames.contains(metaStoreName)) database.createObjectStore(metaStoreName, { keyPath: "key" });
			};
			opening.onsuccess = () => resolve(opening.result);
			opening.onerror = () => reject(toStoreError(opening.error));
			opening.onblocked = () => reject(new DslStoreError("failed", "Another tab is upgrading the DSL database."));
		}));
		return connection;
	}
	async function readAll() {
		const transaction = (await open()).transaction(fileStoreName, "readonly");
		const records = await request(transaction.objectStore(fileStoreName).getAll());
		await transactionDone(transaction);
		return records;
	}
	async function readOne(id) {
		const transaction = (await open()).transaction(fileStoreName, "readonly");
		const record = await request(transaction.objectStore(fileStoreName).get(id));
		await transactionDone(transaction);
		return record ?? null;
	}
	return Object.freeze({
		databaseName,
		async list(sort = defaultDslSort) {
			return (await readAll()).map(toSummary).sort(compareSummaries(sort));
		},
		async count() {
			const transaction = (await open()).transaction(fileStoreName, "readonly");
			const total = await request(transaction.objectStore(fileStoreName).count());
			await transactionDone(transaction);
			return total;
		},
		get(id) {
			return readOne(id);
		},
		async save(file) {
			const name = normalizeName(file.name);
			if (typeof file.source !== "string") throw new DslStoreError("invalid-source", "DSL source must be a string.");
			const byteLength = encoder.encode(file.source).byteLength;
			if (byteLength > maxSourceBytes) throw new DslStoreError("too-large", `DSL source exceeds ${maxSourceBytes} bytes.`);
			const transaction = (await open()).transaction(fileStoreName, "readwrite");
			const files = transaction.objectStore(fileStoreName);
			const existing = await request(files.index(nameIndexName).get(name));
			if (existing === void 0) {
				if (await request(files.count()) >= maxFileCount) {
					transaction.abort();
					throw new DslStoreError("too-many", `The DSL store already holds ${maxFileCount} files.`);
				}
			}
			const timestamp = now().toISOString();
			const record = {
				id: existing?.id ?? createId(),
				name,
				source: file.source,
				byteLength,
				savedAt: existing?.savedAt ?? timestamp,
				updatedAt: timestamp
			};
			await request(files.put(record));
			await transactionDone(transaction);
			return record;
		},
		async rename(id, nextName) {
			const name = normalizeName(nextName);
			const transaction = (await open()).transaction(fileStoreName, "readwrite");
			const files = transaction.objectStore(fileStoreName);
			const existing = await request(files.get(id));
			if (existing === void 0) {
				transaction.abort();
				throw new DslStoreError("not-found", `No DSL file with id ${id}.`);
			}
			if (existing.name !== name) {
				if (await request(files.index(nameIndexName).get(name)) !== void 0) {
					transaction.abort();
					throw new DslStoreError("name-taken", `A DSL file named ${name} already exists.`);
				}
			}
			const record = {
				...existing,
				name,
				updatedAt: now().toISOString()
			};
			await request(files.put(record));
			await transactionDone(transaction);
			return record;
		},
		async remove(id) {
			const transaction = (await open()).transaction([fileStoreName, metaStoreName], "readwrite");
			await request(transaction.objectStore(fileStoreName).delete(id));
			const meta = transaction.objectStore(metaStoreName);
			if ((await request(meta.get(lastOpenedKey)))?.id === id) await request(meta.delete(lastOpenedKey));
			await transactionDone(transaction);
		},
		async clear() {
			const transaction = (await open()).transaction([fileStoreName, metaStoreName], "readwrite");
			await request(transaction.objectStore(fileStoreName).clear());
			await request(transaction.objectStore(metaStoreName).clear());
			await transactionDone(transaction);
		},
		async lastOpened() {
			const transaction = (await open()).transaction(metaStoreName, "readonly");
			const pointer = await request(transaction.objectStore(metaStoreName).get(lastOpenedKey));
			await transactionDone(transaction);
			if (pointer === void 0) return null;
			return readOne(pointer.id);
		},
		async markOpened(id) {
			if (await readOne(id) === null) throw new DslStoreError("not-found", `No DSL file with id ${id}.`);
			const transaction = (await open()).transaction(metaStoreName, "readwrite");
			await request(transaction.objectStore(metaStoreName).put({
				key: lastOpenedKey,
				id
			}));
			await transactionDone(transaction);
		},
		close() {
			const pending = connection;
			connection = null;
			pending?.then((database) => database.close()).catch(() => void 0);
		}
	});
}
function defaultCreateId() {
	const crypto = globalThis.crypto;
	if (typeof crypto?.randomUUID === "function") return crypto.randomUUID();
	return `dsl-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
/** Reads a picked browser file into a record shape the store accepts. */
async function readDslFile(file, maxSourceBytes = 1048576) {
	if (typeof file?.text !== "function") throw new DslStoreError("invalid-source", "file must be a browser File.");
	if (file.size > maxSourceBytes) throw new DslStoreError("too-large", `DSL file exceeds ${maxSourceBytes} bytes.`);
	return {
		name: file.name,
		source: await file.text()
	};
}
//#endregion
//#region src/dsl-files-dialog.ts
var defaultSortDirections = Object.freeze({
	name: "asc",
	updatedAt: "desc",
	byteLength: "desc"
});
function requireLocales$2(value) {
	if (!isRecord(value) || Object.keys(value).length === 0) throw new TypeError("locales must contain at least one locale");
	return value;
}
function textFor$2(locales, locale) {
	const text = locales[locale] ?? locales["en"] ?? Object.values(locales)[0];
	if (text === void 0) throw new TypeError("locales must contain at least one locale");
	return text;
}
function defaultFormatSize$2(byteLength) {
	if (byteLength < 1024) return `${byteLength} B`;
	if (byteLength < 1048576) return `${(byteLength / 1024).toFixed(1)} KB`;
	return `${(byteLength / 1048576).toFixed(1)} MB`;
}
function defaultFormatDate$2(isoDate) {
	const parsed = new Date(isoDate);
	if (Number.isNaN(parsed.getTime())) return isoDate;
	const pad = (value) => String(value).padStart(2, "0");
	return `${parsed.getFullYear()}-${pad(parsed.getMonth() + 1)}-${pad(parsed.getDate())} ${pad(parsed.getHours())}:${pad(parsed.getMinutes())}`;
}
function defaultDescribeError$2(error) {
	if (error instanceof Error && error.message.length > 0) return error.message;
	return String(error);
}
function createDslFilesDialog(options) {
	if (!isRecord(options)) throw new TypeError("DSL files dialog options must be an object");
	const document = requireDocument(options.document ?? globalThis.document);
	const mount = requireElement(options.mount ?? document.body, "mount");
	const locales = requireLocales$2(options.locales);
	const describeError = options.describeError ?? defaultDescribeError$2;
	const formatSize = options.formatSize ?? defaultFormatSize$2;
	const formatDate = options.formatDate ?? defaultFormatDate$2;
	let locale = options.initialLocale ?? "en";
	let sort = options.initialSort ?? defaultDslSort;
	let summaries = [];
	let renamingId = null;
	let confirmingRemovalId = null;
	let status = "";
	let disposed = false;
	const root = document.createElement("section");
	const panel = document.createElement("div");
	const heading = document.createElement("h1");
	const closeButton = document.createElement("button");
	const toolbar = document.createElement("div");
	const addButton = document.createElement("button");
	const sortBar = document.createElement("div");
	const listElement = document.createElement("div");
	const statusElement = document.createElement("p");
	root.setAttribute("data-turbowarp-title-menu-dsl-files", "true");
	root.style.cssText = "position:absolute;inset:0;z-index:2147483646;align-items:center;justify-content:center;padding:16px;box-sizing:border-box;background:rgba(0,0,0,.6);font-family:sans-serif;";
	root.style.display = "none";
	panel.style.cssText = "width:min(720px,96%);max-height:90%;display:flex;flex-direction:column;gap:10px;padding:18px;box-sizing:border-box;background:#ffffff;color:#1b1f27;border-radius:10px;box-shadow:0 10px 36px rgba(0,0,0,.45);overflow:hidden;";
	heading.style.cssText = "margin:0;font-size:20px;line-height:1.3;";
	toolbar.style.cssText = "display:flex;gap:8px;align-items:center;flex-wrap:wrap;";
	sortBar.style.cssText = "display:flex;gap:6px;align-items:center;flex-wrap:wrap;";
	listElement.style.cssText = "flex:1;min-height:0;overflow:auto;display:flex;flex-direction:column;gap:6px;";
	statusElement.style.cssText = "margin:0;min-height:18px;font-size:13px;color:#8a1c1c;";
	const headerRow = document.createElement("div");
	headerRow.style.cssText = "display:flex;align-items:center;justify-content:space-between;gap:8px;";
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
	if (previousMountPosition === "" || previousMountPosition === "static") mount.style.position = "relative";
	mount.appendChild(root);
	function styleButton(button, tone) {
		const palette = {
			primary: "background:#1f6feb;color:#ffffff;border:1px solid #1f6feb;",
			plain: "background:#f2f4f8;color:#1b1f27;border:1px solid #ccd2de;",
			danger: "background:#b42318;color:#ffffff;border:1px solid #b42318;",
			active: "background:#d7e6ff;color:#0b3a82;border:1px solid #1f6feb;"
		}[tone];
		button.style.cssText = `${palette}padding:5px 10px;border-radius:6px;font-size:13px;cursor:pointer;`;
	}
	function run(operation) {
		try {
			Promise.resolve(operation()).catch(handleFailure);
		} catch (error) {
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
			status = "";
			try {
				await operation();
			} catch (error) {
				status = describeError(error);
				options.onError?.(error);
				render();
				return;
			}
			await reload();
		});
	}
	async function reload() {
		if (disposed) return;
		summaries = await options.list(sort);
		render();
	}
	function selectSort(field) {
		if (sort.field === field) sort = {
			field,
			direction: sort.direction === "asc" ? "desc" : "asc"
		};
		else sort = {
			field,
			direction: defaultSortDirections[field]
		};
		renamingId = null;
		confirmingRemovalId = null;
		mutate(() => void 0);
	}
	function createButton(label, tone, onClick) {
		const button = document.createElement("button");
		button.type = "button";
		button.textContent = label;
		styleButton(button, tone);
		button.addEventListener("click", onClick);
		return button;
	}
	function renderSortBar(text) {
		const arrow = sort.direction === "asc" ? " ▲" : " ▼";
		const fields = [
			["name", text.sortByName],
			["updatedAt", text.sortByDate],
			["byteLength", text.sortBySize]
		];
		for (const [field, label] of fields) {
			const active = sort.field === field;
			const button = createButton(active ? `${label}${arrow}` : label, active ? "active" : "plain", () => selectSort(field));
			button.setAttribute("data-sort-field", field);
			if (active) button.setAttribute("aria-pressed", "true");
			sortBar.appendChild(button);
		}
	}
	function renderRow(summary, text) {
		const row = document.createElement("div");
		row.setAttribute("data-dsl-file-id", summary.id);
		row.style.cssText = "display:flex;align-items:center;gap:8px;padding:8px;border:1px solid #e2e6ee;border-radius:8px;";
		if (renamingId === summary.id) {
			const input = document.createElement("input");
			input.type = "text";
			input.value = summary.name;
			input.setAttribute("data-rename-input", summary.id);
			input.style.cssText = "flex:1;min-width:0;padding:5px 8px;border:1px solid #1f6feb;border-radius:6px;font-size:14px;";
			const commit = () => {
				const nextName = input.value;
				renamingId = null;
				mutate(() => options.onRename(summary.id, nextName));
			};
			input.addEventListener("keydown", (event) => {
				const key = event.key;
				if (key === "Enter") commit();
				if (key === "Escape") {
					renamingId = null;
					render();
				}
			});
			row.appendChild(input);
			row.appendChild(createButton(text.confirm, "primary", commit));
			row.appendChild(createButton(text.cancel, "plain", () => {
				renamingId = null;
				render();
			}));
			return row;
		}
		const name = document.createElement("span");
		name.textContent = summary.name;
		name.style.cssText = "flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:14px;";
		const date = document.createElement("span");
		date.textContent = formatDate(summary.updatedAt);
		date.style.cssText = "font-size:12px;color:#5a6172;white-space:nowrap;";
		const size = document.createElement("span");
		size.textContent = formatSize(summary.byteLength);
		size.style.cssText = "font-size:12px;color:#5a6172;white-space:nowrap;min-width:64px;text-align:right;";
		row.appendChild(name);
		row.appendChild(date);
		row.appendChild(size);
		if (confirmingRemovalId === summary.id) {
			row.appendChild(createButton(text.confirmRemove, "danger", () => {
				confirmingRemovalId = null;
				mutate(() => options.onRemove(summary.id));
			}));
			row.appendChild(createButton(text.cancel, "plain", () => {
				confirmingRemovalId = null;
				render();
			}));
			return row;
		}
		row.appendChild(createButton(text.open, "primary", () => {
			mutate(() => options.onOpen(summary.id));
		}));
		row.appendChild(createButton(text.rename, "plain", () => {
			renamingId = summary.id;
			confirmingRemovalId = null;
			render();
		}));
		row.appendChild(createButton(text.remove, "plain", () => {
			confirmingRemovalId = summary.id;
			renamingId = null;
			render();
		}));
		return row;
	}
	function render() {
		if (disposed) return;
		const text = textFor$2(locales, locale);
		heading.textContent = text.title;
		closeButton.textContent = text.close;
		closeButton.setAttribute("aria-label", text.close);
		addButton.textContent = text.add;
		statusElement.textContent = status;
		sortBar.replaceChildren();
		renderSortBar(text);
		listElement.replaceChildren();
		if (summaries.length === 0) {
			const empty = document.createElement("p");
			empty.textContent = text.empty;
			empty.style.cssText = "margin:8px 0;font-size:14px;color:#5a6172;";
			listElement.appendChild(empty);
		} else for (const summary of summaries) listElement.appendChild(renderRow(summary, text));
	}
	styleButton(closeButton, "plain");
	styleButton(addButton, "primary");
	closeButton.type = "button";
	addButton.type = "button";
	closeButton.addEventListener("click", () => hide());
	addButton.addEventListener("click", () => {
		mutate(() => options.onAdd());
	});
	function hide() {
		if (disposed) return;
		renamingId = null;
		confirmingRemovalId = null;
		root.style.display = "none";
	}
	function ensureActive() {
		if (disposed) throw new TypeError("DSL files dialog is disposed");
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
			if (nextLocale !== void 0) locale = nextLocale;
			status = "";
			root.style.display = "flex";
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
			if (disposed) return;
			disposed = true;
			root.remove();
			if (previousMountPosition === "" || previousMountPosition === "static") mount.style.position = previousMountPosition;
		}
	});
}
//#endregion
//#region src/events.ts
var dslOpenEventName = "turbowarp-title-menu:dsl-open";
var dslReloadEventName = "turbowarp-title-menu:dsl-reload";
/**
* Announces an opened DSL source on the window.
*
* The extension also starts a Scratch hat, but a packaged host that embeds this extension may run
* its own runtime outside the VM, so the DOM event stays the transport that assumes no Scratch.
*/
function dispatchDslSourceEvent(type, record) {
	const target = globalThis;
	if (typeof target.dispatchEvent !== "function") return;
	const event = typeof CustomEvent === "function" ? new CustomEvent(type, { detail: { record } }) : new Event(type);
	if (!("detail" in event)) Object.defineProperty(event, "detail", { value: { record } });
	target.dispatchEvent(event);
}
//#endregion
//#region node_modules/.pnpm/@kubohiroya+turbowarp-extension-loader@0.17.0/node_modules/@kubohiroya/turbowarp-extension-loader/dist/cache-gzip.js
/** Gzip utilities for persistent extension caches. The caller remains responsible for SHA-256 verification. */
async function gzipBytes(bytes) {
	if (!(bytes instanceof Uint8Array)) throw new TypeError("Expected Uint8Array");
	if (typeof CompressionStream !== "function") throw new Error("CompressionStream gzip unavailable");
	return new Uint8Array(await new Response(new Blob([bytes]).stream().pipeThrough(new CompressionStream("gzip"))).arrayBuffer());
}
async function gunzipBytes(compressed, maxOutputBytes) {
	if (!(compressed instanceof Uint8Array) || !Number.isSafeInteger(maxOutputBytes) || maxOutputBytes < 1) throw new TypeError("Invalid compressed bytes or output limit");
	if (typeof DecompressionStream !== "function") throw new Error("DecompressionStream gzip unavailable");
	const reader = new Blob([compressed]).stream().pipeThrough(new DecompressionStream("gzip")).getReader();
	const chunks = [];
	let size = 0;
	try {
		while (true) {
			const { done, value } = await reader.read();
			if (done) break;
			size += value.byteLength;
			if (size > maxOutputBytes) throw new Error("Decompressed cache exceeds byte limit");
			chunks.push(value);
		}
	} catch (error) {
		await reader.cancel(error).catch(() => {});
		throw error;
	} finally {
		reader.releaseLock();
	}
	const result = new Uint8Array(size);
	let offset = 0;
	for (const chunk of chunks) {
		result.set(chunk, offset);
		offset += chunk.byteLength;
	}
	return result;
}
//#endregion
//#region node_modules/.pnpm/@kubohiroya+turbowarp-extension-loader@0.17.0/node_modules/@kubohiroya/turbowarp-extension-loader/dist/limits.js
var MiB = 1048576;
/**
* The one source of the default size limits. A file the project codec accepts as an archive entry
* must also be one the loader reads, so the per-extension and total defaults are the codec's entry
* and expansion limits; real extensions such as a bundled story runtime reach several MiB.
*/
var DEFAULT_ENTRY_BYTES = 16 * MiB;
var DEFAULT_TOTAL_BYTES = 64 * MiB;
Object.freeze({
	maxExtensions: 64,
	maxBytes: DEFAULT_ENTRY_BYTES,
	maxTotalBytes: DEFAULT_TOTAL_BYTES,
	timeoutMs: 3e4
});
Math.ceil(DEFAULT_ENTRY_BYTES / 3) * 4 + 1024;
//#endregion
//#region node_modules/.pnpm/@kubohiroya+turbowarp-extension-loader@0.17.0/node_modules/@kubohiroya/turbowarp-extension-loader/dist/indexeddb-cache.js
/**
* The bucket for bytes that belong to no one project.
*
* A catalog extension is pinned to a version and shared by many projects, so filing it under
* whichever project happened to fetch it first would make that project look responsible for
* storage every other one reuses, and releasing that project would evict bytes the rest still
* want. It is not a URI, so no project can name it.
*/
var SHARED_BUCKET = "shared";
var kinds = /* @__PURE__ */ new Set([
	"costume",
	"backdrop",
	"sound",
	"document",
	"extension",
	"other"
]);
var maxLabelText = 1024;
var maxLabelsPerCall = 256;
/** Keep only a URL that can be shown without leaking a credential or a one-time token. */
function sanitizeURL(value) {
	let url;
	try {
		url = new URL(value);
	} catch {
		return {};
	}
	if (url.protocol !== "https:" && url.protocol !== "http:") return {};
	const redacted = !!(url.username || url.password || url.search || url.hash);
	url.username = "";
	url.password = "";
	url.search = "";
	url.hash = "";
	return redacted ? {
		url: url.href,
		urlRedacted: true
	} : { url: url.href };
}
function labelRecord(bucket, key, label, observedAt) {
	if (!label || typeof label !== "object" || typeof label.ref !== "string" || label.ref.length > maxLabelText) throw new TypeError("A cache label needs a string ref");
	const text = (field) => {
		const value = label[field];
		if (value === void 0) return void 0;
		if (typeof value !== "string" || value.length > maxLabelText) throw new TypeError(`Invalid cache label ${field}`);
		return value;
	};
	if (label.kind !== void 0 && !kinds.has(label.kind)) throw new TypeError("Invalid cache label kind");
	const name = text("name");
	const projectName = text("projectName");
	const url = text("url");
	return {
		bucket,
		key,
		ref: label.ref,
		observedAt,
		...label.kind === void 0 ? {} : { kind: label.kind },
		...name === void 0 ? {} : { name },
		...projectName === void 0 ? {} : { projectName },
		...url === void 0 ? {} : sanitizeURL(url)
	};
}
/** Persistent, content-addressed cache. The Loader independently verifies SHA-256 on every hit.
* Storage is untrusted: this adapter is not an authorization or integrity boundary.
*/
function createIndexedDBContentCache({ indexedDB = globalThis.indexedDB, databaseName = "turbowarp-plus-extension-cache", appURI, sharedDigests, maxBytes = 33554432, maxDecompressedBytes = DEFAULT_ENTRY_BYTES, now = Date.now } = {}) {
	if (!indexedDB || typeof indexedDB.open !== "function") throw new Error("IndexedDB unavailable");
	if (typeof databaseName !== "string" || !databaseName || !Number.isSafeInteger(maxBytes) || maxBytes < 1 || !Number.isSafeInteger(maxDecompressedBytes) || maxDecompressedBytes < 1 || typeof now !== "function" || appURI !== void 0 && typeof appURI !== "string" && typeof appURI !== "function") throw new TypeError("Invalid IndexedDB cache options");
	/** The project a write is filed under, read when it happens. */
	function currentAppURI() {
		const uri = typeof appURI === "function" ? appURI() : appURI;
		if (uri !== void 0 && typeof uri !== "string") throw new TypeError("appURI must return a string or undefined");
		return uri;
	}
	let dbPromise;
	function open() {
		if (!dbPromise) dbPromise = new Promise((resolve, reject) => {
			const request = indexedDB.open(databaseName, 2);
			request.onupgradeneeded = () => {
				const db = request.result;
				if (!db.objectStoreNames.contains("content")) db.createObjectStore("content", { keyPath: "key" });
				if (!db.objectStoreNames.contains("usage")) {
					const usage = db.createObjectStore("usage", { keyPath: ["bucket", "key"] });
					usage.createIndex("key", "key");
					usage.createIndex("bucket", "bucket");
					request.transaction.objectStore("content").clear();
				}
			};
			request.onsuccess = () => {
				const db = request.result;
				db.onversionchange = () => db.close();
				resolve(db);
			};
			request.onerror = () => reject(request.error || /* @__PURE__ */ new Error("IndexedDB open failed"));
			request.onblocked = () => reject(/* @__PURE__ */ new Error("IndexedDB upgrade blocked"));
		}).catch((error) => {
			dbPromise = void 0;
			throw error;
		});
		return dbPromise;
	}
	let labelsPromise;
	function openLabels() {
		if (!labelsPromise) labelsPromise = new Promise((resolve, reject) => {
			const request = indexedDB.open(`${databaseName}-labels`, 1);
			request.onupgradeneeded = () => {
				const db = request.result;
				if (!db.objectStoreNames.contains("labels")) db.createObjectStore("labels", { keyPath: [
					"bucket",
					"key",
					"ref"
				] }).createIndex("claim", ["bucket", "key"]);
			};
			request.onsuccess = () => {
				const db = request.result;
				db.onversionchange = () => db.close();
				resolve(db);
			};
			request.onerror = () => reject(request.error || /* @__PURE__ */ new Error("IndexedDB open failed"));
			request.onblocked = () => reject(/* @__PURE__ */ new Error("IndexedDB upgrade blocked"));
		}).catch((error) => {
			labelsPromise = void 0;
			throw error;
		});
		return labelsPromise;
	}
	/**
	* Drop the labels of claims that were released. Best effort: a label whose claim is gone is
	* never listed, so a failure here leaves nothing visible behind.
	*/
	async function forgetLabels(claims) {
		if (!claims.length) return;
		try {
			await transaction(await openLabels(), "readwrite", (store) => {
				for (const { bucket, key } of claims) {
					const request = store.index("claim").getAllKeys([bucket, key]);
					request.onsuccess = () => {
						for (const label of request.result) store.delete(label);
					};
				}
			}, "labels");
		} catch {}
	}
	/** The bucket a write is filed under now. */
	const bucketFor = (key) => {
		const uri = currentAppURI();
		return uri === void 0 || sharedDigests?.has(key) ? SHARED_BUCKET : uri;
	};
	function transaction(db, mode, work, stores = "content") {
		return new Promise((resolve, reject) => {
			const tx = db.transaction(stores, mode);
			let value;
			tx.oncomplete = () => resolve(value);
			tx.onerror = () => reject(tx.error || /* @__PURE__ */ new Error("IndexedDB transaction failed"));
			tx.onabort = () => reject(tx.error || /* @__PURE__ */ new Error("IndexedDB transaction aborted"));
			try {
				work(tx.objectStore(typeof stores === "string" ? stores : stores[0]), (result) => {
					value = result;
				}, tx);
			} catch (error) {
				try {
					tx.abort();
				} catch {}
				reject(error);
			}
		});
	}
	const keyValid = (key) => typeof key === "string" && /^[a-f0-9]{64}$/.test(key);
	const validBytes = (value) => value instanceof Uint8Array;
	const validRecord = (entry) => !!entry && entry.format === "gzip-v1" && entry.bytes instanceof ArrayBuffer && Number.isSafeInteger(entry.originalBytes) && entry.originalBytes >= 0 && entry.originalBytes <= maxDecompressedBytes && entry.bytes.byteLength <= maxBytes;
	const dropClaims = (usage, key) => {
		const claims = usage.index("key").getAllKeys(key);
		claims.onsuccess = () => {
			for (const claim of claims.result) usage.delete(claim);
		};
	};
	function sweep(store, usage, protectedKey = null) {
		const request = store.getAll();
		request.onsuccess = () => {
			let total = 0;
			const kept = [];
			for (const record of request.result) {
				if (!validRecord(record)) {
					store.delete(record.key);
					dropClaims(usage, record.key);
					continue;
				}
				total += record.bytes.byteLength;
				kept.push(record);
			}
			kept.sort((a, b) => (a.lastAccess || 0) - (b.lastAccess || 0));
			for (const record of kept) {
				if (total <= maxBytes) break;
				if (record.key === protectedKey) continue;
				store.delete(record.key);
				dropClaims(usage, record.key);
				total -= record.bytes.byteLength;
			}
		};
	}
	/**
	* Release claims that exist, then free the bytes no claim is left on. Every delete is issued
	* before any check of what remains, so releasing two claims on one digest frees it once.
	*/
	function releaseExisting(store, usage, claims, result) {
		for (const { bucket, key } of claims) {
			usage.delete([bucket, key]);
			result.released++;
		}
		for (const key of new Set(claims.map((claim) => claim.key))) {
			const others = usage.index("key").count(key);
			others.onsuccess = () => {
				if (others.result > 0) return;
				const record = store.get(key);
				record.onsuccess = () => {
					const entry = record.result;
					if (!entry) return;
					result.freed += entry.bytes?.byteLength || 0;
					store.delete(key);
				};
			};
		}
	}
	async function release(bucket, keys) {
		if (typeof bucket !== "string" || !bucket) throw new TypeError("A bucket name is required");
		if (keys !== null && (!Array.isArray(keys) || keys.some((key) => !keyValid(key)))) throw new TypeError("Cache keys must be SHA-256 digests");
		const wanted = keys === null ? null : new Set(keys);
		const db = await open();
		const releasedClaims = [];
		const outcome = await transaction(db, "readwrite", (store, set, tx) => {
			const usage = tx.objectStore("usage");
			const result = {
				released: 0,
				freed: 0
			};
			set(result);
			const mine = usage.index("bucket").getAll(bucket);
			mine.onsuccess = () => {
				const claims = mine.result.filter((claim) => wanted === null || wanted.has(claim.key)).map((claim) => ({
					bucket,
					key: claim.key
				}));
				releasedClaims.push(...claims);
				releaseExisting(store, usage, claims, result);
			};
		}, ["content", "usage"]);
		await forgetLabels(releasedClaims);
		return outcome;
	}
	async function releaseClaims(claims) {
		if (!Array.isArray(claims) || claims.some((claim) => !claim || typeof claim.bucket !== "string" || !claim.bucket || !keyValid(claim.key))) throw new TypeError("Each claim needs a bucket and a SHA-256 digest");
		const unique = [...new Map(claims.map((claim) => [JSON.stringify([claim.bucket, claim.key]), {
			bucket: claim.bucket,
			key: claim.key
		}])).values()];
		const db = await open();
		const releasedClaims = [];
		const outcome = await transaction(db, "readwrite", (store, set, tx) => {
			const usage = tx.objectStore("usage");
			const result = {
				released: 0,
				freed: 0
			};
			set(result);
			if (!unique.length) return;
			let pending = unique.length;
			const existing = [];
			for (const claim of unique) {
				const request = usage.getKey([claim.bucket, claim.key]);
				request.onsuccess = () => {
					if (request.result !== void 0) existing.push(claim);
					if (--pending) return;
					releasedClaims.push(...existing);
					releaseExisting(store, usage, existing, result);
				};
			}
		}, ["content", "usage"]);
		await forgetLabels(releasedClaims);
		return outcome;
	}
	/** Record labels where `bucket` still claims `key`. */
	async function describeIn(bucket, key, labels) {
		if (labels.length > maxLabelsPerCall) throw new RangeError("Too many cache labels in one call");
		const time = now();
		const records = labels.map((label) => labelRecord(bucket, key, label, time));
		if (!records.length) return 0;
		if (!await transaction(await open(), "readonly", (store, set) => {
			const request = store.getKey([bucket, key]);
			request.onsuccess = () => set(request.result !== void 0);
		}, "usage")) return 0;
		await transaction(await openLabels(), "readwrite", (store) => {
			for (const record of records) store.put(record);
		}, "labels");
		return records.length;
	}
	return Object.freeze({
		async get(key, { signal } = {}) {
			if (!keyValid(key)) throw new TypeError("Invalid SHA-256 cache key");
			if (signal?.aborted) throw signal.reason;
			const record = await transaction(await open(), "readwrite", (store, set) => {
				const request = store.get(key);
				request.onsuccess = () => {
					const entry = request.result;
					if (!entry) {
						set(void 0);
						return;
					}
					if (!validRecord(entry)) {
						store.delete(key);
						set(void 0);
						return;
					}
					entry.lastAccess = now();
					store.put(entry);
					set({
						bytes: entry.bytes.slice(0),
						originalBytes: entry.originalBytes
					});
				};
			});
			if (signal?.aborted) throw signal.reason;
			if (!record) return void 0;
			const bytes = await gunzipBytes(new Uint8Array(record.bytes), maxDecompressedBytes);
			if (bytes.byteLength !== record.originalBytes) throw new Error("Cached decompressed length mismatch");
			if (signal?.aborted) throw signal.reason;
			return bytes;
		},
		async put(key, bytes, { signal, label } = {}) {
			if (!keyValid(key) || !validBytes(bytes)) throw new TypeError("Cache content requires a SHA-256 key and bytes");
			if (label !== void 0) labelRecord(SHARED_BUCKET, key, label, 0);
			if (signal?.aborted) throw signal.reason;
			if (bytes.byteLength > maxDecompressedBytes) throw new RangeError("Cache input exceeds decompressed size limit");
			const uri = currentAppURI();
			const originalBytes = bytes.byteLength;
			const compressed = await gzipBytes(bytes);
			if (signal?.aborted) throw signal.reason;
			const db = await open();
			const bucket = uri === void 0 || sharedDigests?.has(key) ? SHARED_BUCKET : uri;
			await transaction(db, "readwrite", (store, _set, tx) => {
				const usage = tx.objectStore("usage");
				const time = now();
				if (compressed.byteLength <= maxBytes) {
					store.put({
						key,
						format: "gzip-v1",
						bytes: compressed.buffer,
						originalBytes,
						lastAccess: time
					});
					usage.put({
						bucket,
						key,
						lastAccess: time
					});
				} else {
					store.delete(key);
					usage.delete([bucket, key]);
				}
				sweep(store, usage, compressed.byteLength <= maxBytes ? key : null);
			}, ["content", "usage"]);
			if (label !== void 0) await describeIn(bucket, key, [label]);
		},
		async clear() {
			await transaction(await open(), "readwrite", (store, _set, tx) => {
				store.clear();
				tx.objectStore("usage").clear();
			}, ["content", "usage"]);
			try {
				await transaction(await openLabels(), "readwrite", (store) => store.clear(), "labels");
			} catch {}
		},
		async getSize() {
			return transaction(await open(), "readonly", (store, set) => {
				const request = store.getAll();
				request.onsuccess = () => set(request.result.reduce((size, record) => ({
					entries: size.entries + 1,
					bytes: size.bytes + (record.bytes?.byteLength || 0)
				}), {
					entries: 0,
					bytes: 0
				}));
			});
		},
		async listBuckets() {
			return transaction(await open(), "readonly", (store, set, tx) => {
				const claims = tx.objectStore("usage").getAll();
				const records = store.getAll();
				claims.onsuccess = () => {
					records.onsuccess = () => {
						const sizes = new Map(records.result.map((record) => [record.key, record.bytes?.byteLength || 0]));
						const totals = /* @__PURE__ */ new Map();
						for (const claim of claims.result) {
							const total = totals.get(claim.bucket) || {
								entries: 0,
								bytes: 0
							};
							total.entries++;
							total.bytes += sizes.get(claim.key) || 0;
							totals.set(claim.bucket, total);
						}
						set([...totals].map(([bucket, total]) => Object.freeze({
							bucket,
							...total
						})));
					};
				};
			}, ["content", "usage"]);
		},
		async listBucket(bucket) {
			if (typeof bucket !== "string" || !bucket) throw new TypeError("A bucket name is required");
			return transaction(await open(), "readonly", (store, set, tx) => {
				const claims = tx.objectStore("usage").index("bucket").getAll(bucket);
				const records = store.getAll();
				claims.onsuccess = () => {
					records.onsuccess = () => {
						const byKey = new Map(records.result.map((record) => [record.key, record]));
						set(claims.result.flatMap((claim) => {
							const record = byKey.get(claim.key);
							if (!record) return [];
							return [Object.freeze({
								bucket,
								key: claim.key,
								bytes: record.bytes?.byteLength || 0,
								originalBytes: record.originalBytes,
								lastAccess: claim.lastAccess
							})];
						}));
					};
				};
			}, ["content", "usage"]);
		},
		deleteBucket(bucket) {
			return release(bucket, null);
		},
		deleteFromBucket(bucket, keys) {
			return release(bucket, keys);
		},
		releaseClaims,
		async describe(key, labels, { bucket } = {}) {
			if (!keyValid(key)) throw new TypeError("Invalid SHA-256 cache key");
			if (bucket !== void 0 && (typeof bucket !== "string" || !bucket)) throw new TypeError("A bucket name is required");
			const list = Array.isArray(labels) ? labels : [labels];
			return describeIn(bucket ?? bucketFor(key), key, list);
		},
		async listEntries() {
			const { records, claims } = await transaction(await open(), "readonly", (store, set, tx) => {
				const claims = tx.objectStore("usage").getAll();
				const records = store.getAll();
				claims.onsuccess = () => {
					records.onsuccess = () => set({
						records: records.result,
						claims: claims.result
					});
				};
			}, ["content", "usage"]);
			let labels = [];
			try {
				labels = await transaction(await openLabels(), "readonly", (store, set) => {
					const request = store.getAll();
					request.onsuccess = () => set(request.result);
				}, "labels");
			} catch {}
			const claimsByKey = /* @__PURE__ */ new Map();
			for (const claim of claims) claimsByKey.set(claim.key, [...claimsByKey.get(claim.key) || [], claim]);
			const claimed = new Set(claims.map((claim) => JSON.stringify([claim.bucket, claim.key])));
			const labelsByKey = /* @__PURE__ */ new Map();
			for (const label of labels) {
				if (!claimed.has(JSON.stringify([label.bucket, label.key]))) continue;
				labelsByKey.set(label.key, [...labelsByKey.get(label.key) || [], label]);
			}
			return records.filter(validRecord).sort((a, b) => a.key < b.key ? -1 : a.key > b.key ? 1 : 0).map((record) => {
				const mine = claimsByKey.get(record.key) || [];
				return Object.freeze({
					key: record.key,
					bytes: record.bytes.byteLength,
					originalBytes: record.originalBytes,
					lastAccess: Math.max(record.lastAccess || 0, ...mine.map((claim) => claim.lastAccess)),
					claims: Object.freeze(mine.map((claim) => Object.freeze({
						bucket: claim.bucket,
						lastAccess: claim.lastAccess
					}))),
					labels: Object.freeze((labelsByKey.get(record.key) || []).map((label) => {
						const { key: _key, ...rest } = label;
						return Object.freeze(rest);
					}))
				});
			});
		},
		async close() {
			if (dbPromise) {
				(await dbPromise).close();
				dbPromise = void 0;
			}
			if (labelsPromise) {
				try {
					(await labelsPromise).close();
				} catch {}
				labelsPromise = void 0;
			}
		}
	});
}
//#endregion
//#region src/cache-asset-model.ts
/**
* The table model behind the cache manager: rows, search, filters, sort, selection and totals.
*
* It holds no DOM and no storage. It takes what the Loader's `listEntries()` returns and turns it
* into what a person can read: one row per project that uses one stored copy, with the names,
* kinds and addresses that project recorded for it. Everything about what is stored stays the
* Loader's; this module only decides how it is shown and what a selection means.
*
* Two numbers are kept apart on purpose. A row's `bytes` is the size of the stored copy it uses,
* and the same copy appears once per project that uses it, so adding rows up overstates what the
* cache holds. Totals therefore count each stored copy once, and "what a release frees" counts
* only copies whose every use is selected.
*/
var separator = "\n";
var cacheAssetRowId = (bucket, key) => `${bucket}${separator}${key}`;
/** Turn the Loader's listing into rows: one per project that claims a stored copy. */
function cacheAssetRows(entries, titleFor) {
	const rows = [];
	for (const entry of entries) for (const claim of entry.claims) {
		const labels = entry.labels.filter((label) => label.bucket === claim.bucket);
		const unique = (values) => [...new Set(values.filter((value) => value !== void 0 && value !== ""))];
		const recordedTitle = unique(labels.map((label) => label.projectName))[0];
		const hostTitle = titleFor?.(claim.bucket);
		const projectTitle = hostTitle !== void 0 && hostTitle !== "" ? hostTitle : recordedTitle;
		rows.push(Object.freeze({
			id: cacheAssetRowId(claim.bucket, entry.key),
			key: entry.key,
			bucket: claim.bucket,
			shared: claim.bucket === SHARED_BUCKET,
			...projectTitle === void 0 ? {} : { projectTitle },
			names: Object.freeze(unique(labels.map((label) => label.name))),
			kinds: Object.freeze(unique(labels.map((label) => label.kind))),
			urls: Object.freeze(unique(labels.map((label) => label.url))),
			urlRedacted: labels.some((label) => label.urlRedacted === true),
			refs: Object.freeze(unique(labels.map((label) => label.ref))),
			bytes: entry.bytes,
			originalBytes: entry.originalBytes,
			lastAccess: claim.lastAccess,
			uses: entry.claims.length
		}));
	}
	return rows;
}
var collator = new Intl.Collator(void 0, {
	numeric: true,
	sensitivity: "base"
});
function sortValue(row, column) {
	switch (column) {
		case "name": return row.names[0] ?? "";
		case "kind": return row.kinds[0] ?? "";
		case "project": return row.shared ? "" : row.projectTitle ?? row.bucket;
		case "size": return row.bytes;
		case "lastAccess": return row.lastAccess;
	}
}
/**
* Filter and sort rows. Rows that compare equal keep a fixed order, by digest then bucket, so the
* table does not reshuffle between listings. Rows with no value for the sorted column go last in
* either direction, because "unknown" is not the smallest name.
*/
function queryCacheAssets(rows, query = {}) {
	const text = query.text?.trim().toLocaleLowerCase() ?? "";
	const filtered = rows.filter((row) => {
		if (query.bucket !== void 0 && row.bucket !== query.bucket) return false;
		if (query.kind !== void 0) {
			if (query.kind === "unknown" ? row.kinds.length > 0 : !row.kinds.includes(query.kind)) return false;
		}
		if (!text) return true;
		return [
			...row.names,
			...row.urls,
			row.projectTitle ?? "",
			row.bucket,
			row.key
		].some((value) => value.toLocaleLowerCase().includes(text));
	});
	const column = query.sort ?? "lastAccess";
	const sign = (query.direction ?? (column === "lastAccess" || column === "size" ? "descending" : "ascending")) === "ascending" ? 1 : -1;
	return filtered.sort((left, right) => {
		const a = sortValue(left, column);
		const b = sortValue(right, column);
		const aMissing = a === "";
		if (aMissing !== (b === "")) return aMissing ? 1 : -1;
		const order = typeof a === "number" && typeof b === "number" ? a - b : collator.compare(String(a), String(b));
		if (order !== 0) return order * sign;
		return left.key < right.key ? -1 : left.key > right.key ? 1 : left.bucket < right.bucket ? -1 : left.bucket > right.bucket ? 1 : 0;
	});
}
/** Totals that count each stored copy once, however many rows use it. */
function cacheAssetTotals(rows) {
	const sizes = new Map(rows.map((row) => [row.key, row.bytes]));
	let bytes = 0;
	for (const size of sizes.values()) bytes += size;
	return Object.freeze({
		uses: rows.length,
		entries: sizes.size,
		bytes
	});
}
/**
* What releasing the selected uses would do, judged from the listing on screen. The Loader decides
* for real and reports what it did; this is the estimate shown before asking.
*/
function estimateCacheRelease(all, selected) {
	const chosen = all.filter((row) => selected.has(row.id));
	const totals = cacheAssetTotals(chosen);
	let freedBytes = 0;
	let keptEntries = 0;
	for (const key of new Set(chosen.map((row) => row.key))) {
		const uses = all.filter((row) => row.key === key);
		if (uses.every((row) => selected.has(row.id))) freedBytes += uses[0].bytes;
		else keptEntries++;
	}
	return Object.freeze({
		...totals,
		freedBytes,
		keptEntries
	});
}
/** Drop selected ids that are no longer listed, so a stale selection never releases anything. */
function pruneCacheSelection(rows, selected) {
	const listed = new Set(rows.map((row) => row.id));
	return new Set([...selected].filter((id) => listed.has(id)));
}
/** The claims a selection releases, in the shape the Loader takes. */
function cacheClaimsFor(rows, selected) {
	return rows.filter((row) => selected.has(row.id)).map((row) => ({
		bucket: row.bucket,
		key: row.key
	}));
}
//#endregion
//#region src/extension-cache.ts
var ExtensionCacheError = class extends Error {
	constructor(code, message, cause) {
		super(message, cause === void 0 ? void 0 : { cause });
		this.name = "ExtensionCacheError";
		this.code = code;
	}
};
/**
* Compares two buckets for display.
*
* The shared bucket leads because it is the one row that is not a project: it holds what the
* catalog pinned for everyone, and an operator hunting for space should see it before deciding
* that some individual project is to blame. The rest follow by stored size, because size is the
* only reason anyone opens this screen; the bucket name breaks ties so the order is stable
* between listings rather than reflecting insertion order.
*/
function compareBuckets(left, right) {
	if (left.shared !== right.shared) return left.shared ? -1 : 1;
	if (left.bytes !== right.bytes) return right.bytes - left.bytes;
	return left.bucket < right.bucket ? -1 : left.bucket > right.bucket ? 1 : 0;
}
function createExtensionCache(options = {}) {
	let cache = null;
	/**
	* Opens the cache on first use.
	*
	* A browser with storage blocked fails here rather than when the dialog is built, so the menu
	* entry stays clickable and the failure is reported in the dialog's own status line.
	*/
	function requireCache() {
		if (cache !== null) return cache;
		try {
			cache = createIndexedDBContentCache({
				...options.indexedDB === void 0 ? {} : { indexedDB: options.indexedDB },
				...options.databaseName === void 0 ? {} : { databaseName: options.databaseName }
			});
		} catch (error) {
			throw new ExtensionCacheError("unavailable", "the extension cache is unavailable", error);
		}
		return cache;
	}
	return Object.freeze({
		async listProjects() {
			return (await requireCache().listBuckets()).map((bucket) => {
				const title = options.titleFor?.(bucket.bucket);
				return {
					bucket: bucket.bucket,
					shared: bucket.bucket === SHARED_BUCKET,
					...title === void 0 || title.length === 0 ? {} : { title },
					entries: bucket.entries,
					bytes: bucket.bytes
				};
			}).sort(compareBuckets);
		},
		async listDigests(bucket) {
			return (await requireCache().listBucket(bucket)).map((entry) => ({
				key: entry.key,
				bytes: entry.bytes,
				originalBytes: entry.originalBytes,
				lastAccess: entry.lastAccess
			})).sort((left, right) => right.lastAccess - left.lastAccess);
		},
		releaseProject(bucket) {
			return requireCache().deleteBucket(bucket);
		},
		releaseDigests(bucket, keys) {
			return requireCache().deleteFromBucket(bucket, keys);
		},
		totals() {
			return requireCache().getSize();
		},
		async listAssets() {
			return cacheAssetRows(await requireCache().listEntries(), options.titleFor);
		},
		releaseAssets(claims) {
			return requireCache().releaseClaims(claims);
		},
		async close() {
			const open = cache;
			cache = null;
			if (open !== null) await open.close();
		}
	});
}
//#endregion
//#region src/extension-cache-dialog.ts
/** How much of a digest is shown. Enough to tell two rows apart; the full value is the title. */
var digestPreviewLength = 12;
function requireLocales$1(value) {
	if (!isRecord(value) || Object.keys(value).length === 0) throw new TypeError("locales must contain at least one locale");
	return value;
}
function textFor$1(locales, locale) {
	const text = locales[locale] ?? locales["en"] ?? Object.values(locales)[0];
	if (text === void 0) throw new TypeError("locales must contain at least one locale");
	return text;
}
/** Fills `{name}` placeholders, so a locale decides where a count or a size sits in a sentence. */
function fill$1(template, values) {
	return template.replace(/\{(\w+)\}/g, (match, name) => values[name] ?? match);
}
function defaultFormatSize$1(byteLength) {
	if (byteLength < 1024) return `${byteLength} B`;
	if (byteLength < 1048576) return `${(byteLength / 1024).toFixed(1)} KB`;
	return `${(byteLength / 1048576).toFixed(1)} MB`;
}
function defaultFormatDate$1(epochMilliseconds) {
	const parsed = new Date(epochMilliseconds);
	if (Number.isNaN(parsed.getTime())) return String(epochMilliseconds);
	const pad = (value) => String(value).padStart(2, "0");
	return `${parsed.getFullYear()}-${pad(parsed.getMonth() + 1)}-${pad(parsed.getDate())} ${pad(parsed.getHours())}:${pad(parsed.getMinutes())}`;
}
function defaultDescribeError$1(error) {
	if (error instanceof Error && error.message.length > 0) return error.message;
	return String(error);
}
function createExtensionCacheDialog(options) {
	if (!isRecord(options)) throw new TypeError("extension cache dialog options must be an object");
	const document = requireDocument(options.document ?? globalThis.document);
	const mount = requireElement(options.mount ?? document.body, "mount");
	const locales = requireLocales$1(options.locales);
	const describeError = options.describeError ?? defaultDescribeError$1;
	const formatSize = options.formatSize ?? defaultFormatSize$1;
	const formatDate = options.formatDate ?? defaultFormatDate$1;
	let locale = options.initialLocale ?? "en";
	let projects = [];
	let totals = {
		entries: 0,
		bytes: 0
	};
	let expandedBucket = null;
	let digests = [];
	let confirmingBucket = null;
	let confirmingDigest = null;
	let status = "";
	let result = "";
	/** Whether the list on screen came from a listing that finished. See `render`. */
	let listed = false;
	let disposed = false;
	const root = document.createElement("section");
	const panel = document.createElement("div");
	const heading = document.createElement("h1");
	const closeButton = document.createElement("button");
	const toolbar = document.createElement("div");
	const refreshButton = document.createElement("button");
	const totalElement = document.createElement("p");
	const noticeElement = document.createElement("p");
	const listElement = document.createElement("div");
	const resultElement = document.createElement("p");
	const statusElement = document.createElement("p");
	root.setAttribute("data-turbowarp-title-menu-extension-cache", "true");
	root.style.cssText = "position:absolute;inset:0;z-index:2147483646;align-items:center;justify-content:center;padding:16px;box-sizing:border-box;background:rgba(0,0,0,.6);font-family:sans-serif;";
	root.style.display = "none";
	panel.style.cssText = "width:min(760px,96%);max-height:90%;display:flex;flex-direction:column;gap:10px;padding:18px;box-sizing:border-box;background:#ffffff;color:#1b1f27;border-radius:10px;box-shadow:0 10px 36px rgba(0,0,0,.45);overflow:hidden;";
	heading.style.cssText = "margin:0;font-size:20px;line-height:1.3;";
	toolbar.style.cssText = "display:flex;gap:8px;align-items:center;flex-wrap:wrap;";
	totalElement.style.cssText = "margin:0;font-size:13px;color:#1b1f27;";
	noticeElement.style.cssText = "margin:0;padding:8px 10px;font-size:12px;line-height:1.5;color:#45506a;background:#f2f4f8;border:1px solid #ccd2de;border-radius:8px;";
	listElement.style.cssText = "flex:1;min-height:0;overflow:auto;display:flex;flex-direction:column;gap:6px;";
	resultElement.style.cssText = "margin:0;min-height:18px;font-size:13px;color:#1f6feb;";
	statusElement.style.cssText = "margin:0;min-height:18px;font-size:13px;color:#8a1c1c;";
	const headerRow = document.createElement("div");
	headerRow.style.cssText = "display:flex;align-items:center;justify-content:space-between;gap:8px;";
	headerRow.appendChild(heading);
	headerRow.appendChild(closeButton);
	panel.appendChild(headerRow);
	toolbar.appendChild(refreshButton);
	toolbar.appendChild(totalElement);
	panel.appendChild(toolbar);
	panel.appendChild(noticeElement);
	panel.appendChild(listElement);
	panel.appendChild(resultElement);
	panel.appendChild(statusElement);
	root.appendChild(panel);
	const previousMountPosition = mount.style.position;
	if (previousMountPosition === "" || previousMountPosition === "static") mount.style.position = "relative";
	mount.appendChild(root);
	function styleButton(button, tone) {
		const palette = {
			primary: "background:#1f6feb;color:#ffffff;border:1px solid #1f6feb;",
			plain: "background:#f2f4f8;color:#1b1f27;border:1px solid #ccd2de;",
			danger: "background:#b42318;color:#ffffff;border:1px solid #b42318;",
			active: "background:#d7e6ff;color:#0b3a82;border:1px solid #1f6feb;"
		}[tone];
		button.style.cssText = `${palette}padding:5px 10px;border-radius:6px;font-size:13px;cursor:pointer;`;
	}
	function createButton(label, tone, onClick) {
		const button = document.createElement("button");
		button.type = "button";
		button.textContent = label;
		styleButton(button, tone);
		button.addEventListener("click", onClick);
		return button;
	}
	function run(operation) {
		try {
			Promise.resolve(operation()).catch(handleFailure);
		} catch (error) {
			handleFailure(error);
		}
	}
	function handleFailure(error) {
		status = describeError(error);
		options.onError?.(error);
		render();
	}
	/** Every release goes through here, so the list, the total, and the status stay in step. */
	function release(operation) {
		run(async () => {
			status = "";
			try {
				const released = await operation();
				result = fill$1(textFor$1(locales, locale).releaseResult, {
					released: String(released.released),
					freed: formatSize(released.freed)
				});
			} catch (error) {
				handleFailure(error);
				return;
			}
			await reload();
		});
	}
	/**
	* Reloads the whole screen.
	*
	* The expanded bucket is re-listed rather than filtered out of a stale list, because releasing
	* a digest from one bucket can remove bytes a second bucket claimed, which changes totals the
	* dialog never asked about. Asking again is cheap; guessing would be wrong.
	*/
	async function reload() {
		if (disposed) return;
		listed = false;
		projects = await options.listProjects();
		totals = await options.totals();
		if (expandedBucket !== null && !projects.some((entry) => entry.bucket === expandedBucket)) expandedBucket = null;
		digests = expandedBucket === null ? [] : await options.listDigests(expandedBucket);
		listed = true;
		render();
	}
	/**
	* Reloads without letting the failure escape.
	*
	* A listing that failed must not leave the panel showing an empty list: "nothing is cached" and
	* "the cache could not be read" are different claims, and only one of them is true. So the
	* status line carries the failure while the panel stays open, instead of the promise rejecting
	* into a caller that has no way to say so on screen.
	*/
	async function reloadSafely() {
		try {
			await reload();
		} catch (error) {
			handleFailure(error);
		}
	}
	function toggleExpanded(bucket) {
		expandedBucket = expandedBucket === bucket ? null : bucket;
		confirmingBucket = null;
		confirmingDigest = null;
		run(() => reload());
	}
	function renderDigestRow(digest, bucket, text) {
		const row = document.createElement("div");
		row.setAttribute("data-cache-digest", digest.key);
		row.style.cssText = "display:flex;align-items:center;gap:8px;padding:6px 8px;margin-left:18px;border:1px solid #eef1f6;border-radius:6px;";
		const key = document.createElement("span");
		key.textContent = `${digest.key.slice(0, digestPreviewLength)}…`;
		key.setAttribute("title", digest.key);
		key.style.cssText = "flex:1;min-width:0;font-family:monospace;font-size:12px;color:#1b1f27;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;";
		const used = document.createElement("span");
		used.textContent = fill$1(text.lastUsed, { date: formatDate(digest.lastAccess) });
		used.style.cssText = "font-size:12px;color:#5a6172;white-space:nowrap;";
		const size = document.createElement("span");
		size.textContent = formatSize(digest.bytes);
		size.setAttribute("title", fill$1(text.originalSize, { bytes: formatSize(digest.originalBytes) }));
		size.style.cssText = "font-size:12px;color:#5a6172;white-space:nowrap;min-width:64px;text-align:right;";
		row.appendChild(key);
		row.appendChild(used);
		row.appendChild(size);
		if (confirmingDigest === digest.key) {
			row.appendChild(createButton(text.confirmRelease, "danger", () => {
				confirmingDigest = null;
				release(() => options.onReleaseDigest(bucket, digest.key));
			}));
			row.appendChild(createButton(text.cancel, "plain", () => {
				confirmingDigest = null;
				render();
			}));
			return row;
		}
		row.appendChild(createButton(text.release, "plain", () => {
			confirmingDigest = digest.key;
			confirmingBucket = null;
			render();
		}));
		return row;
	}
	function renderProjectRow(project, text) {
		const row = document.createElement("div");
		row.setAttribute("data-cache-bucket", project.bucket);
		row.style.cssText = "display:flex;align-items:center;gap:8px;padding:8px;border:1px solid #e2e6ee;border-radius:8px;";
		const names = document.createElement("div");
		names.style.cssText = "flex:1;min-width:0;display:flex;flex-direction:column;gap:2px;";
		const title = document.createElement("span");
		title.textContent = project.shared ? text.shared : project.title ?? text.untitled;
		title.style.cssText = "font-size:14px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;";
		names.appendChild(title);
		if (!project.shared) {
			const uri = document.createElement("span");
			uri.textContent = project.bucket;
			uri.setAttribute("title", project.bucket);
			uri.style.cssText = "font-size:11px;font-family:monospace;color:#5a6172;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;";
			names.appendChild(uri);
		}
		row.appendChild(names);
		const count = document.createElement("span");
		count.textContent = fill$1(text.entryCount, { entries: String(project.entries) });
		count.style.cssText = "font-size:12px;color:#5a6172;white-space:nowrap;";
		const size = document.createElement("span");
		size.textContent = formatSize(project.bytes);
		size.style.cssText = "font-size:12px;color:#5a6172;white-space:nowrap;min-width:64px;text-align:right;";
		row.appendChild(count);
		row.appendChild(size);
		const expanded = expandedBucket === project.bucket;
		const expandButton = createButton(expanded ? text.collapse : text.expand, expanded ? "active" : "primary", () => toggleExpanded(project.bucket));
		expandButton.setAttribute("data-cache-expand", project.bucket);
		expandButton.setAttribute("aria-expanded", expanded ? "true" : "false");
		row.appendChild(expandButton);
		if (confirmingBucket === project.bucket) {
			row.appendChild(createButton(text.confirmRelease, "danger", () => {
				confirmingBucket = null;
				release(() => options.onReleaseProject(project.bucket));
			}));
			row.appendChild(createButton(text.cancel, "plain", () => {
				confirmingBucket = null;
				render();
			}));
			return row;
		}
		row.appendChild(createButton(text.release, "plain", () => {
			confirmingBucket = project.bucket;
			confirmingDigest = null;
			render();
		}));
		return row;
	}
	function render() {
		if (disposed) return;
		const text = textFor$1(locales, locale);
		heading.textContent = text.title;
		closeButton.textContent = text.close;
		closeButton.setAttribute("aria-label", text.close);
		refreshButton.textContent = text.refresh;
		noticeElement.textContent = text.notice;
		totalElement.textContent = fill$1(text.total, {
			entries: String(totals.entries),
			bytes: formatSize(totals.bytes)
		});
		resultElement.textContent = result;
		statusElement.textContent = status;
		listElement.replaceChildren();
		if (projects.length === 0) {
			if (!listed) return;
			const empty = document.createElement("p");
			empty.textContent = text.empty;
			empty.style.cssText = "margin:8px 0;font-size:14px;color:#5a6172;";
			listElement.appendChild(empty);
			return;
		}
		for (const project of projects) {
			listElement.appendChild(renderProjectRow(project, text));
			if (expandedBucket !== project.bucket) continue;
			for (const digest of digests) listElement.appendChild(renderDigestRow(digest, project.bucket, text));
		}
	}
	styleButton(closeButton, "plain");
	styleButton(refreshButton, "primary");
	closeButton.type = "button";
	refreshButton.type = "button";
	closeButton.addEventListener("click", () => hide());
	refreshButton.addEventListener("click", () => {
		result = "";
		status = "";
		run(() => reload());
	});
	function hide() {
		if (disposed) return;
		confirmingBucket = null;
		confirmingDigest = null;
		root.style.display = "none";
	}
	function ensureActive() {
		if (disposed) throw new TypeError("extension cache dialog is disposed");
	}
	render();
	return Object.freeze({
		element: root,
		get locale() {
			return locale;
		},
		get expanded() {
			return expandedBucket;
		},
		async show(nextLocale) {
			ensureActive();
			if (nextLocale !== void 0) locale = nextLocale;
			status = "";
			result = "";
			root.style.display = "flex";
			await reloadSafely();
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
			if (disposed) return;
			disposed = true;
			root.remove();
			if (previousMountPosition === "" || previousMountPosition === "static") mount.style.position = previousMountPosition;
		}
	});
}
//#endregion
//#region src/cache-manager-dialog.ts
var rootAttribute = "data-turbowarp-title-menu-cache-manager";
var kindKeys = [
	"costume",
	"backdrop",
	"sound",
	"document",
	"extension",
	"other",
	"unknown"
];
var sortColumns = [
	"name",
	"kind",
	"project",
	"size",
	"lastAccess"
];
/** Colors as variables, so one sheet serves both schemes and `auto` can follow the browser. */
var styleSheet = `
[${rootAttribute}]{--tm-bg:#fff;--tm-fg:#1b1f27;--tm-muted:#5a6172;--tm-line:#e2e6ee;--tm-soft:#f2f4f8;--tm-accent:#1f6feb;--tm-danger:#b42318;--tm-error:#8a1c1c;--tm-selected:#e8f0ff}
[${rootAttribute}][data-color-scheme=dark]{--tm-bg:#1d2129;--tm-fg:#e6e9ef;--tm-muted:#a3abbd;--tm-line:#363c49;--tm-soft:#272c36;--tm-accent:#6ea8ff;--tm-danger:#f97066;--tm-error:#ffb4ab;--tm-selected:#23324d}
@media (prefers-color-scheme: dark){[${rootAttribute}][data-color-scheme=auto]{--tm-bg:#1d2129;--tm-fg:#e6e9ef;--tm-muted:#a3abbd;--tm-line:#363c49;--tm-soft:#272c36;--tm-accent:#6ea8ff;--tm-danger:#f97066;--tm-error:#ffb4ab;--tm-selected:#23324d}}
[${rootAttribute}] button,[${rootAttribute}] input,[${rootAttribute}] select{font:inherit;color:var(--tm-fg);background:var(--tm-soft);border:1px solid var(--tm-line);border-radius:6px;padding:4px 8px}
[${rootAttribute}] button:focus-visible,[${rootAttribute}] input:focus-visible,[${rootAttribute}] select:focus-visible{outline:2px solid var(--tm-accent);outline-offset:1px}
[${rootAttribute}] button[data-tone=danger]{background:var(--tm-danger);border-color:var(--tm-danger);color:#fff}
[${rootAttribute}] button[disabled]{opacity:.5;cursor:default}
[${rootAttribute}] table{width:100%;border-collapse:collapse;font-size:13px}
[${rootAttribute}] th,[${rootAttribute}] td{padding:5px 6px;border-bottom:1px solid var(--tm-line);text-align:left;vertical-align:top}
[${rootAttribute}] th button{border:none;background:none;padding:0;font-weight:600;cursor:pointer}
[${rootAttribute}] tr[aria-selected=true]{background:var(--tm-selected)}
[${rootAttribute}] .tm-muted{color:var(--tm-muted);font-size:12px}
[${rootAttribute}] .tm-mono{font-family:monospace;font-size:11px;overflow-wrap:anywhere}
`;
function requireLocales(value) {
	if (!isRecord(value) || Object.keys(value).length === 0) throw new TypeError("locales must contain at least one locale");
	return value;
}
function textFor(locales, locale) {
	const text = locales[locale] ?? locales["en"] ?? Object.values(locales)[0];
	if (text === void 0) throw new TypeError("locales must contain at least one locale");
	return text;
}
function fill(template, values) {
	return template.replace(/\{(\w+)\}/g, (match, name) => values[name] ?? match);
}
function defaultFormatSize(byteLength) {
	if (byteLength < 1024) return `${byteLength} B`;
	if (byteLength < 1048576) return `${(byteLength / 1024).toFixed(1)} KB`;
	return `${(byteLength / 1048576).toFixed(1)} MB`;
}
function defaultFormatDate(epochMilliseconds) {
	const parsed = new Date(epochMilliseconds);
	if (Number.isNaN(parsed.getTime())) return String(epochMilliseconds);
	const pad = (value) => String(value).padStart(2, "0");
	return `${parsed.getFullYear()}-${pad(parsed.getMonth() + 1)}-${pad(parsed.getDate())} ${pad(parsed.getHours())}:${pad(parsed.getMinutes())}`;
}
function defaultDescribeError(error) {
	return error instanceof Error && error.message.length > 0 ? error.message : String(error);
}
function createCacheManagerDialog(options) {
	if (!isRecord(options)) throw new TypeError("cache manager dialog options must be an object");
	const document = requireDocument(options.document ?? globalThis.document);
	const mount = requireElement(options.mount ?? document.body, "mount");
	const locales = requireLocales(options.locales);
	const describeError = options.describeError ?? defaultDescribeError;
	const formatSize = options.formatSize ?? defaultFormatSize;
	const formatDate = options.formatDate ?? defaultFormatDate;
	let locale = options.initialLocale ?? "en";
	let phase = "idle";
	let rows = [];
	let selected = /* @__PURE__ */ new Set();
	let query = {
		text: "",
		sort: "lastAccess",
		direction: "descending"
	};
	let confirming = false;
	let embedFormat = "embedded-file";
	let busy = false;
	let status = "";
	let result = "";
	let generation = 0;
	let disposed = false;
	const root = document.createElement("section");
	root.setAttribute(rootAttribute, "true");
	root.setAttribute("data-color-scheme", options.colorScheme ?? "auto");
	root.setAttribute("role", "dialog");
	root.setAttribute("aria-modal", "true");
	root.style.cssText = "position:absolute;inset:0;z-index:2147483646;align-items:center;justify-content:center;padding:16px;box-sizing:border-box;background:rgba(0,0,0,.6);font-family:sans-serif;";
	root.style.display = "none";
	const style = document.createElement("style");
	style.textContent = styleSheet;
	const panel = document.createElement("div");
	panel.style.cssText = "width:min(980px,98%);max-height:92%;display:flex;flex-direction:column;gap:8px;padding:16px;box-sizing:border-box;background:var(--tm-bg);color:var(--tm-fg);border-radius:10px;box-shadow:0 10px 36px rgba(0,0,0,.45);overflow:hidden;";
	const header = document.createElement("div");
	header.style.cssText = "display:flex;align-items:center;justify-content:space-between;gap:8px;";
	const heading = document.createElement("h1");
	heading.style.cssText = "margin:0;font-size:20px;";
	heading.setAttribute("id", "tm-cache-manager-title");
	root.setAttribute("aria-labelledby", "tm-cache-manager-title");
	const closeButton = document.createElement("button");
	closeButton.type = "button";
	const notice = document.createElement("p");
	notice.className = "tm-muted";
	notice.style.cssText = "margin:0;line-height:1.5;";
	const filters = document.createElement("div");
	filters.style.cssText = "display:flex;gap:8px;flex-wrap:wrap;align-items:center;";
	const searchInput = document.createElement("input");
	searchInput.type = "search";
	searchInput.setAttribute("data-cache-search", "true");
	const kindSelect = document.createElement("select");
	kindSelect.setAttribute("data-cache-kind", "true");
	const projectSelect = document.createElement("select");
	projectSelect.setAttribute("data-cache-project", "true");
	const refreshButton = document.createElement("button");
	refreshButton.type = "button";
	const summary = document.createElement("p");
	summary.style.cssText = "margin:0;font-size:13px;";
	summary.setAttribute("data-cache-summary", "true");
	const selectionBar = document.createElement("div");
	selectionBar.style.cssText = "display:flex;gap:8px;flex-wrap:wrap;align-items:center;";
	const tableBox = document.createElement("div");
	tableBox.style.cssText = "flex:1;min-height:0;overflow:auto;";
	const resultLine = document.createElement("p");
	resultLine.setAttribute("role", "status");
	resultLine.style.cssText = "margin:0;min-height:18px;font-size:13px;color:var(--tm-accent);";
	const statusLine = document.createElement("p");
	statusLine.setAttribute("role", "alert");
	statusLine.style.cssText = "margin:0;min-height:18px;font-size:13px;color:var(--tm-error);";
	header.append(heading, closeButton);
	filters.append(searchInput, kindSelect, projectSelect, refreshButton);
	panel.append(header, notice, filters, summary, selectionBar, tableBox, resultLine, statusLine);
	root.append(style, panel);
	const previousMountPosition = mount.style.position;
	if (previousMountPosition === "" || previousMountPosition === "static") mount.style.position = "relative";
	mount.appendChild(root);
	function element(tag, text = "") {
		const created = document.createElement(tag);
		if (text) created.textContent = text;
		return created;
	}
	function button(label, onClick, attributes = {}) {
		const created = element("button", label);
		created.type = "button";
		created.disabled = busy;
		for (const [name, value] of Object.entries(attributes)) created.setAttribute(name, value);
		created.addEventListener("click", onClick);
		return created;
	}
	function option(value, label, current) {
		const created = element("option", label);
		created.value = value;
		created.setAttribute("value", value);
		if (value === (current ?? "")) created.setAttribute("selected", "true");
		return created;
	}
	function fail(error) {
		status = describeError(error);
		options.onError?.(error);
		render();
	}
	const visible = () => queryCacheAssets(rows, {
		text: query.text,
		...query.kind ? { kind: query.kind } : {},
		...query.bucket !== void 0 ? { bucket: query.bucket } : {},
		sort: query.sort,
		direction: query.direction
	});
	/**
	* Lists again. Only the newest listing is shown, so a slow listing that finishes after a newer
	* one cannot put old rows back. A failure is shown as a failure, never as an empty cache.
	*/
	async function reload() {
		if (disposed) return;
		const mine = ++generation;
		phase = "loading";
		confirming = false;
		render();
		try {
			const listed = await options.listAssets();
			if (mine !== generation || disposed) return;
			rows = listed;
			selected = pruneCacheSelection(rows, selected);
			phase = "ready";
		} catch (error) {
			if (mine !== generation || disposed) return;
			phase = "error";
			rows = [];
			selected = /* @__PURE__ */ new Set();
			fail(error);
			return;
		}
		render();
	}
	async function releaseSelected() {
		const claims = cacheClaimsFor(rows, selected);
		if (!claims.length) return;
		busy = true;
		confirming = false;
		status = "";
		render();
		try {
			const done = await options.onRelease(claims);
			const text = textFor(locales, locale);
			result = fill(text.releaseResult, {
				released: String(done.released),
				requested: String(claims.length),
				freed: formatSize(done.freed)
			});
			if (done.released < claims.length) result += ` ${fill(text.releaseStale, { missing: String(claims.length - done.released) })}`;
			selected = /* @__PURE__ */ new Set();
		} catch (error) {
			fail(error);
		} finally {
			busy = false;
		}
		await reload();
	}
	/** Selected rows filed under the open project, and how many selected rows are not. */
	function embeddable() {
		const bucket = options.embedding?.currentBucket();
		const chosen = rows.filter((row) => selected.has(row.id));
		const mine = bucket === void 0 ? [] : chosen.filter((row) => row.bucket === bucket);
		return {
			keys: [...new Set(mine.map((row) => row.key))],
			uses: mine.length,
			others: chosen.length - mine.length
		};
	}
	async function embedSelected(release) {
		const embedding = options.embedding;
		const { keys } = embeddable();
		if (!embedding || !keys.length) return;
		busy = true;
		confirming = false;
		status = "";
		render();
		try {
			const done = await embedding.embed(keys, {
				format: embedFormat,
				release
			});
			const text = textFor(locales, locale);
			result = fill(text.embedResult, {
				embedded: String(done.embedded),
				requested: String(keys.length)
			});
			if (done.skipped.length) {
				const reasons = [...new Set(done.skipped.map((skip) => text.embedSkipReasons[skip.reason] ?? skip.reason))].join(", ");
				result += ` ${fill(text.embedSkipped, {
					count: String(done.skipped.length),
					reasons
				})}`;
			}
			if (done.released) {
				result += ` ${text.embedReleasePending}`;
				done.released.then(async (outcome) => {
					if (disposed) return;
					result = fill(textFor(locales, locale).embedReleaseResult, {
						released: String(outcome.released),
						freed: formatSize(outcome.freed),
						kept: String(outcome.kept)
					});
					await reload();
				}, (error) => {
					if (!disposed) fail(error);
				});
			}
			selected = /* @__PURE__ */ new Set();
		} catch (error) {
			fail(error);
		} finally {
			busy = false;
		}
		await reload();
	}
	function renderEmbedding(text) {
		if (!options.embedding) return;
		const { uses, others } = embeddable();
		if (uses > 0) {
			const select = element("select");
			select.setAttribute("data-cache-embed-format", "true");
			select.setAttribute("aria-label", text.embedFormat);
			select.disabled = busy;
			for (const format of ["embedded-file", "embedded-data"]) select.appendChild(option(format, text.embedFormats[format], embedFormat));
			select.value = embedFormat;
			select.addEventListener("change", () => {
				embedFormat = select.value === "embedded-data" ? "embedded-data" : "embedded-file";
			});
			selectionBar.append(select, button(fill(text.embed, { uses: String(uses) }), () => void embedSelected(false), { "data-cache-embed": "true" }), button(fill(text.embedAndRelease, { uses: String(uses) }), () => void embedSelected(true), { "data-cache-embed-release": "true" }));
		}
		if (others > 0) {
			const line = element("span", fill(text.embedOtherProjects, { uses: String(others) }));
			line.className = "tm-muted";
			line.setAttribute("data-cache-embed-others", "true");
			selectionBar.appendChild(line);
		}
		if (uses > 0) {
			const line = element("span", text.embedNotice);
			line.className = "tm-muted";
			selectionBar.appendChild(line);
		}
	}
	function setSort(column) {
		query = query.sort === column ? {
			...query,
			direction: query.direction === "ascending" ? "descending" : "ascending"
		} : {
			...query,
			sort: column,
			direction: column === "size" || column === "lastAccess" ? "descending" : "ascending"
		};
		render();
	}
	function renderTable(text, shown) {
		tableBox.replaceChildren();
		if (phase === "loading" && rows.length === 0) {
			tableBox.appendChild(element("p", text.loading));
			return;
		}
		if (phase === "error" || phase === "idle") return;
		if (rows.length === 0) {
			tableBox.appendChild(element("p", text.empty));
			return;
		}
		if (shown.length === 0) {
			tableBox.appendChild(element("p", text.noMatches));
			return;
		}
		const table = element("table");
		const head = element("thead");
		const headRow = element("tr");
		const selectHeader = element("th", text.columns.select);
		headRow.appendChild(selectHeader);
		for (const column of sortColumns) {
			const cell = element("th");
			const sorted = query.sort === column;
			cell.setAttribute("aria-sort", sorted ? query.direction : "none");
			cell.appendChild(button(`${text.columns[column]}${sorted ? query.direction === "ascending" ? " ▲" : " ▼" : ""}`, () => setSort(column), { "data-cache-sort": column }));
			headRow.appendChild(cell);
		}
		head.appendChild(headRow);
		const body = element("tbody");
		for (const row of shown) {
			const tr = element("tr");
			tr.setAttribute("data-cache-row", row.id);
			tr.setAttribute("aria-selected", selected.has(row.id) ? "true" : "false");
			const check = element("input");
			check.type = "checkbox";
			check.checked = selected.has(row.id);
			check.disabled = busy;
			check.setAttribute("data-cache-select", row.id);
			check.setAttribute("aria-label", row.names[0] ?? row.key);
			check.addEventListener("change", () => {
				const next = new Set(selected);
				if (next.has(row.id)) next.delete(row.id);
				else next.add(row.id);
				selected = next;
				confirming = false;
				render();
			});
			const checkCell = element("td");
			checkCell.appendChild(check);
			const nameCell = element("td");
			nameCell.appendChild(element("div", row.names.length ? row.names.join(", ") : text.unnamed));
			for (const url of row.urls) {
				const line = element("div", url);
				line.className = "tm-mono";
				nameCell.appendChild(line);
			}
			if (row.urlRedacted) {
				const line = element("div", text.redacted);
				line.className = "tm-muted";
				nameCell.appendChild(line);
			}
			const digest = element("div", fill(text.digest, { key: row.key }));
			digest.className = "tm-mono tm-muted";
			nameCell.appendChild(digest);
			const kindCell = element("td", row.kinds.length ? row.kinds.map((kind) => text.kinds[kind]).join(", ") : text.kinds.unknown);
			const projectCell = element("td");
			projectCell.appendChild(element("div", row.shared ? text.shared : row.projectTitle ?? text.untitled));
			if (!row.shared) {
				const uri = element("div", row.bucket);
				uri.className = "tm-mono tm-muted";
				projectCell.appendChild(uri);
			}
			const sizeCell = element("td", formatSize(row.bytes));
			if (row.uses > 1) {
				const shared = element("div", fill(text.sharedBy, { uses: String(row.uses) }));
				shared.className = "tm-muted";
				sizeCell.appendChild(shared);
			}
			const dateCell = element("td", formatDate(row.lastAccess));
			tr.append(checkCell, nameCell, kindCell, projectCell, sizeCell, dateCell);
			body.appendChild(tr);
		}
		table.append(head, body);
		tableBox.appendChild(table);
	}
	function renderFilters(text) {
		searchInput.setAttribute("placeholder", text.search);
		searchInput.setAttribute("aria-label", text.search);
		kindSelect.setAttribute("aria-label", text.kindFilter);
		kindSelect.replaceChildren(option("", text.kindAll, query.kind), ...kindKeys.map((kind) => option(kind, text.kinds[kind], query.kind)));
		kindSelect.value = query.kind ?? "";
		projectSelect.setAttribute("aria-label", text.projectFilter);
		const buckets = [...new Map(rows.map((row) => [row.bucket, row])).values()].sort((a, b) => a.shared !== b.shared ? a.shared ? -1 : 1 : (a.projectTitle ?? a.bucket).localeCompare(b.projectTitle ?? b.bucket));
		projectSelect.replaceChildren(option("", text.projectAll, query.bucket), ...buckets.map((row) => option(row.bucket, row.shared ? text.shared : row.projectTitle ?? row.bucket, query.bucket)));
		projectSelect.value = query.bucket ?? "";
	}
	function render() {
		if (disposed) return;
		const text = textFor(locales, locale);
		heading.textContent = text.title;
		closeButton.textContent = text.close;
		closeButton.setAttribute("aria-label", text.close);
		refreshButton.textContent = text.refresh;
		refreshButton.disabled = busy;
		notice.textContent = text.notice;
		renderFilters(text);
		const shown = phase === "ready" || phase === "loading" ? visible() : [];
		const totals = cacheAssetTotals(rows);
		summary.textContent = phase === "ready" ? `${fill(text.total, {
			entries: String(totals.entries),
			bytes: formatSize(totals.bytes),
			uses: String(totals.uses)
		})} ${fill(text.shown, {
			shown: String(shown.length),
			uses: String(totals.uses)
		})}` : phase === "loading" ? text.loading : "";
		selectionBar.replaceChildren();
		if (phase === "ready" && rows.length > 0) {
			const shownIds = shown.map((row) => row.id);
			selectionBar.append(button(fill(text.selectShown, { count: String(shownIds.length) }), () => {
				selected = /* @__PURE__ */ new Set([...selected, ...shownIds]);
				confirming = false;
				render();
			}, { "data-cache-select-shown": "true" }), button(fill(text.selectAll, { count: String(rows.length) }), () => {
				selected = new Set(rows.map((row) => row.id));
				confirming = false;
				render();
			}, { "data-cache-select-all": "true" }), button(text.clearSelection, () => {
				selected = /* @__PURE__ */ new Set();
				confirming = false;
				render();
			}, { "data-cache-clear": "true" }));
			if (selected.size > 0) {
				const estimate = estimateCacheRelease(rows, selected);
				const line = element("span", fill(text.selection, {
					uses: String(estimate.uses),
					bytes: formatSize(estimate.freedBytes),
					kept: String(estimate.keptEntries)
				}));
				line.setAttribute("data-cache-selection", "true");
				selectionBar.appendChild(line);
				if (confirming) selectionBar.append(button(fill(text.confirmRelease, { uses: String(estimate.uses) }), () => void releaseSelected(), {
					"data-tone": "danger",
					"data-cache-confirm": "true"
				}), button(text.cancel, () => {
					confirming = false;
					render();
				}));
				else selectionBar.appendChild(button(text.release, () => {
					confirming = true;
					render();
				}, { "data-cache-release": "true" }));
				renderEmbedding(text);
			}
		}
		renderTable(text, shown);
		resultLine.textContent = result;
		statusLine.textContent = status;
	}
	searchInput.addEventListener("input", () => {
		query = {
			...query,
			text: searchInput.value
		};
		render();
	});
	kindSelect.addEventListener("change", () => {
		const value = kindSelect.value;
		const rest = { ...query };
		delete rest.kind;
		query = value ? {
			...rest,
			kind: value
		} : rest;
		render();
	});
	projectSelect.addEventListener("change", () => {
		const value = projectSelect.value;
		const rest = { ...query };
		delete rest.bucket;
		query = value ? {
			...rest,
			bucket: value
		} : rest;
		render();
	});
	refreshButton.addEventListener("click", () => {
		result = "";
		status = "";
		reload();
	});
	closeButton.addEventListener("click", () => hide());
	root.addEventListener("keydown", (event) => {
		if (event.key === "Escape") hide();
	});
	function hide() {
		if (disposed) return;
		confirming = false;
		root.style.display = "none";
	}
	function ensureActive() {
		if (disposed) throw new TypeError("cache manager dialog is disposed");
	}
	render();
	return Object.freeze({
		element: root,
		get locale() {
			return locale;
		},
		get phase() {
			return phase;
		},
		get selected() {
			return new Set(selected);
		},
		async show(nextLocale) {
			ensureActive();
			if (nextLocale !== void 0) locale = nextLocale;
			status = "";
			result = "";
			root.style.display = "flex";
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
		setColorScheme(scheme) {
			ensureActive();
			root.setAttribute("data-color-scheme", scheme);
		},
		dispose() {
			if (disposed) return;
			disposed = true;
			generation++;
			root.remove();
			if (previousMountPosition === "" || previousMountPosition === "static") mount.style.position = previousMountPosition;
		}
	});
}
//#endregion
//#region src/title-dialog.ts
function requireLocaleText(locales, locale) {
	const text = locales[locale] ?? locales.en ?? Object.values(locales)[0];
	if (!text) throw new TypeError("locales must contain at least one locale");
	for (const key of [
		"title",
		"website",
		"close"
	]) if (typeof text[key] !== "string" || text[key].length === 0) throw new TypeError(`locales.${locale}.${key} must be a non-empty string`);
	return text;
}
function openWebsite(url) {
	const opener = globalThis.open;
	if (typeof opener === "function") opener(url, "_blank", "noopener,noreferrer");
	else if (globalThis.location) globalThis.location.href = url;
}
function createTitleDialog(options) {
	const document = requireDocument(options.document ?? globalThis.document);
	const mount = requireElement(options.mount ?? document.body, "mount");
	const locales = options.locales;
	if (!locales || typeof locales !== "object") throw new TypeError("locales must be an object");
	const root = document.createElement("section");
	const panel = document.createElement("div");
	const language = document.createElement("button");
	const close = document.createElement("button");
	const heading = document.createElement("h1");
	const meta = document.createElement("p");
	const website = document.createElement("button");
	root.setAttribute("data-turbowarp-title-dialog", "true");
	root.setAttribute("role", "dialog");
	root.setAttribute("aria-modal", "true");
	root.style.cssText = "position:absolute;inset:0;z-index:2147483647;display:none;align-items:center;justify-content:center;box-sizing:border-box;background:rgba(0,0,0,.35);font-family:sans-serif;";
	panel.style.cssText = "position:relative;box-sizing:border-box;width:min(88%,420px);padding:36px 28px 28px;text-align:center;background:#f4fffb;border:1px solid #007d66;border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,.3);color:#006b58;";
	language.style.cssText = "position:absolute;top:14px;left:16px;border:0;background:transparent;color:#007d66;font-size:14px;cursor:pointer;";
	close.style.cssText = "position:absolute;top:12px;right:12px;width:32px;height:32px;border:0;border-radius:50%;background:#007d66;color:#fff;font-size:22px;line-height:28px;cursor:pointer;";
	heading.style.cssText = "margin:0 24px 8px;font-size:30px;font-weight:600;line-height:1.15;";
	meta.style.cssText = "margin:0 0 22px;font-size:14px;line-height:1.4;";
	website.style.cssText = "display:inline-flex;align-items:center;justify-content:center;min-height:48px;padding:8px 18px;border:0;border-radius:10px;background:#007d66;color:#fff;font-size:16px;cursor:pointer;";
	language.type = "button";
	close.type = "button";
	website.type = "button";
	close.textContent = "x";
	panel.append(language, close, heading, meta, website);
	root.appendChild(panel);
	const restoreMount = ensureRelativeMount(mount);
	mount.appendChild(root);
	let locale = options.initialLocale ?? (locales.ja ? "ja" : Object.keys(locales)[0] ?? "en");
	let disposed = false;
	const render = () => {
		const text = requireLocaleText(locales, locale);
		heading.textContent = text.title;
		meta.textContent = [text.author, text.license].filter(Boolean).join(" / ");
		meta.hidden = meta.textContent.length === 0;
		website.textContent = text.website;
		website.setAttribute("aria-label", text.website);
		close.setAttribute("aria-label", text.close);
		close.setAttribute("title", text.close);
		language.textContent = text.language ?? locale;
		language.setAttribute("aria-label", text.language ?? locale);
	};
	const handleWebsite = () => {
		if (options.onWebsite) invokeSafely(options.onWebsite, options.onError);
		else if (options.websiteUrl) openWebsite(options.websiteUrl);
	};
	const handleClose = () => {
		hide();
		if (options.onClose) invokeSafely(options.onClose, options.onError);
	};
	const handleLanguage = () => {
		const keys = Object.keys(locales);
		locale = keys[(Math.max(keys.indexOf(locale), 0) + 1) % keys.length] ?? locale;
		render();
		if (options.onLocaleChange) invokeSafely(() => options.onLocaleChange?.(locale), options.onError);
	};
	website.addEventListener("click", handleWebsite);
	close.addEventListener("click", handleClose);
	language.addEventListener("click", handleLanguage);
	function show(nextLocale = locale) {
		if (disposed) throw new TypeError("title dialog is disposed");
		locale = nextLocale;
		render();
		root.style.display = "flex";
		return locale;
	}
	function hide() {
		if (!disposed) root.style.display = "none";
	}
	function setLocale(nextLocale) {
		if (disposed) throw new TypeError("title dialog is disposed");
		locale = nextLocale;
		render();
		return locale;
	}
	function dispose() {
		if (disposed) return;
		disposed = true;
		website.removeEventListener("click", handleWebsite);
		close.removeEventListener("click", handleClose);
		language.removeEventListener("click", handleLanguage);
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
var block_definitions_default = {
	extensionName: "TurboWarp Title Menu",
	menus: { "menuActions": {
		"acceptReporters": false,
		"items": "menuActionItems"
	} },
	blocks: [
		{
			"opcode": "showTitle",
			"blockType": "COMMAND",
			"text": "show title dialog",
			"description": "Shows the configured title dialog above the TurboWarp stage."
		},
		{
			"opcode": "showMenu",
			"blockType": "COMMAND",
			"text": "show application menu",
			"description": "Shows the application menu above the TurboWarp stage."
		},
		{
			"opcode": "addAppMenuAction",
			"blockType": "COMMAND",
			"text": "add app menu action [ACTION] labelled [LABEL]",
			"description": "Adds an application menu action this project owns, or relabels one it already added.",
			"arguments": {
				"ACTION": {
					"type": "STRING",
					"defaultValue": "start"
				},
				"LABEL": {
					"type": "STRING",
					"defaultValue": "Start"
				}
			}
		},
		{
			"opcode": "clearAppMenuActions",
			"blockType": "COMMAND",
			"text": "clear app menu actions",
			"description": "Removes every application menu action, including the built-in ones, so a project can define its own set."
		},
		{
			"opcode": "setAppMenuActionEnabled",
			"blockType": "COMMAND",
			"text": "set app menu action [ACTION] enabled [ENABLED]",
			"description": "Enables or disables one application menu action.",
			"arguments": {
				"ACTION": {
					"type": "STRING",
					"menu": "menuActions"
				},
				"ENABLED": {
					"type": "BOOLEAN",
					"defaultValue": true
				}
			}
		},
		{
			"opcode": "whenAppMenuActionSelected",
			"blockType": "HAT",
			"text": "when app menu action [ACTION] selected",
			"description": "Runs when the operator selects the named application menu action.",
			"arguments": { "ACTION": {
				"type": "STRING",
				"menu": "menuActions"
			} }
		},
		{
			"opcode": "showDslFiles",
			"blockType": "COMMAND",
			"text": "show DSL file manager",
			"description": "Shows the dialog that adds, opens, renames, deletes, and sorts stored DSL files."
		},
		{
			"opcode": "whenDslSourceOpened",
			"blockType": "HAT",
			"text": "when a DSL source is opened",
			"description": "Runs after the operator opens a stored DSL file, or after the opened source is announced again."
		},
		{
			"opcode": "reloadOpenedDsl",
			"blockType": "COMMAND",
			"text": "reload the opened DSL source",
			"description": "Announces the currently opened DSL source again without showing a dialog."
		},
		{
			"opcode": "openedDslName",
			"blockType": "REPORTER",
			"text": "opened DSL file name",
			"description": "Returns the name of the DSL file that is currently open, or an empty string."
		},
		{
			"opcode": "openedDslSource",
			"blockType": "REPORTER",
			"text": "opened DSL source",
			"description": "Returns the text of the DSL file that is currently open, or an empty string."
		},
		{
			"opcode": "hasSavedDsl",
			"blockType": "BOOLEAN",
			"text": "has a saved DSL file?",
			"description": "Reports whether at least one DSL file is stored in IndexedDB."
		},
		{
			"opcode": "savedDslCount",
			"blockType": "REPORTER",
			"text": "saved DSL file count",
			"description": "Returns how many DSL files are stored in IndexedDB."
		},
		{
			"opcode": "lastDslError",
			"blockType": "REPORTER",
			"text": "last DSL storage error",
			"description": "Returns the most recent DSL storage failure in the interface language, or an empty string."
		},
		{
			"opcode": "showExtensionCache",
			"blockType": "COMMAND",
			"text": "show extension cache manager",
			"description": "Shows the cache manager, which lists every cached copy each project uses and releases the ones selected."
		},
		{
			"opcode": "setCachedProjectTitle",
			"blockType": "COMMAND",
			"text": "label cached project [URI] as [TITLE]",
			"description": "Records a readable title to show beside a project URI in the extension cache manager. A project URI is deliberately opaque, so without a title the rows cannot be told apart; the title is self-declared and is never checked against the URI.",
			"arguments": {
				"URI": {
					"type": "STRING",
					"defaultValue": "https://example.com/turbowarp-plus-projects/ab/cd/project"
				},
				"TITLE": {
					"type": "STRING",
					"defaultValue": "My project"
				}
			}
		}
	]
};
//#endregion
//#region src/locales.ts
var titleLocales = Object.freeze({
	en: {
		title: "TurboWarp Title Menu",
		author: "Author: Hiroya Kubo",
		license: "License: MPL-2.0",
		website: "Official Website",
		close: "Close"
	},
	ja: {
		title: "TurboWarp Title Menu",
		author: "作者: Hiroya Kubo",
		license: "ライセンス: MPL-2.0",
		website: "公式Webサイト",
		close: "閉じる"
	}
});
var menuLocales = Object.freeze({
	en: {
		files: "DSL files",
		cache: "Extension cache",
		reload: "Reload DSL",
		about: "About",
		close: "Close"
	},
	ja: {
		files: "DSLファイル",
		cache: "機能拡張キャッシュ",
		reload: "DSLを再読み込み",
		about: "情報",
		close: "閉じる"
	}
});
var dslFilesLocales = Object.freeze({
	en: {
		title: "DSL files",
		add: "Add file",
		open: "Open",
		rename: "Rename",
		remove: "Delete",
		confirmRemove: "Delete for good?",
		confirm: "OK",
		cancel: "Cancel",
		close: "Close",
		sortByName: "Name",
		sortByDate: "Updated",
		sortBySize: "Size",
		empty: "No DSL file is saved yet. Use Add file to store one."
	},
	ja: {
		title: "DSLファイル",
		add: "ファイルを追加",
		open: "開く",
		rename: "名前を変える",
		remove: "削除",
		confirmRemove: "本当に削除?",
		confirm: "OK",
		cancel: "やめる",
		close: "閉じる",
		sortByName: "名前",
		sortByDate: "更新日時",
		sortBySize: "サイズ",
		empty: "保存されたDSLファイルはありません。「ファイルを追加」から保存してください。"
	}
});
Object.freeze({
	en: {
		title: "Extension cache",
		notice: "Cached entries are addressed by their contents, not owned by a project. Releasing a project drops the digests that project names, which can take bytes another project would have reused. Nothing is lost for good: whatever is still needed is downloaded again the next time a project is opened. Each URI below is what that project called itself and is not verified; the loader re-checks every digest when it uses it, so a wrong URI only misleads this list.",
		total: "Cached in all: {entries} entries, {bytes}",
		shared: "Shared by every project (pinned by the catalog)",
		untitled: "(no title recorded)",
		entryCount: "{entries} entries",
		expand: "Entries",
		collapse: "Fold",
		release: "Release",
		confirmRelease: "Release?",
		cancel: "Cancel",
		close: "Close",
		refresh: "Reload",
		empty: "Nothing is cached. Opening a project that uses extensions fills this.",
		releaseResult: "Released {released} entries and freed {freed}.",
		lastUsed: "used {date}",
		originalSize: "{bytes} of JavaScript"
	},
	ja: {
		title: "機能拡張キャッシュ",
		notice: "キャッシュは内容で参照されており、作品が所有しているわけではありません。作品を手放すと、その作品が名指すdigestを落とします。別の作品が使い回したはずのバイト列まで落ちることがあります。失われたままにはなりません。必要なものは、次にその作品を開いたときに取り直します。下に出るURIは、その作品自身の申告で、検証していません。Loaderは使うたびにdigestを照合するので、URIが誤っていても狂うのはこの一覧の見え方だけです。",
		total: "キャッシュ全体: {entries}件、{bytes}",
		shared: "すべての作品で共有（カタログが指定したもの）",
		untitled: "（タイトル未登録）",
		entryCount: "{entries}件",
		expand: "中身",
		collapse: "たたむ",
		release: "手放す",
		confirmRelease: "手放す?",
		cancel: "やめる",
		close: "閉じる",
		refresh: "読み直す",
		empty: "キャッシュは空です。機能拡張を使う作品を開くと入ります。",
		releaseResult: "{released}件を手放し、{freed}を空けました。",
		lastUsed: "最終利用 {date}",
		originalSize: "JavaScript {bytes}"
	}
});
/** Text for the cache manager table. */
var cacheManagerLocales = Object.freeze({
	en: {
		title: "Cache manager",
		notice: "Each row is one project's use of one cached copy. Releasing a use only removes it from this browser's cache; the project still refers to the same address and downloads it again the next time it is opened, so it may not work offline until then. A copy another project still uses stays. Names, addresses and project titles are what the projects recorded and are not verified; the loader checks every copy by its SHA-256 before using it.",
		search: "Search names, addresses, projects or digests",
		kindFilter: "Kind",
		kindAll: "All kinds",
		kinds: {
			costume: "Costume",
			backdrop: "Backdrop",
			sound: "Sound",
			document: "Document",
			extension: "Extension",
			other: "Other",
			unknown: "Unknown"
		},
		projectFilter: "Project",
		projectAll: "All projects",
		shared: "Shared by every project",
		untitled: "(no title recorded)",
		unnamed: "(no name recorded)",
		columns: {
			select: "Select",
			name: "Name",
			kind: "Kind",
			project: "Project",
			size: "Size",
			lastAccess: "Last used"
		},
		total: "{entries} cached copies, {bytes} ({uses} uses).",
		shown: "Showing {shown} of {uses}.",
		selectShown: "Select shown ({count})",
		selectAll: "Select all in the cache ({count})",
		clearSelection: "Clear selection",
		selection: "{uses} selected. Frees about {bytes}; {kept} copies stay because another project uses them.",
		release: "Release selected",
		confirmRelease: "Release {uses}?",
		cancel: "Cancel",
		close: "Close",
		refresh: "Reload",
		loading: "Reading the cache…",
		empty: "Nothing is cached. Opening a project that uses remote data fills this.",
		noMatches: "Nothing matches the search.",
		releaseResult: "Released {released} of {requested} and freed {freed}.",
		releaseStale: "{missing} had already been released elsewhere.",
		sharedBy: "used by {uses} projects",
		redacted: "Address shortened: credentials or a query were removed",
		digest: "SHA-256 {key}",
		embedNotice: "Embedding puts the data into the open project, unsaved, and keeps its address so it can be referenced remotely again. The project grows by that much. Its cached copy is released only after the project is saved.",
		embedFormat: "Embed as",
		embedFormats: {
			"embedded-file": "A file in the SB3",
			"embedded-data": "Data in project.json"
		},
		embed: "Embed {uses} in this project",
		embedAndRelease: "Embed {uses} and release after saving",
		embedOtherProjects: "{uses} selected belong to other projects. Open a project to embed its data.",
		embedResult: "Embedded {embedded} of {requested} into the open project. Save it to keep the change.",
		embedSkipped: "{count} could not be embedded: {reasons}.",
		embedSkipReasons: {
			"not-in-project": "the open project does not refer to it with this digest",
			changed: "the project data no longer matches the digest",
			unsupported: "its owner cannot embed it"
		},
		embedReleasePending: "Its cached copies are released once the project is saved.",
		embedReleaseResult: "The project was saved: released {released} and freed {freed}. {kept} were kept."
	},
	ja: {
		title: "キャッシュ管理",
		notice: "1行は、1つの作品がキャッシュの1つの実体を使っていることを表します。手放すと、このブラウザーのキャッシュから外れるだけです。作品は同じ URL を参照し続け、次に開いたときに取得し直すので、それまではオフラインで使えないことがあります。別の作品が使っている実体は残ります。名前・URL・作品名は作品が記録したもので、検証していません。Loader は使う前に SHA-256 で照合します。",
		search: "名前・URL・作品・digest で検索",
		kindFilter: "種類",
		kindAll: "すべての種類",
		kinds: {
			costume: "コスチューム",
			backdrop: "背景",
			sound: "音",
			document: "文書",
			extension: "機能拡張",
			other: "その他",
			unknown: "不明"
		},
		projectFilter: "作品",
		projectAll: "すべての作品",
		shared: "すべての作品で共有",
		untitled: "（作品名の記録なし）",
		unnamed: "（名前の記録なし）",
		columns: {
			select: "選択",
			name: "名前",
			kind: "種類",
			project: "作品",
			size: "容量",
			lastAccess: "最終利用"
		},
		total: "キャッシュの実体 {entries}件、{bytes}（利用 {uses}件）。",
		shown: "{uses}件中 {shown}件を表示。",
		selectShown: "表示中を選択（{count}件）",
		selectAll: "キャッシュ全体を選択（{count}件）",
		clearSelection: "選択を解除",
		selection: "{uses}件を選択中。約 {bytes} 空きます。{kept}件の実体は別の作品が使っているので残ります。",
		release: "選択を手放す",
		confirmRelease: "{uses}件を手放す?",
		cancel: "やめる",
		close: "閉じる",
		refresh: "読み直す",
		loading: "キャッシュを読んでいます…",
		empty: "キャッシュは空です。リモートのデータを使う作品を開くと入ります。",
		noMatches: "検索に合うものはありません。",
		releaseResult: "{requested}件中 {released}件を手放し、{freed} 空けました。",
		releaseStale: "{missing}件は別の場所で既に手放されていました。",
		sharedBy: "{uses}作品が利用",
		redacted: "URL を短縮しました（資格情報やクエリを除去）",
		digest: "SHA-256 {key}",
		embedNotice: "埋め込むと、開いている作品にデータを入れます（未保存）。URL は残すので、あとで同じ内容をリモート参照に戻せます。作品はその分大きくなります。キャッシュの実体は作品を保存してから手放します。",
		embedFormat: "埋め込み方",
		embedFormats: {
			"embedded-file": "SB3 内のファイル",
			"embedded-data": "project.json 内のデータ"
		},
		embed: "{uses}件をこの作品に埋め込む",
		embedAndRelease: "{uses}件を埋め込み、保存後に手放す",
		embedOtherProjects: "選択のうち{uses}件は別の作品のものです。埋め込むにはその作品を開いてください。",
		embedResult: "{requested}件中 {embedded}件を開いている作品に埋め込みました。保存すると確定します。",
		embedSkipped: "{count}件は埋め込めませんでした（{reasons}）。",
		embedSkipReasons: {
			"not-in-project": "開いている作品がこの digest で参照していない",
			changed: "作品のデータが digest と一致しない",
			unsupported: "所有者が埋め込みに対応していない"
		},
		embedReleasePending: "作品を保存すると、キャッシュの実体を手放します。",
		embedReleaseResult: "作品を保存しました。{released}件を手放し、{freed} 空けました。{kept}件は残しました。"
	}
});
var cacheErrorMessages = Object.freeze({
	en: {
		unavailable: "Browser storage is unavailable, so the extension cache cannot be read.",
		failed: "The extension cache operation failed."
	},
	ja: {
		unavailable: "ブラウザの保存領域が使えないため、機能拡張キャッシュを読めません。",
		failed: "機能拡張キャッシュの操作に失敗しました。"
	}
});
/**
* Turns a cache failure into operator-facing text.
*
* Only the codes this package assigns itself are translated. A failure raised inside IndexedDB
* keeps its own message, because inventing a friendlier sentence for an unclassified error would
* hide the one detail that makes it reportable.
*/
function describeCacheError(locale, error) {
	const code = error?.code;
	const messages = cacheErrorMessages[locale] ?? cacheErrorMessages.en;
	if (code !== void 0 && code in messages) return messages[code];
	if (error instanceof Error && error.message.length > 0) return error.message;
	return String(error);
}
var storeErrorMessages = Object.freeze({
	en: {
		unavailable: "Browser storage is unavailable, so DSL files cannot be saved.",
		"invalid-name": "That file name cannot be used.",
		"invalid-source": "That file could not be read as text.",
		"name-taken": "Another DSL file already uses that name.",
		"too-large": "That DSL file is too large to store.",
		"too-many": "The DSL store is full. Delete a file before adding another.",
		"not-found": "That DSL file is no longer stored.",
		quota: "Browser storage is full. Delete a DSL file and try again.",
		failed: "The DSL storage operation failed."
	},
	ja: {
		unavailable: "ブラウザの保存領域が使えないため、DSLファイルを保存できません。",
		"invalid-name": "そのファイル名は使えません。",
		"invalid-source": "そのファイルをテキストとして読み込めませんでした。",
		"name-taken": "同じ名前のDSLファイルがすでにあります。",
		"too-large": "そのDSLファイルは大きすぎて保存できません。",
		"too-many": "保存できる数に達しています。どれかを削除してから追加してください。",
		"not-found": "そのDSLファイルは保存されていません。",
		quota: "ブラウザの保存領域がいっぱいです。DSLファイルを削除してからやり直してください。",
		failed: "DSLファイルの操作に失敗しました。"
	}
});
/** Turns a store error code into operator-facing text, falling back to the raw message. */
function describeStoreError(locale, error) {
	const code = error?.code;
	const messages = storeErrorMessages[locale] ?? storeErrorMessages.en;
	if (code !== void 0 && code in messages) return messages[code];
	if (error instanceof Error && error.message.length > 0) return error.message;
	return String(error);
}
//#endregion
//#region src/extension.ts
var blockDefinitions = block_definitions_default.blocks;
var dslFileAccept = ".txt,.yaml,.yml,.json,.k4,.kamishibai";
/** Reserved action IDs the extension handles itself. A project may still remove or relabel them. */
var builtinActionIds = [
	"files",
	"cache",
	"reload",
	"about",
	"close"
];
function stageMount() {
	return Scratch.vm?.renderer?.canvas?.parentElement ?? globalThis.document?.body;
}
var TurboWarpTitleMenuExtension = class {
	constructor() {
		this.titleDialog = null;
		this.applicationMenu = null;
		this.filesDialog = null;
		this.cacheDialog = null;
		this.store = null;
		this.cache = null;
		this.projectTitles = /* @__PURE__ */ new Map();
		this.openedRecord = null;
		this.lastError = "";
		this.menuActions = builtinActionIds.map((id) => ({
			id,
			labels: {
				en: menuLocales.en[id],
				ja: menuLocales.ja[id]
			},
			enabled: true
		}));
		this.menuVisible = false;
	}
	getInfo() {
		return {
			id: extensionConfig.id,
			name: Scratch.translate(block_definitions_default.extensionName),
			docsURI: extensionConfig.docsURI,
			blockIconURI: extensionConfig.blockIconURI,
			blocks: blockDefinitions.map((block) => this.toScratchBlock(block)),
			menus: block_definitions_default.menus
		};
	}
	showTitle() {
		this.ensureTitleDialog().show(this.locale());
	}
	/**
	* Shows the application menu.
	*
	* An empty registry does nothing: the underlying primitive requires at least one action, and a
	* project that cleared the actions to install its own should not be interrupted by an error
	* between the two steps.
	*/
	showMenu() {
		if (this.menuActions.length === 0) return;
		this.ensureApplicationMenu().show(this.locale());
		this.menuVisible = true;
	}
	/**
	* Backs the dynamic `menuActions` dropdown, so it always lists what the project registered.
	*
	* The menu must refuse reporters. Scratch turns a reporter-accepting menu argument into an input
	* holding a shadow block, and `startHats` matches a hat against its *fields*, so the action hat
	* would never fire for a specific action. Refusing reporters keeps the argument an inline
	* dropdown, which is what the match reads.
	*/
	menuActionItems() {
		if (this.menuActions.length === 0) return [{
			text: "—",
			value: ""
		}];
		const locale = this.locale();
		return this.menuActions.map((action) => ({
			text: action.labels[locale],
			value: action.id
		}));
	}
	addAppMenuAction(args) {
		const id = Scratch.Cast.toString(args.ACTION).trim();
		if (id.length === 0) return;
		const label = Scratch.Cast.toString(args.LABEL);
		const existing = this.menuActions.find((action) => action.id === id);
		if (existing === void 0) this.menuActions.push({
			id,
			labels: {
				en: label,
				ja: label
			},
			enabled: true
		});
		else existing.labels = {
			en: label,
			ja: label
		};
		this.rebuildMenu();
	}
	clearAppMenuActions() {
		this.menuActions = [];
		this.rebuildMenu();
	}
	setAppMenuActionEnabled(args) {
		const id = Scratch.Cast.toString(args.ACTION);
		const action = this.menuActions.find((entry) => entry.id === id);
		if (action === void 0) return;
		action.enabled = Scratch.Cast.toBoolean(args.ENABLED);
		this.applicationMenu?.setActionState(id, { enabled: action.enabled });
	}
	/** Started by the menu callback, so the handler only has to accept the match. */
	whenAppMenuActionSelected() {
		return true;
	}
	showDslFiles() {
		return this.ensureFilesDialog().show(this.locale());
	}
	showExtensionCache() {
		return this.ensureCacheDialog().show(this.locale());
	}
	/**
	* Records a title to show beside one project URI.
	*
	* An empty URI is ignored because there is nothing to label, and an empty title forgets the
	* label rather than showing a blank row: that is the only way a project can take one back.
	*/
	setCachedProjectTitle(args) {
		const uri = Scratch.Cast.toString(args.URI).trim();
		if (uri.length === 0) return;
		const title = Scratch.Cast.toString(args.TITLE).trim();
		if (title.length === 0) {
			this.projectTitles.delete(uri);
			return;
		}
		this.projectTitles.set(uri, title);
	}
	/** The hat is started by the open path, so its own handler only has to accept the match. */
	whenDslSourceOpened() {
		return true;
	}
	reloadOpenedDsl() {
		if (this.openedRecord === null) return;
		this.announce(dslReloadEventName, this.openedRecord);
	}
	openedDslName() {
		return this.openedRecord?.name ?? "";
	}
	openedDslSource() {
		return this.openedRecord?.source ?? "";
	}
	async hasSavedDsl() {
		return await this.savedDslCount() > 0;
	}
	async savedDslCount() {
		try {
			return await this.requireStore().count();
		} catch (error) {
			this.recordFailure(error);
			return 0;
		}
	}
	lastDslError() {
		return this.lastError;
	}
	locale() {
		return resolveAppShellLocale() === "ja" ? "ja" : "en";
	}
	/**
	* Opens the store on first use.
	*
	* A browser without IndexedDB, or one with storage blocked, fails here rather than at extension
	* load: the title and menu blocks stay usable even when nothing can be stored.
	*/
	requireStore() {
		this.store ?? (this.store = createDslStore({ databaseName: extensionConfig.id }));
		return this.store;
	}
	/**
	* Opens the extension cache on first use.
	*
	* No database name is passed: the Loader wrote those bytes and the Loader owns the name of the
	* place they are in. Naming it here would put the same string in two packages, which is the
	* cross-layer mismatch this family keeps rediscovering.
	*/
	requireCache() {
		this.cache ?? (this.cache = createExtensionCache({ titleFor: (bucket) => this.projectTitles.get(bucket) }));
		return this.cache;
	}
	recordFailure(error) {
		this.lastError = describeStoreError(this.locale(), error);
	}
	/**
	* Rebuilds the menu after its action list changed.
	*
	* The app-shell primitive fixes its actions at construction, so a changed list means a new menu.
	* A menu that was on screen is shown again, because a project that adds an action while the menu
	* is open should not have it silently disappear. Clearing every action closes the menu instead,
	* because the primitive refuses to build one with no actions.
	*/
	rebuildMenu() {
		this.applicationMenu?.dispose();
		this.applicationMenu = null;
		if (!this.menuVisible) return;
		if (this.menuActions.length === 0) {
			this.menuVisible = false;
			return;
		}
		this.showMenu();
	}
	selectMenuAction(id) {
		Scratch.vm?.runtime?.startHats?.(`${extensionConfig.id}_whenAppMenuActionSelected`, { ACTION: id });
		if (!builtinActionIds.includes(id)) return;
		if (id === "files") this.showDslFiles();
		if (id === "cache") this.showExtensionCache();
		if (id === "reload") this.reloadOpenedDsl();
		if (id === "about") this.showTitle();
		if (id === "close") this.hideMenu();
	}
	hideMenu() {
		this.applicationMenu?.hide();
		this.menuVisible = false;
	}
	announce(eventName, record) {
		dispatchDslSourceEvent(eventName, record);
		Scratch.vm?.runtime?.startHats?.(`${extensionConfig.id}_whenDslSourceOpened`);
	}
	ensureTitleDialog() {
		if (this.titleDialog) return this.titleDialog;
		const mount = stageMount();
		this.titleDialog = createTitleDialog({
			document: globalThis.document,
			...mount ? { mount } : {},
			locales: titleLocales,
			initialLocale: this.locale(),
			websiteUrl: extensionConfig.homepage
		});
		return this.titleDialog;
	}
	/**
	* Builds the menu from the shared app-shell primitive.
	*
	* The actions below are this extension's own vocabulary, not the primitive's: a host application
	* that needs different actions composes `createAppShellApplicationMenu` itself through the
	* composition API instead of being limited to these four.
	*/
	ensureApplicationMenu() {
		if (this.applicationMenu) return this.applicationMenu;
		const mount = stageMount();
		if (mount === void 0) throw new TypeError("a stage container is required to show the menu");
		this.applicationMenu = createAppShellApplicationMenu({
			document: globalThis.document,
			mount,
			initialLocale: this.locale(),
			actions: this.menuActions.map((action) => ({
				id: action.id,
				labels: action.labels,
				enabled: action.enabled,
				onSelect: () => this.selectMenuAction(action.id)
			}))
		});
		return this.applicationMenu;
	}
	ensureFilesDialog() {
		if (this.filesDialog) return this.filesDialog;
		const mount = stageMount();
		this.filesDialog = createDslFilesDialog({
			document: globalThis.document,
			...mount ? { mount } : {},
			locales: dslFilesLocales,
			initialLocale: this.locale(),
			list: (sort) => this.requireStore().list(sort),
			onAdd: () => this.addDslFile(),
			onOpen: (id) => this.openDslFile(id),
			onRename: (id, name) => this.requireStore().rename(id, name),
			onRemove: (id) => this.removeDslFile(id),
			describeError: (error) => describeStoreError(this.locale(), error),
			onError: (error) => this.recordFailure(error)
		});
		return this.filesDialog;
	}
	/**
	* Builds the cache dialog.
	*
	* Cache failures go to `lastDslError` through the same reporter, because an operator has one
	* place to look for "what went wrong with storage" and the two stores fail for the same
	* reasons — blocked storage, a full quota — even though they are separate databases.
	*/
	ensureCacheDialog() {
		if (this.cacheDialog) return this.cacheDialog;
		const mount = stageMount();
		this.cacheDialog = createCacheManagerDialog({
			document: globalThis.document,
			...mount ? { mount } : {},
			locales: cacheManagerLocales,
			initialLocale: this.locale(),
			listAssets: () => this.requireCache().listAssets(),
			onRelease: (claims) => this.requireCache().releaseAssets(claims),
			describeError: (error) => describeCacheError(this.locale(), error),
			onError: (error) => {
				this.lastError = describeCacheError(this.locale(), error);
			}
		});
		return this.cacheDialog;
	}
	async addDslFile() {
		const chosen = await this.pickDslFile();
		if (chosen === null) return;
		await this.requireStore().save(await readDslFile(chosen));
		this.lastError = "";
	}
	async openDslFile(id) {
		const store = this.requireStore();
		const record = await store.get(id);
		if (record === null) return;
		await store.markOpened(id);
		this.openedRecord = record;
		this.lastError = "";
		this.announce(dslOpenEventName, record);
	}
	async removeDslFile(id) {
		await this.requireStore().remove(id);
		if (this.openedRecord?.id === id) this.openedRecord = null;
		this.lastError = "";
	}
	pickDslFile() {
		const document = globalThis.document;
		if (!document) throw new TypeError("document is required to open a DSL file");
		const input = document.createElement("input");
		input.type = "file";
		input.accept = dslFileAccept;
		return new Promise((resolve) => {
			input.addEventListener("change", () => {
				resolve(input.files?.[0] ?? null);
			}, { once: true });
			input.click();
		});
	}
	toScratchBlock(block) {
		const scratchBlock = {
			opcode: block.opcode,
			blockType: Scratch.BlockType[block.blockType],
			text: Scratch.translate(block.text),
			arguments: Object.fromEntries(Object.entries(block.arguments ?? {}).map(([name, argument]) => [name, {
				type: Scratch.ArgumentType[argument.type],
				...argument.defaultValue === void 0 ? {} : { defaultValue: argument.defaultValue },
				...argument.menu === void 0 ? {} : { menu: argument.menu }
			}]))
		};
		if (block.blockType === "HAT") scratchBlock["isEdgeActivated"] = false;
		return scratchBlock;
	}
};
//#endregion
//#region src/index.ts
var publicApi = Object.freeze({
	createApplicationMenu: createAppShellApplicationMenu,
	createDslFilesDialog,
	createDslStore,
	createCacheManagerDialog,
	createExtensionCache,
	createExtensionCacheDialog,
	createTitleDialog,
	dslOpenEventName,
	dslReloadEventName
});
Object.defineProperty(globalThis, "TurboWarpTitleMenu", {
	value: publicApi,
	configurable: true
});
if (extensionConfig.unsandboxed && !Scratch.extensions.unsandboxed) throw new Error(`${extensionConfig.name} must run unsandboxed.`);
Scratch.extensions.register(new TurboWarpTitleMenuExtension());
//#endregion

})(Scratch);
