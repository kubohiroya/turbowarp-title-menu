# TurboWarp Title Menu

[日本語](README.ja.md)

Reusable title, application menu, and DSL source storage controls for TurboWarp extensions and packaged projects.

**User guide:** [English](https://kubohiroya.github.io/turbowarp-title-menu/)

## What it does

- Shows a reusable title dialog with title, author, license, official website, language, and close controls.
- Shows a reusable stage-mounted application menu for opening a DSL file, reloading the saved DSL source, showing about information, and closing the menu.
- Saves and reloads a selected DSL source through `localStorage` without tying the mechanism to TM Kamishibai.
- Exposes a small Composition API for projects that want to wire the controls into their own runtime.

## Documentation and block icon

This extension publishes its English user documentation with GitHub Pages.

- `docsURI` points to the English GitHub Pages documentation: `https://kubohiroya.github.io/turbowarp-title-menu/`.
- `blockIconURI` is a self-contained SVG encoded as `data:image/svg+xml;base64,...`.
- The block icon represents a small title/menu panel.

## Requirements and safety

- TurboWarp Desktop, TurboWarp Web, or a packaged TurboWarp project that allows custom extensions.
- Browser DOM access for the title and menu overlays.
- Browser `localStorage` for DSL source persistence.
- Unsandboxed extension mode.

> [!IMPORTANT]
> This extension must run without the sandbox because it creates DOM controls above the stage and uses browser storage. Load unsandboxed extension code only from a source you trust.

## Installation

### Ready-to-use JavaScript

1. Download [`dist/turbowarp-title-menu.js`](dist/turbowarp-title-menu.js?raw=1).
2. Open **Extensions** in TurboWarp.
3. Choose **Custom Extension** and load the file.
4. Enable **Run extension without sandbox**.

The reviewed JavaScript build is committed to this repository, so users do not need Node.js to install the extension.

### npm package

Install an exact version that you have reviewed:

```bash
pnpm add --save-exact @kubohiroya/turbowarp-title-menu@0.1.0
```

Load the standalone bundle from:

```text
node_modules/@kubohiroya/turbowarp-title-menu/dist/turbowarp-title-menu.js
```

A version-pinned CDN URL is:

```text
https://cdn.jsdelivr.net/npm/@kubohiroya/turbowarp-title-menu@0.1.0/dist/turbowarp-title-menu.js
```

## Quick start

1. Load `dist/turbowarp-title-menu.js` as an unsandboxed custom extension.
2. Run `show title dialog` immediately after startup.
3. Use `show application menu` when the project should expose DSL file load and reload actions.

```text
when green flag clicked
show title dialog
```

## Block reference

The block reference is generated from [`src/block-definitions.json`](src/block-definitions.json). Do not edit the generated section manually.

<!-- BEGIN GENERATED BLOCKS -->

### `show title dialog`

Shows the configured title dialog above the TurboWarp stage.

| Property | Value |
|---|---|
| Type | Command |
| Opcode | `showTitle` |

### `show application menu`

Shows the generic application menu above the TurboWarp stage.

| Property | Value |
|---|---|
| Type | Command |
| Opcode | `showMenu` |

### `has saved DSL source?`

Reports whether a DSL source has been saved in localStorage.

| Property | Value |
|---|---|
| Type | Boolean |
| Opcode | `hasSavedDsl` |

### `saved DSL file name`

Returns the name of the DSL source currently saved in localStorage.

| Property | Value |
|---|---|
| Type | Reporter |
| Opcode | `savedDslName` |

<!-- END GENERATED BLOCKS -->

## Important behavior

| Situation | Behavior |
|---|---|
| Startup title | `show title dialog` mounts a dialog over the stage and keeps Scratch sprites untouched. |
| Official website | The title dialog opens the configured website URL in a new browser tab. |
| DSL file open | The application menu opens a browser file picker and stores the selected DSL source in `localStorage`. |
| DSL reload | The reload action is disabled until a DSL source has been saved. |
| Project stop | The controls remain explicit UI overlays; consumers can dispose Composition API instances when their runtime ends. |

## Composition API

Importing the Composition API gives host projects direct control over DOM mounting, callbacks, locales, storage namespace, and DSL source events.

```ts
import {
  createApplicationMenu,
  createDslStorage,
  createTitleDialog,
  dslReloadEventName
} from '@kubohiroya/turbowarp-title-menu';

const storage = createDslStorage({namespace: 'my-runtime'});
const title = createTitleDialog({
  mount: stageContainer,
  locales: {
    en: {
      title: 'My Story',
      author: 'Author: Example',
      license: 'License: MPL-2.0',
      website: 'Official Website',
      close: 'Close'
    }
  },
  websiteUrl: 'https://example.com'
});

const menu = createApplicationMenu({
  mount: stageContainer,
  locales: {
    en: {open: 'Open DSL', reload: 'Reload DSL', about: 'About', close: 'Close'}
  },
  reloadEnabled: storage.load() !== null,
  onReload() {
    const record = storage.load();
    if (record) window.dispatchEvent(new CustomEvent(dslReloadEventName, {detail: {record}}));
  }
});

title.show('en');
menu.show('en');
```

## Compatibility

| Identifier | Value | Stability |
|---|---|---|
| Product name | `TurboWarp Title Menu` | Human-facing |
| Repository | `kubohiroya/turbowarp-title-menu` | Current source location |
| npm package | `@kubohiroya/turbowarp-title-menu` | Public package contract |
| Extension ID | `kubohiroyaturbowarptitlemenu` | Stored in SB3; migration required to change |

## Development

Use Node.js 22 or later and the pnpm version declared by `packageManager`.

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm run check
```

## Release

1. Update the version in `package.json`.
2. Run `pnpm run check`.
3. Merge the release PR.
4. Create tag `v<version>` on the verified commit.
5. Publish the same version to npm when applicable.
6. Verify GitHub Release, npm tarball, GitHub Pages, `docsURI`, block icon, and CDN artifacts.

## License

[Mozilla Public License 2.0](LICENSE) (SPDX: `MPL-2.0`).
