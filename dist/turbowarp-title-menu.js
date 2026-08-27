// Name: TurboWarp Title Menu
// ID: kubohiroyaturbowarptitlemenu
// Description: Reusable title, application menu, and DSL source storage controls for TurboWarp.
// By: Hiroya Kubo
// License: MPL-2.0

(function (Scratch) {
  'use strict';

  const extensionConfig = {
    id: "kubohiroyaturbowarptitlemenu",
    name: "TurboWarp Title Menu",
    author: "Hiroya Kubo",
    license: "MPL-2.0",
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
  const defaultIcons = {
    open: "📂",
    reload: "↻",
    about: "i",
    close: "x"
  };
  function textFor(locales, locale) {
    const text = locales[locale] ?? locales.en ?? Object.values(locales)[0];
    if (!text) throw new TypeError("locales must contain at least one locale");
    for (const key of ["open", "reload", "about", "close"]) {
      if (typeof text[key] !== "string" || text[key].length === 0) {
        throw new TypeError(`locales.${locale}.${key} must be a non-empty string`);
      }
    }
    return text;
  }
  function createApplicationMenu(options) {
    const document = requireDocument(options.document ?? globalThis.document);
    const mount = requireElement(options.mount ?? document.body, "mount");
    const locales = options.locales;
    if (!locales || typeof locales !== "object") throw new TypeError("locales must be an object");
    const root = document.createElement("section");
    root.setAttribute("data-turbowarp-application-menu", "true");
    root.setAttribute("aria-label", "TurboWarp title menu");
    root.style.cssText = "position:absolute;inset:0;z-index:2147483600;display:none;box-sizing:border-box;overflow:hidden;pointer-events:auto;font-family:sans-serif;container-type:inline-size;";
    const restoreMount = ensureRelativeMount(mount);
    mount.appendChild(root);
    const callbacks = {
      open: options.onOpen,
      reload: options.onReload,
      about: options.onAbout,
      close: options.onClose
    };
    const positions = {
      open: ["10%", "25.5556%"],
      reload: ["53.3333%", "25.5556%"],
      about: ["10%", "58.8889%"],
      close: ["53.3333%", "58.8889%"]
    };
    const buttons = /* @__PURE__ */ new Map();
    let locale = options.initialLocale ?? (locales.ja ? "ja" : Object.keys(locales)[0] ?? "en");
    let reloadEnabled = options.reloadEnabled ?? true;
    let disposed = false;
    for (const action of ["open", "reload", "about", "close"]) {
      const button = document.createElement("button");
      const icon = document.createElement("span");
      const label = document.createElement("span");
      const [left, top] = positions[action];
      button.type = "button";
      button.setAttribute("data-turbowarp-menu-action", action);
      button.style.cssText = `position:absolute;left:${left};top:${top};width:36.6667%;height:24.4444%;display:flex;min-width:0;min-height:0;align-items:center;justify-content:center;flex-direction:column;gap:.4167cqw;border:.4167cqw solid #005f50;border-radius:2.9167cqw;background:#007d66;color:#fff;box-shadow:0 .625cqw 1.6667cqw rgba(0,0,0,.2);cursor:pointer;font:inherit;`;
      icon.setAttribute("aria-hidden", "true");
      icon.style.cssText = "display:block;font-size:8cqw;line-height:1;";
      icon.textContent = defaultIcons[action];
      label.style.cssText = "font-size:3.8cqw;line-height:1.15;text-align:center;";
      button.append(icon, label);
      button.addEventListener("click", () => {
        if (action === "reload" && !reloadEnabled) return;
        const callback = callbacks[action];
        if (callback) invokeSafely(callback, options.onError);
        if (action === "close") hide();
      });
      root.appendChild(button);
      buttons.set(action, button);
    }
    const render = () => {
      const text = textFor(locales, locale);
      for (const [action, button] of buttons) {
        const label = button.lastElementChild;
        if (label) label.textContent = text[action];
        button.setAttribute("aria-label", text[action]);
        const disabled = action === "reload" && !reloadEnabled;
        button.disabled = disabled;
        button.setAttribute("aria-disabled", String(disabled));
        button.style.opacity = disabled ? "0.42" : "1";
        button.style.cursor = disabled ? "not-allowed" : "pointer";
      }
    };
    function show(nextLocale = locale) {
      if (disposed) throw new TypeError("application menu is disposed");
      locale = nextLocale;
      render();
      root.style.display = "block";
      return locale;
    }
    function hide() {
      if (!disposed) root.style.display = "none";
    }
    function setReloadEnabled(enabled) {
      if (disposed) throw new TypeError("application menu is disposed");
      if (typeof enabled !== "boolean") throw new TypeError("reload enabled state must be boolean");
      reloadEnabled = enabled;
      render();
    }
    function dispose() {
      if (disposed) return;
      disposed = true;
      root.remove();
      restoreMount();
    }
    render();
    return Object.freeze({ element: root, show, hide, setReloadEnabled, dispose });
  }
  const encoder = new TextEncoder();
  function requireStorage(value) {
    if (typeof value !== "object" || value === null || typeof value.getItem !== "function" || typeof value.setItem !== "function") {
      throw new TypeError("storage must provide the Web Storage contract");
    }
    return value;
  }
  function createDslStorage(options = {}) {
    const storage = requireStorage(options.storage ?? globalThis.localStorage);
    const namespace = options.namespace ?? "turbowarp-title-menu";
    if (!/^[A-Za-z0-9._:-]+$/.test(namespace)) {
      throw new TypeError("namespace must contain only URL-safe identifier characters");
    }
    const maxSourceBytes = options.maxSourceBytes ?? 1024 * 1024;
    if (!Number.isSafeInteger(maxSourceBytes) || maxSourceBytes < 1) {
      throw new TypeError("maxSourceBytes must be a positive safe integer");
    }
    const key = `${namespace}:dsl-source`;
    return Object.freeze({
      key,
      save(file) {
        if (typeof file.name !== "string" || file.name.length === 0) {
          throw new TypeError("DSL file name must be a non-empty string");
        }
        if (typeof file.source !== "string") throw new TypeError("DSL source must be a string");
        if (encoder.encode(file.source).byteLength > maxSourceBytes) {
          throw new TypeError("DSL source exceeds the configured byte limit");
        }
        const record = { name: file.name, source: file.source, savedAt: (/* @__PURE__ */ new Date()).toISOString() };
        storage.setItem(key, JSON.stringify(record));
        return record;
      },
      load() {
        const raw = storage.getItem(key);
        if (raw === null) return null;
        let parsed;
        try {
          parsed = JSON.parse(raw);
        } catch {
          storage.removeItem(key);
          return null;
        }
        if (typeof parsed.name !== "string" || typeof parsed.source !== "string" || typeof parsed.savedAt !== "string") {
          storage.removeItem(key);
          return null;
        }
        return { name: parsed.name, source: parsed.source, savedAt: parsed.savedAt };
      },
      clear() {
        storage.removeItem(key);
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
  const blocks = [{ "opcode": "showTitle", "blockType": "COMMAND", "text": "show title dialog", "description": "Shows the configured title dialog above the TurboWarp stage." }, { "opcode": "showMenu", "blockType": "COMMAND", "text": "show application menu", "description": "Shows the generic application menu above the TurboWarp stage." }, { "opcode": "hasSavedDsl", "blockType": "BOOLEAN", "text": "has saved DSL source?", "description": "Reports whether a DSL source has been saved in localStorage." }, { "opcode": "savedDslName", "blockType": "REPORTER", "text": "saved DSL file name", "description": "Returns the name of the DSL source currently saved in localStorage." }];
  const definitions = {
    extensionName,
    blocks
  };
  const blockDefinitions = definitions.blocks;
  function stageMount() {
    const vm = Scratch.vm;
    return vm.renderer?.canvas?.parentElement ?? globalThis.document?.body;
  }
  const defaultLocales = {
    en: {
      title: extensionConfig.name,
      author: `Author: ${extensionConfig.author}`,
      license: `License: ${extensionConfig.license}`,
      website: "Official Website",
      close: "Close",
      open: "Open DSL",
      reload: "Reload DSL",
      about: "About"
    },
    ja: {
      title: extensionConfig.name,
      author: `作者: ${extensionConfig.author}`,
      license: `ライセンス: ${extensionConfig.license}`,
      website: "公式Webサイト",
      close: "閉じる",
      open: "DSLを開く",
      reload: "DSLを再読み込み",
      about: "情報"
    }
  };
  class TurboWarpTitleMenuExtension {
    constructor() {
      this.titleDialog = null;
      this.applicationMenu = null;
      this.storage = null;
    }
    getInfo() {
      return {
        id: extensionConfig.id,
        name: Scratch.translate(definitions.extensionName),
        docsURI: extensionConfig.docsURI,
        blockIconURI: extensionConfig.blockIconURI,
        blocks: blockDefinitions.map((block) => this.toScratchBlock(block))
      };
    }
    showTitle() {
      this.ensureTitleDialog().show(this.browserLocale());
    }
    showMenu() {
      this.ensureApplicationMenu().show(this.browserLocale());
    }
    hasSavedDsl() {
      return this.ensureStorage().load() !== null;
    }
    savedDslName() {
      return this.ensureStorage().load()?.name ?? "";
    }
    ensureTitleDialog() {
      if (this.titleDialog) return this.titleDialog;
      const mount = stageMount();
      this.titleDialog = createTitleDialog({
        document: globalThis.document,
        ...mount ? { mount } : {},
        locales: defaultLocales,
        websiteUrl: extensionConfig.homepage
      });
      return this.titleDialog;
    }
    ensureApplicationMenu() {
      if (this.applicationMenu) return this.applicationMenu;
      const mount = stageMount();
      this.applicationMenu = createApplicationMenu({
        document: globalThis.document,
        ...mount ? { mount } : {},
        locales: defaultLocales,
        reloadEnabled: this.hasSavedDsl(),
        onOpen: () => this.openDslFilePicker(),
        onReload: () => this.reloadSavedDsl(),
        onAbout: () => this.showTitle(),
        onClose: () => this.applicationMenu?.hide()
      });
      return this.applicationMenu;
    }
    ensureStorage() {
      this.storage ?? (this.storage = createDslStorage({ namespace: extensionConfig.id }));
      return this.storage;
    }
    async openDslFilePicker() {
      const document = globalThis.document;
      if (!document) throw new TypeError("document is required to open a DSL file");
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".txt,.yaml,.yml,.json,.k4,.kamishibai";
      const chosen = await new Promise((resolve) => {
        input.addEventListener(
          "change",
          () => {
            resolve(input.files?.[0] ?? null);
          },
          { once: true }
        );
        input.click();
      });
      if (!chosen) return;
      const source = await chosen.text();
      const record = this.ensureStorage().save({ name: chosen.name, source });
      this.applicationMenu?.setReloadEnabled(true);
      dispatchDslSourceEvent(dslOpenEventName, record);
    }
    reloadSavedDsl() {
      const record = this.ensureStorage().load();
      if (!record) {
        this.applicationMenu?.setReloadEnabled(false);
        return;
      }
      dispatchDslSourceEvent(dslReloadEventName, record);
    }
    browserLocale() {
      const language = globalThis.navigator?.language ?? "";
      return /^ja(?:-|$)/i.test(language) ? "ja" : "en";
    }
    toScratchBlock(block) {
      return {
        opcode: block.opcode,
        blockType: Scratch.BlockType[block.blockType],
        text: Scratch.translate(block.text),
        arguments: Object.fromEntries(
          Object.entries(block.arguments ?? {}).map(([name, argument]) => [
            name,
            {
              type: Scratch.ArgumentType[argument.type],
              defaultValue: argument.defaultValue
            }
          ])
        )
      };
    }
  }
  const publicApi = Object.freeze({
    createApplicationMenu,
    createDslStorage,
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
