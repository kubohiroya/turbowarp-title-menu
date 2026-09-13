// Name: TurboWarp Title Menu
// ID: kubohiroyaturbowarptitlemenu
// Description: Reusable title, application menu, and DSL source storage controls for TurboWarp.
// By: Hiroya Kubo
// License: MPL-2.0

(function (Scratch) {
  'use strict';

  function isRecord$1(value) {
    return typeof value === "object" && value !== null && !Array.isArray(value);
  }
  function requireElement$1(value, name) {
    if (!isRecord$1(value) || typeof value["appendChild"] !== "function") {
      throw new TypeError(`${name} must be a DOM element.`);
    }
    return value;
  }
  function requireDocument$1(value) {
    if (!isRecord$1(value) || typeof value["createElement"] !== "function") {
      throw new TypeError("document must provide the DOM document contract.");
    }
    return value;
  }
  function requireString(value, name) {
    if (typeof value !== "string" || value.length === 0) {
      throw new TypeError(`${name} must be a non-empty string.`);
    }
    return value;
  }
  function optionalBoolean(value, name, fallback) {
    if (value === void 0)
      return fallback;
    if (typeof value !== "boolean")
      throw new TypeError(`${name} must be a boolean.`);
    return value;
  }
  function optionalString(value, name) {
    if (value === void 0)
      return void 0;
    if (typeof value !== "string")
      throw new TypeError(`${name} must be a string.`);
    return value;
  }
  function requireLocalizedLabels(value, name) {
    if (!isRecord$1(value))
      throw new TypeError(`${name} must be an object.`);
    const entries = Object.entries(value);
    if (entries.length === 0)
      throw new TypeError(`${name} must include at least one locale.`);
    for (const [locale, label] of entries) {
      if (typeof label !== "string" || label.length === 0) {
        throw new TypeError(`${name}.${locale} must be a non-empty string.`);
      }
    }
    return value;
  }
  function firstLocale(locales, name) {
    const [locale] = Object.keys(locales);
    if (locale === void 0)
      throw new TypeError(`${name} must include at least one locale.`);
    return locale;
  }
  function resolveInjectedLocale(locales, requested, fallback, name) {
    if (requested !== void 0 && Object.hasOwn(locales, requested))
      return requested;
    if (fallback !== void 0 && Object.hasOwn(locales, fallback))
      return fallback;
    if (Object.hasOwn(locales, "en"))
      return "en";
    return firstLocale(locales, name);
  }
  function localized(locales, locale, fallback, name) {
    const resolved = resolveInjectedLocale(locales, locale, fallback, name);
    return locales[resolved];
  }
  function requireIcon(value, name) {
    if (value === void 0)
      return void 0;
    if (!isRecord$1(value))
      throw new TypeError(`${name} must be an object.`);
    const url = optionalString(value["url"], `${name}.url`);
    const text = optionalString(value["text"], `${name}.text`);
    const filter = optionalString(value["filter"], `${name}.filter`);
    const size = optionalString(value["size"], `${name}.size`);
    const fontSize = optionalString(value["fontSize"], `${name}.fontSize`);
    if ((url === void 0 || url.length === 0) && (text === void 0 || text.length === 0)) {
      throw new TypeError(`${name} must include a non-empty url or text.`);
    }
    return {
      ...url === void 0 ? {} : { url },
      ...text === void 0 ? {} : { text },
      ...filter === void 0 ? {} : { filter },
      ...size === void 0 ? {} : { size },
      ...fontSize === void 0 ? {} : { fontSize }
    };
  }
  function requireAttributes(value, name) {
    if (value === void 0)
      return void 0;
    if (!isRecord$1(value))
      throw new TypeError(`${name} must be an object.`);
    for (const [attribute, attributeValue] of Object.entries(value)) {
      if (attribute.length === 0)
        throw new TypeError(`${name} names must be non-empty.`);
      if (typeof attributeValue !== "string") {
        throw new TypeError(`${name}.${attribute} must be a string.`);
      }
    }
    return value;
  }
  function applyAttributes(element, attributes) {
    if (attributes === void 0)
      return;
    for (const [name, value] of Object.entries(attributes))
      element.setAttribute(name, value);
  }
  function requireRect(value, name) {
    if (value === void 0)
      return void 0;
    if (!isRecord$1(value))
      throw new TypeError(`${name} must be an object.`);
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
    if (rect === void 0)
      return;
    if (rect.left !== void 0)
      element.style.left = rect.left;
    if (rect.top !== void 0)
      element.style.top = rect.top;
    if (rect.width !== void 0)
      element.style.width = rect.width;
    if (rect.height !== void 0)
      element.style.height = rect.height;
  }
  function requireTestId(value, name) {
    if (value === void 0)
      return void 0;
    if (typeof value !== "string" || value.length === 0) {
      throw new TypeError(`${name} must be a non-empty string.`);
    }
    return value;
  }
  function applyTestId(element, testId) {
    if (testId !== void 0)
      element.setAttribute("data-testid", testId);
  }
  function restoreableMountPosition(document, mount) {
    if (mount === document.body)
      return null;
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
    } catch {
    }
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
    return `url("${url.replaceAll("\\", "\\\\").replaceAll('"', '\\"')}")`;
  }
  function renderIcon(element, icon) {
    element.textContent = "";
    element.style.backgroundImage = "";
    element.style.display = icon === void 0 ? "none" : "inline-flex";
    if (icon === void 0)
      return;
    element.style.filter = icon.filter ?? "";
    if (icon.size !== void 0) {
      element.style.width = icon.size;
      element.style.height = icon.size;
    }
    if (icon.fontSize !== void 0)
      element.style.fontSize = icon.fontSize;
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
    if (tone === "warning")
      return "#805300";
    if (tone === "error")
      return "#a00020";
    if (tone === "info")
      return "#176e9f";
    return "#35524c";
  }
  function resolveAppShellLocale(input) {
    const preferred = globalThis.navigator?.language ?? "";
    return /^ja(?:-|$)/iu.test(preferred) ? "ja" : "en";
  }
  function boundedText(value, limit = 2e3) {
    const text = String(value ?? "");
    const scalars = [...text];
    return scalars.length <= limit ? text : `${scalars.slice(0, limit - 1).join("")}...`;
  }
  function createAppShellApplicationMenu(options) {
    if (!isRecord$1(options))
      throw new TypeError("application menu options must be an object.");
    const document = requireDocument$1(options.document);
    const mount = requireElement$1(options.mount, "mount");
    if (!Array.isArray(options.actions) || options.actions.length === 0) {
      throw new TypeError("actions must include at least one menu action.");
    }
    const fallbackLocale = optionalString(options.fallbackLocale, "fallbackLocale");
    const rootTestId = requireTestId(options.rootTestId, "rootTestId");
    const statusTestId = requireTestId(options.statusTestId, "statusTestId");
    const menuAttributes = options.attributes ?? {};
    if (!isRecord$1(menuAttributes))
      throw new TypeError("attributes must be an object.");
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
    for (const [index, definition] of options.actions.entries()) {
      if (!isRecord$1(definition))
        throw new TypeError(`actions.${index} must be an object.`);
      const id = requireString(definition.id, `actions.${index}.id`);
      if (seen.has(id))
        throw new TypeError(`Duplicate application menu action id: ${id}.`);
      seen.add(id);
      const labels = requireLocalizedLabels(definition.labels, `actions.${index}.labels`);
      const icon = requireIcon(definition.icon, `actions.${index}.icon`);
      const enabled = optionalBoolean(definition.enabled, `actions.${index}.enabled`, true);
      const visible = optionalBoolean(definition.visible, `actions.${index}.visible`, true);
      const testId = requireTestId(definition.testId, `actions.${index}.testId`);
      const position = requireRect(definition.position, `actions.${index}.position`);
      const actionAttributes = requireAttributes(definition.attributes, `actions.${index}.attributes`);
      if (typeof definition.onSelect !== "function") {
        throw new TypeError(`actions.${index}.onSelect must be a function.`);
      }
      const onSelect = definition.onSelect;
      const button = document.createElement("button");
      const iconElement = document.createElement("span");
      const label = document.createElement("span");
      const row = Math.floor(index / 2);
      const column = index % 2;
      button.type = "button";
      button.setAttribute("data-turbowarp-app-shell-menu-action", id);
      button.style.cssText = `position:absolute;left:${column === 0 ? "10%" : "53.3333%"};top:${25.5556 + row * 30}%;width:36.6667%;height:24.4444%;display:flex;min-width:0;min-height:0;align-items:center;justify-content:center;flex-direction:column;gap:.4167cqw;border:.4167cqw solid #005f50;border-radius:2.9167cqw;background:#007d66;color:#fff;box-shadow:0 .625cqw 1.6667cqw rgba(0,0,0,.2);cursor:pointer;font:inherit;`;
      button.style.cursor = "pointer";
      applyTestId(button, testId);
      applyAttributes(button, actionAttributes);
      iconElement.setAttribute("aria-hidden", "true");
      iconElement.style.cssText = "display:inline-flex;width:10cqw;height:10cqw;align-items:center;justify-content:center;line-height:1;font-size:6cqw;";
      label.style.cssText = "font-size:3.8cqw;line-height:1.15;text-align:center;";
      button.appendChild(iconElement);
      button.appendChild(label);
      const onClick = (event) => {
        const current = buttons.get(id);
        if (current === void 0 || !current.enabled || !current.visible)
          return;
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
    if (typeof statusState.text !== "string")
      throw new TypeError("status.text must be a string.");
    if (typeof statusState.visible !== "boolean")
      throw new TypeError("status.visible must be a boolean.");
    if (!["neutral", "info", "warning", "error"].includes(statusState.tone)) {
      throw new TypeError("status.tone must be neutral, info, warning, or error.");
    }
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
      if (disposed)
        throw new TypeError("application menu is disposed.");
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
        if (!disposed)
          root.style.display = "none";
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
        if (action === void 0)
          throw new TypeError(`Unknown application menu action: ${id}.`);
        if (!isRecord$1(state))
          throw new TypeError("application menu action state must be an object.");
        if (state.enabled !== void 0) {
          if (typeof state.enabled !== "boolean")
            throw new TypeError("action enabled must be a boolean.");
          action.enabled = state.enabled;
        }
        if (state.visible !== void 0) {
          if (typeof state.visible !== "boolean")
            throw new TypeError("action visible must be a boolean.");
          action.visible = state.visible;
        }
        if (state.labels !== void 0) {
          action.labels = requireLocalizedLabels(state.labels, "action state labels");
        }
        if (state.icon !== void 0) {
          action.iconDefinition = requireIcon(state.icon, "action state icon");
        }
        if (state.position !== void 0) {
          action.position = requireRect(state.position, "action state position");
        }
        renderMenu();
      },
      setStatus(nextStatus) {
        ensureActive();
        if (!isRecord$1(nextStatus))
          throw new TypeError("application menu status must be an object.");
        const nextToneValue = nextStatus["tone"] ?? statusState.tone;
        if (!["neutral", "info", "warning", "error"].includes(String(nextToneValue))) {
          throw new TypeError("status.tone must be neutral, info, warning, or error.");
        }
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
        if (disposed)
          return;
        disposed = true;
        for (const { button, onClick } of buttons.values()) {
          button.removeEventListener("click", onClick);
        }
        buttons.clear();
        root.remove();
        restoreMountPosition?.();
      },
      get element() {
        return root;
      }
    });
  }
  const extensionConfig = {
    id: "kubohiroyaturbowarptitlemenu",
    name: "TurboWarp Title Menu",
    homepage: "https://github.com/kubohiroya/turbowarp-title-menu",
    docsURI: "https://kubohiroya.github.io/turbowarp-title-menu/",
    blockIconURI: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0OCA0OCI+PHJlY3QgeD0iNSIgeT0iOCIgd2lkdGg9IjM4IiBoZWlnaHQ9IjMyIiByeD0iNCIgZmlsbD0iIzAwN2Q2NiIvPjxyZWN0IHg9IjkiIHk9IjEyIiB3aWR0aD0iMzAiIGhlaWdodD0iMjQiIHJ4PSIyIiBmaWxsPSIjZjRmZmZiIi8+PHBhdGggZD0iTTE1IDE5aDE4TTE1IDI0aDE4TTE1IDI5aDEyIiBzdHJva2U9IiMwMDdkNjYiIHN0cm9rZS13aWR0aD0iMyIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PC9zdmc+"
  };
  function isRecord(value) {
    return typeof value === "object" && value !== null && !Array.isArray(value);
  }
  function requireDocument(value) {
    if (!isRecord(value) || typeof value.createElement !== "function") {
      throw new TypeError("document must provide createElement");
    }
    return value;
  }
  function requireElement(value, name) {
    if (!isRecord(value) || typeof value.appendChild !== "function") {
      throw new TypeError(`${name} must be a DOM element`);
    }
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
    return () => {
    };
  }
  function invokeSafely(operation, onError) {
    try {
      Promise.resolve(operation()).catch((error) => onError?.(error));
    } catch (error) {
      onError?.(error);
    }
  }
  class DslStoreError extends Error {
    constructor(code, message, cause) {
      super(message, cause === void 0 ? void 0 : { cause });
      this.name = "DslStoreError";
      this.code = code;
    }
  }
  const defaultDslSort = Object.freeze({ field: "updatedAt", direction: "desc" });
  const fileStoreName = "files";
  const metaStoreName = "meta";
  const lastOpenedKey = "last-opened";
  const nameIndexName = "by-name";
  const encoder = new TextEncoder();
  const maximumNameLength = 200;
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
    if (name.length > maximumNameLength) {
      throw new DslStoreError("invalid-name", `DSL name must be at most ${maximumNameLength} characters.`);
    }
    if (hasControlCharacter(name)) {
      throw new DslStoreError("invalid-name", "DSL name must not contain control characters.");
    }
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
    if (name === "QuotaExceededError") {
      return new DslStoreError("quota", "Browser storage is full. Delete a saved DSL file first.", cause);
    }
    if (name === "ConstraintError") {
      return new DslStoreError("name-taken", "A DSL file with that name already exists.", cause);
    }
    return new DslStoreError("failed", "The DSL storage operation failed.", cause);
  }
  function compareSummaries(sort) {
    const direction = sort.direction === "asc" ? 1 : -1;
    return (left, right) => {
      if (sort.field === "name") {
        return direction * left.name.localeCompare(right.name, void 0, { numeric: true });
      }
      if (sort.field === "byteLength") {
        return direction * (left.byteLength - right.byteLength) || left.name.localeCompare(right.name);
      }
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
    if (factory === void 0 || typeof factory.open !== "function") {
      throw new DslStoreError("unavailable", "IndexedDB is not available in this environment.");
    }
    const databaseName = options.databaseName ?? "turbowarp-title-menu";
    const maxSourceBytes = options.maxSourceBytes ?? 1024 * 1024;
    const maxFileCount = options.maxFileCount ?? 64;
    const now = options.now ?? (() => /* @__PURE__ */ new Date());
    const createId = options.createId ?? defaultCreateId;
    let connection = null;
    function open() {
      connection ?? (connection = new Promise((resolve, reject) => {
        const opening = factory.open(databaseName, 1);
        opening.onupgradeneeded = () => {
          const database = opening.result;
          if (!database.objectStoreNames.contains(fileStoreName)) {
            const files = database.createObjectStore(fileStoreName, { keyPath: "id" });
            files.createIndex(nameIndexName, "name", { unique: true });
          }
          if (!database.objectStoreNames.contains(metaStoreName)) {
            database.createObjectStore(metaStoreName, { keyPath: "key" });
          }
        };
        opening.onsuccess = () => resolve(opening.result);
        opening.onerror = () => reject(toStoreError(opening.error));
        opening.onblocked = () => reject(new DslStoreError("failed", "Another tab is upgrading the DSL database."));
      }));
      return connection;
    }
    async function readAll() {
      const database = await open();
      const transaction = database.transaction(fileStoreName, "readonly");
      const records = await request(
        transaction.objectStore(fileStoreName).getAll()
      );
      await transactionDone(transaction);
      return records;
    }
    async function readOne(id) {
      const database = await open();
      const transaction = database.transaction(fileStoreName, "readonly");
      const record = await request(
        transaction.objectStore(fileStoreName).get(id)
      );
      await transactionDone(transaction);
      return record ?? null;
    }
    return Object.freeze({
      databaseName,
      async list(sort = defaultDslSort) {
        const records = await readAll();
        return records.map(toSummary).sort(compareSummaries(sort));
      },
      async count() {
        const database = await open();
        const transaction = database.transaction(fileStoreName, "readonly");
        const total = await request(transaction.objectStore(fileStoreName).count());
        await transactionDone(transaction);
        return total;
      },
      get(id) {
        return readOne(id);
      },
      async save(file) {
        const name = normalizeName(file.name);
        if (typeof file.source !== "string") {
          throw new DslStoreError("invalid-source", "DSL source must be a string.");
        }
        const byteLength = encoder.encode(file.source).byteLength;
        if (byteLength > maxSourceBytes) {
          throw new DslStoreError("too-large", `DSL source exceeds ${maxSourceBytes} bytes.`);
        }
        const database = await open();
        const transaction = database.transaction(fileStoreName, "readwrite");
        const files = transaction.objectStore(fileStoreName);
        const existing = await request(
          files.index(nameIndexName).get(name)
        );
        if (existing === void 0) {
          const total = await request(files.count());
          if (total >= maxFileCount) {
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
        const database = await open();
        const transaction = database.transaction(fileStoreName, "readwrite");
        const files = transaction.objectStore(fileStoreName);
        const existing = await request(
          files.get(id)
        );
        if (existing === void 0) {
          transaction.abort();
          throw new DslStoreError("not-found", `No DSL file with id ${id}.`);
        }
        if (existing.name !== name) {
          const taken = await request(
            files.index(nameIndexName).get(name)
          );
          if (taken !== void 0) {
            transaction.abort();
            throw new DslStoreError("name-taken", `A DSL file named ${name} already exists.`);
          }
        }
        const record = { ...existing, name, updatedAt: now().toISOString() };
        await request(files.put(record));
        await transactionDone(transaction);
        return record;
      },
      async remove(id) {
        const database = await open();
        const transaction = database.transaction([fileStoreName, metaStoreName], "readwrite");
        await request(transaction.objectStore(fileStoreName).delete(id));
        const meta = transaction.objectStore(metaStoreName);
        const pointer = await request(
          meta.get(lastOpenedKey)
        );
        if (pointer?.id === id) await request(meta.delete(lastOpenedKey));
        await transactionDone(transaction);
      },
      async clear() {
        const database = await open();
        const transaction = database.transaction([fileStoreName, metaStoreName], "readwrite");
        await request(transaction.objectStore(fileStoreName).clear());
        await request(transaction.objectStore(metaStoreName).clear());
        await transactionDone(transaction);
      },
      async lastOpened() {
        const database = await open();
        const transaction = database.transaction(metaStoreName, "readonly");
        const pointer = await request(
          transaction.objectStore(metaStoreName).get(lastOpenedKey)
        );
        await transactionDone(transaction);
        if (pointer === void 0) return null;
        return readOne(pointer.id);
      },
      async markOpened(id) {
        const record = await readOne(id);
        if (record === null) throw new DslStoreError("not-found", `No DSL file with id ${id}.`);
        const database = await open();
        const transaction = database.transaction(metaStoreName, "readwrite");
        await request(transaction.objectStore(metaStoreName).put({ key: lastOpenedKey, id }));
        await transactionDone(transaction);
      },
      close() {
        const pending = connection;
        connection = null;
        void pending?.then((database) => database.close()).catch(() => void 0);
      }
    });
  }
  function defaultCreateId() {
    const crypto = globalThis.crypto;
    if (typeof crypto?.randomUUID === "function") return crypto.randomUUID();
    return `dsl-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  }
  async function readDslFile(file, maxSourceBytes = 1024 * 1024) {
    if (typeof file?.text !== "function") {
      throw new DslStoreError("invalid-source", "file must be a browser File.");
    }
    if (file.size > maxSourceBytes) {
      throw new DslStoreError("too-large", `DSL file exceeds ${maxSourceBytes} bytes.`);
    }
    return { name: file.name, source: await file.text() };
  }
  const defaultSortDirections = Object.freeze({
    name: "asc",
    updatedAt: "desc",
    byteLength: "desc"
  });
  function requireLocales(value) {
    if (!isRecord(value) || Object.keys(value).length === 0) {
      throw new TypeError("locales must contain at least one locale");
    }
    return value;
  }
  function textFor(locales, locale) {
    const text = locales[locale] ?? locales["en"] ?? Object.values(locales)[0];
    if (text === void 0) throw new TypeError("locales must contain at least one locale");
    return text;
  }
  function defaultFormatSize(byteLength) {
    if (byteLength < 1024) return `${byteLength} B`;
    if (byteLength < 1024 * 1024) return `${(byteLength / 1024).toFixed(1)} KB`;
    return `${(byteLength / (1024 * 1024)).toFixed(1)} MB`;
  }
  function defaultFormatDate(isoDate) {
    const parsed = new Date(isoDate);
    if (Number.isNaN(parsed.getTime())) return isoDate;
    const pad = (value) => String(value).padStart(2, "0");
    return `${parsed.getFullYear()}-${pad(parsed.getMonth() + 1)}-${pad(parsed.getDate())} ${pad(parsed.getHours())}:${pad(parsed.getMinutes())}`;
  }
  function defaultDescribeError(error) {
    if (error instanceof Error && error.message.length > 0) return error.message;
    return String(error);
  }
  function createDslFilesDialog(options) {
    if (!isRecord(options)) throw new TypeError("DSL files dialog options must be an object");
    const document = requireDocument(options.document ?? globalThis.document);
    const mount = requireElement(options.mount ?? document.body, "mount");
    const locales = requireLocales(options.locales);
    const describeError = options.describeError ?? defaultDescribeError;
    const formatSize = options.formatSize ?? defaultFormatSize;
    const formatDate = options.formatDate ?? defaultFormatDate;
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
    if (previousMountPosition === "" || previousMountPosition === "static") {
      mount.style.position = "relative";
    }
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
      if (sort.field === field) {
        sort = { field, direction: sort.direction === "asc" ? "desc" : "asc" };
      } else {
        sort = { field, direction: defaultSortDirections[field] };
      }
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
        const button = createButton(
          active ? `${label}${arrow}` : label,
          active ? "active" : "plain",
          () => selectSort(field)
        );
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
        row.appendChild(
          createButton(text.cancel, "plain", () => {
            renamingId = null;
            render();
          })
        );
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
        row.appendChild(
          createButton(text.confirmRemove, "danger", () => {
            confirmingRemovalId = null;
            mutate(() => options.onRemove(summary.id));
          })
        );
        row.appendChild(
          createButton(text.cancel, "plain", () => {
            confirmingRemovalId = null;
            render();
          })
        );
        return row;
      }
      row.appendChild(
        createButton(text.open, "primary", () => {
          mutate(() => options.onOpen(summary.id));
        })
      );
      row.appendChild(
        createButton(text.rename, "plain", () => {
          renamingId = summary.id;
          confirmingRemovalId = null;
          render();
        })
      );
      row.appendChild(
        createButton(text.remove, "plain", () => {
          confirmingRemovalId = summary.id;
          renamingId = null;
          render();
        })
      );
      return row;
    }
    function render() {
      if (disposed) return;
      const text = textFor(locales, locale);
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
      } else {
        for (const summary of summaries) listElement.appendChild(renderRow(summary, text));
      }
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
        if (previousMountPosition === "" || previousMountPosition === "static") {
          mount.style.position = previousMountPosition;
        }
      }
    });
  }
  const dslOpenEventName = "turbowarp-title-menu:dsl-open";
  const dslReloadEventName = "turbowarp-title-menu:dsl-reload";
  function dispatchDslSourceEvent(type, record) {
    const target = globalThis;
    if (typeof target.dispatchEvent !== "function") return;
    const event = typeof CustomEvent === "function" ? new CustomEvent(type, { detail: { record } }) : new Event(type);
    if (!("detail" in event)) {
      Object.defineProperty(event, "detail", { value: { record } });
    }
    target.dispatchEvent(event);
  }
  function requireLocaleText(locales, locale) {
    const text = locales[locale] ?? locales.en ?? Object.values(locales)[0];
    if (!text) throw new TypeError("locales must contain at least one locale");
    for (const key of ["title", "website", "close"]) {
      if (typeof text[key] !== "string" || text[key].length === 0) {
        throw new TypeError(`locales.${locale}.${key} must be a non-empty string`);
      }
    }
    return text;
  }
  function openWebsite(url) {
    const opener = globalThis.open;
    if (typeof opener === "function") {
      opener(url, "_blank", "noopener,noreferrer");
    } else if (globalThis.location) {
      globalThis.location.href = url;
    }
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
  const extensionName = "TurboWarp Title Menu";
  const menus = { "menuActions": { "acceptReporters": false, "items": "menuActionItems" } };
  const blocks = [{ "opcode": "showTitle", "blockType": "COMMAND", "text": "show title dialog", "description": "Shows the configured title dialog above the TurboWarp stage." }, { "opcode": "showMenu", "blockType": "COMMAND", "text": "show application menu", "description": "Shows the application menu above the TurboWarp stage." }, { "opcode": "addAppMenuAction", "blockType": "COMMAND", "text": "add app menu action [ACTION] labelled [LABEL]", "description": "Adds an application menu action this project owns, or relabels one it already added.", "arguments": { "ACTION": { "type": "STRING", "defaultValue": "start" }, "LABEL": { "type": "STRING", "defaultValue": "Start" } } }, { "opcode": "clearAppMenuActions", "blockType": "COMMAND", "text": "clear app menu actions", "description": "Removes every application menu action, including the built-in ones, so a project can define its own set." }, { "opcode": "setAppMenuActionEnabled", "blockType": "COMMAND", "text": "set app menu action [ACTION] enabled [ENABLED]", "description": "Enables or disables one application menu action.", "arguments": { "ACTION": { "type": "STRING", "menu": "menuActions" }, "ENABLED": { "type": "BOOLEAN", "defaultValue": true } } }, { "opcode": "whenAppMenuActionSelected", "blockType": "HAT", "text": "when app menu action [ACTION] selected", "description": "Runs when the operator selects the named application menu action.", "arguments": { "ACTION": { "type": "STRING", "menu": "menuActions" } } }, { "opcode": "showDslFiles", "blockType": "COMMAND", "text": "show DSL file manager", "description": "Shows the dialog that adds, opens, renames, deletes, and sorts stored DSL files." }, { "opcode": "whenDslSourceOpened", "blockType": "HAT", "text": "when a DSL source is opened", "description": "Runs after the operator opens a stored DSL file, or after the opened source is announced again." }, { "opcode": "reloadOpenedDsl", "blockType": "COMMAND", "text": "reload the opened DSL source", "description": "Announces the currently opened DSL source again without showing a dialog." }, { "opcode": "openedDslName", "blockType": "REPORTER", "text": "opened DSL file name", "description": "Returns the name of the DSL file that is currently open, or an empty string." }, { "opcode": "openedDslSource", "blockType": "REPORTER", "text": "opened DSL source", "description": "Returns the text of the DSL file that is currently open, or an empty string." }, { "opcode": "hasSavedDsl", "blockType": "BOOLEAN", "text": "has a saved DSL file?", "description": "Reports whether at least one DSL file is stored in IndexedDB." }, { "opcode": "savedDslCount", "blockType": "REPORTER", "text": "saved DSL file count", "description": "Returns how many DSL files are stored in IndexedDB." }, { "opcode": "lastDslError", "blockType": "REPORTER", "text": "last DSL storage error", "description": "Returns the most recent DSL storage failure in the interface language, or an empty string." }];
  const definitions = {
    extensionName,
    menus,
    blocks
  };
  const titleLocales = Object.freeze({
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
  const menuLocales = Object.freeze({
    en: { files: "DSL files", reload: "Reload DSL", about: "About", close: "Close" },
    ja: { files: "DSLファイル", reload: "DSLを再読み込み", about: "情報", close: "閉じる" }
  });
  const dslFilesLocales = Object.freeze({
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
  const storeErrorMessages = Object.freeze({
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
  function describeStoreError(locale, error) {
    const code = error?.code;
    const messages = storeErrorMessages[locale] ?? storeErrorMessages.en;
    if (code !== void 0 && code in messages) return messages[code];
    if (error instanceof Error && error.message.length > 0) return error.message;
    return String(error);
  }
  const blockDefinitions = definitions.blocks;
  const dslFileAccept = ".txt,.yaml,.yml,.json,.k4,.kamishibai";
  const builtinActionIds = ["files", "reload", "about", "close"];
  function stageMount() {
    return Scratch.vm?.renderer?.canvas?.parentElement ?? globalThis.document?.body;
  }
  class TurboWarpTitleMenuExtension {
    constructor() {
      this.titleDialog = null;
      this.applicationMenu = null;
      this.filesDialog = null;
      this.store = null;
      this.openedRecord = null;
      this.lastError = "";
      this.menuActions = builtinActionIds.map((id) => ({
        id,
        labels: { en: menuLocales.en[id], ja: menuLocales.ja[id] },
        enabled: true
      }));
      this.menuVisible = false;
    }
    getInfo() {
      return {
        id: extensionConfig.id,
        name: Scratch.translate(definitions.extensionName),
        docsURI: extensionConfig.docsURI,
        blockIconURI: extensionConfig.blockIconURI,
        blocks: blockDefinitions.map((block) => this.toScratchBlock(block)),
        menus: definitions.menus
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
      if (this.menuActions.length === 0) return [{ text: "—", value: "" }];
      const locale = this.locale();
      return this.menuActions.map((action) => ({ text: action.labels[locale], value: action.id }));
    }
    addAppMenuAction(args) {
      const id = Scratch.Cast.toString(args.ACTION).trim();
      if (id.length === 0) return;
      const label = Scratch.Cast.toString(args.LABEL);
      const existing = this.menuActions.find((action) => action.id === id);
      if (existing === void 0) {
        this.menuActions.push({ id, labels: { en: label, ja: label }, enabled: true });
      } else {
        existing.labels = { en: label, ja: label };
      }
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
      if (id === "files") void this.showDslFiles();
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
        input.addEventListener(
          "change",
          () => {
            resolve(input.files?.[0] ?? null);
          },
          { once: true }
        );
        input.click();
      });
    }
    toScratchBlock(block) {
      const scratchBlock = {
        opcode: block.opcode,
        blockType: Scratch.BlockType[block.blockType],
        text: Scratch.translate(block.text),
        arguments: Object.fromEntries(
          Object.entries(block.arguments ?? {}).map(([name, argument]) => [
            name,
            {
              type: Scratch.ArgumentType[argument.type],
              ...argument.defaultValue === void 0 ? {} : { defaultValue: argument.defaultValue },
              ...argument.menu === void 0 ? {} : { menu: argument.menu }
            }
          ])
        )
      };
      if (block.blockType === "HAT") scratchBlock["isEdgeActivated"] = false;
      return scratchBlock;
    }
  }
  const publicApi = Object.freeze({
    createApplicationMenu: createAppShellApplicationMenu,
    createDslFilesDialog,
    createDslStore,
    createTitleDialog,
    dslOpenEventName,
    dslReloadEventName
  });
  Object.defineProperty(globalThis, "TurboWarpTitleMenu", {
    value: publicApi,
    configurable: true
  });
  if (!Scratch.extensions.unsandboxed) {
    throw new Error(`${extensionConfig.name} must run unsandboxed.`);
  }
  Scratch.extensions.register(new TurboWarpTitleMenuExtension());

})(Scratch);
