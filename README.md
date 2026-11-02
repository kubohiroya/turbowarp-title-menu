# TurboWarp Title Menu

<img src="assets/block-icon.svg" alt="" width="48" height="48">

English | [日本語](README.ja.md)

Reusable title, application menu, and DSL source storage controls for TurboWarp extensions and packaged projects.

**User guide:** [English](https://kubohiroya.github.io/turbowarp-title-menu/)

## Minimal demo

[Open in TurboWarp Editor](https://turbowarp.org/editor?project_url=https%3A%2F%2Fkubohiroya.github.io%2Fturbowarp-title-menu%2Fsamples%2Fchoose-menu-action.sb3) · [Download SB3](https://kubohiroya.github.io/turbowarp-title-menu/samples/choose-menu-action.sb3)

Click the green flag, then choose **Hello**; `Selected action` becomes `Hello`. Choose **Close** to close the menu.

In the official TurboWarp Editor, enable **Run extension without sandbox** and choose **Allow**. The SB3 embeds this repository’s distributed JavaScript. App Shell is bundled; no additional host is required.

## What it does

- Shows a reusable title dialog with title, author, license, official website, language, and close controls.
- Shows a stage-mounted application menu built on the shared `@kubohiroya/turbowarp-app-shell` primitive. A project defines its own actions from blocks and reacts to them with a hat, so the menu is not limited to a fixed set.
- Shows a DSL file manager that adds, opens, renames, and deletes stored files, and sorts them by name, update time, or size.
- Shows an extension cache manager that lists the extension bytes the loader cached, per project and for the shared catalog, and releases them.
- Stores many DSL files in IndexedDB without tying the mechanism to TM Kamishibai.
- Exposes a small Composition API for projects that want to wire the controls into their own runtime.

## Documentation and block icon

This extension publishes its English user documentation with GitHub Pages.

- `docsURI` points to the English GitHub Pages documentation: `https://kubohiroya.github.io/turbowarp-title-menu/`.
- `blockIconURI` is a self-contained SVG encoded as `data:image/svg+xml;base64,...`.
- The block icon represents a small title/menu panel.

## Requirements and safety

- TurboWarp Desktop, TurboWarp Web, or a packaged TurboWarp project that allows custom extensions.
- Browser DOM access for the title and menu overlays.
- Browser IndexedDB for DSL source persistence.
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
pnpm add --save-exact @kubohiroya/turbowarp-title-menu@0.5.0
```

Load the standalone bundle from:

```text
node_modules/@kubohiroya/turbowarp-title-menu/dist/turbowarp-title-menu.js
```

A version-pinned CDN URL is:

```text
https://cdn.jsdelivr.net/npm/@kubohiroya/turbowarp-title-menu@0.5.0/dist/turbowarp-title-menu.js
```

## Quick start

1. Load `dist/turbowarp-title-menu.js` as an unsandboxed custom extension.
2. Run `show title dialog` immediately after startup.
3. Use `show application menu`, or `show DSL file manager` directly, when the project should expose DSL file actions.

The menu starts with four built-in actions. Replace them with the project's own vocabulary when the
built-in ones do not fit:

```text
when green flag clicked
clear app menu actions
add app menu action [pair] labelled [Pair with fusion PC]
add app menu action [calibrate] labelled [Calibrate camera]
show application menu

when app menu action [pair v] selected
broadcast [start pairing v]
```

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

Shows the application menu above the TurboWarp stage.

| Property | Value |
|---|---|
| Type | Command |
| Opcode | `showMenu` |

### `add app menu action [ACTION] labelled [LABEL]`

Adds an application menu action this project owns, or relabels one it already added.

| Property | Value |
|---|---|
| Type | Command |
| Opcode | `addAppMenuAction` |
| `ACTION` | String, default: `start` |
| `LABEL` | String, default: `Start` |

### `clear app menu actions`

Removes every application menu action, including the built-in ones, so a project can define its own set.

| Property | Value |
|---|---|
| Type | Command |
| Opcode | `clearAppMenuActions` |

### `set app menu action [ACTION] enabled [ENABLED]`

Enables or disables one application menu action.

| Property | Value |
|---|---|
| Type | Command |
| Opcode | `setAppMenuActionEnabled` |
| `ACTION` | String, default: `undefined` |
| `ENABLED` | Boolean, default: `true` |

### `when app menu action [ACTION] selected`

Runs when the operator selects the named application menu action.

| Property | Value |
|---|---|
| Type | Hat |
| Opcode | `whenAppMenuActionSelected` |
| `ACTION` | String, default: `undefined` |

### `show DSL file manager`

Shows the dialog that adds, opens, renames, deletes, and sorts stored DSL files.

| Property | Value |
|---|---|
| Type | Command |
| Opcode | `showDslFiles` |

### `when a DSL source is opened`

Runs after the operator opens a stored DSL file, or after the opened source is announced again.

| Property | Value |
|---|---|
| Type | Hat |
| Opcode | `whenDslSourceOpened` |

### `reload the opened DSL source`

Announces the currently opened DSL source again without showing a dialog.

| Property | Value |
|---|---|
| Type | Command |
| Opcode | `reloadOpenedDsl` |

### `opened DSL file name`

Returns the name of the DSL file that is currently open, or an empty string.

| Property | Value |
|---|---|
| Type | Reporter |
| Opcode | `openedDslName` |

### `opened DSL source`

Returns the text of the DSL file that is currently open, or an empty string.

| Property | Value |
|---|---|
| Type | Reporter |
| Opcode | `openedDslSource` |

### `has a saved DSL file?`

Reports whether at least one DSL file is stored in IndexedDB.

| Property | Value |
|---|---|
| Type | Boolean |
| Opcode | `hasSavedDsl` |

### `saved DSL file count`

Returns how many DSL files are stored in IndexedDB.

| Property | Value |
|---|---|
| Type | Reporter |
| Opcode | `savedDslCount` |

### `last DSL storage error`

Returns the most recent DSL storage failure in the interface language, or an empty string.

| Property | Value |
|---|---|
| Type | Reporter |
| Opcode | `lastDslError` |

### `show extension cache manager`

Shows the dialog that lists the cached extension bytes per project and releases them.

| Property | Value |
|---|---|
| Type | Command |
| Opcode | `showExtensionCache` |

### `label cached project [URI] as [TITLE]`

Records a readable title to show beside a project URI in the extension cache manager. A project URI is deliberately opaque, so without a title the rows cannot be told apart; the title is self-declared and is never checked against the URI.

| Property | Value |
|---|---|
| Type | Command |
| Opcode | `setCachedProjectTitle` |
| `URI` | String, default: `https://example.com/turbowarp-plus-projects/ab/cd/project` |
| `TITLE` | String, default: `My project` |

<!-- END GENERATED BLOCKS -->

## Important behavior

| Situation | Behavior |
|---|---|
| Startup title | `show title dialog` mounts a dialog over the stage and keeps Scratch sprites untouched. |
| Official website | The title dialog opens the configured website URL in a new browser tab. |
| Built-in menu actions | `files`, `cache`, `reload`, `about`, and `close` are pre-registered and keep their own behavior. They also start the hat, and `clear app menu actions` removes them. |
| Changing the menu | Adding or clearing an action rebuilds the menu. A menu that was on screen is shown again rather than disappearing. |
| An empty menu | `show application menu` does nothing while no action is registered, and clearing every action closes an open menu. The underlying primitive refuses to build a menu with no actions, so a project that clears the set before installing its own is not interrupted. |
| Adding a DSL file | `Add file` opens a browser file picker and stores the chosen source. It does not open the file; the operator presses `Open` when the project should use it. |
| Renaming | Names are unique. Renaming a file to a name another file already uses fails and leaves both files unchanged. |
| Deleting | Deleting asks for a second confirming click, and deleting the open file clears the opened source. |
| Storage limits | A file over 1 MiB, or a 65th file, is refused with a message. The store never evicts a file on its own. |
| Storage failures | Every failure is shown in the dialog and reported by `last DSL storage error`; a script is never interrupted by a thrown storage error. |
| Releasing a cached project | Cached entries are addressed by their contents, so a project claims entries rather than owning them. Releasing a project drops the digests that project names, which can take bytes another project would have reused. Nothing is lost for good: whatever is still needed is downloaded again the next time a project is opened. |
| Project URIs in the cache | A project URI is what that project called itself and is not verified, so a project can file its bytes under another project's URI. Only this list is misled by that; the loader re-checks every digest when it uses it, so the wrong bytes can never be handed over. The dialog states both facts on screen. |
| Unreachable project URIs | A project URI serves nothing until its author publishes, so an unpublished project answers 404. The dialog never fetches a URI and never treats reachability as a reason to release anything, because that would clear the cache of every project still being written. |
| Project titles | The cache has no titles, and a project URI is deliberately opaque so that renaming a project does not rename its address. `label cached project [URI] as [TITLE]` records a readable name to show beside the URI; a row with no recorded title says so. |
| The shared cache bucket | Bytes the catalog pinned belong to no one project, so they are listed under their own row rather than charged to whichever project fetched them first. That row can be released like any other. |
| Cache failures | A listing that fails shows the failure instead of an empty list, because "nothing is cached" and "the cache could not be read" are different claims. Failures are also reported by `last DSL storage error`. |
| Project stop | The controls remain explicit UI overlays; consumers can dispose Composition API instances when their runtime ends. |

## Composition API

Importing the Composition API gives host projects direct control over DOM mounting, callbacks,
locales, the storage database, and DSL source events. The application menu is re-exported from
`@kubohiroya/turbowarp-app-shell`, so a host owns its own action vocabulary.

```ts
import {
  createApplicationMenu,
  createDslFilesDialog,
  createDslStore,
  createTitleDialog,
  dslReloadEventName
} from '@kubohiroya/turbowarp-title-menu';

const store = createDslStore({databaseName: 'my-runtime'});

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

const files = createDslFilesDialog({
  mount: stageContainer,
  locales: {en: myFileManagerLabels},
  list: (sort) => store.list(sort),
  onAdd: () => addFileThroughMyOwnPicker(),
  onOpen: async (id) => {
    const record = await store.get(id);
    if (record === null) return;
    await store.markOpened(id);
    window.dispatchEvent(new CustomEvent(dslReloadEventName, {detail: {record}}));
  },
  onRename: (id, name) => store.rename(id, name),
  onRemove: (id) => store.remove(id)
});

const menu = createApplicationMenu({
  document,
  mount: stageContainer,
  actions: [
    {id: 'files', labels: {en: 'DSL files'}, onSelect: () => files.show('en')},
    {id: 'about', labels: {en: 'About'}, onSelect: () => title.show('en')}
  ]
});

menu.show('en');
```

The extension cache manager is composed the same way. The cache itself is never opened by name
here: every operation goes through `@kubohiroya/turbowarp-extension-loader/indexeddb-cache`, so the
loader stays the only package that knows where those bytes live and what shape they are in.

```ts
import {
  createExtensionCache,
  createExtensionCacheDialog
} from '@kubohiroya/turbowarp-title-menu';

// The host knows its projects' titles; the cache only knows their URIs.
const titles = new Map<string, string>();

const cache = createExtensionCache({titleFor: (uri) => titles.get(uri)});

const cacheManager = createExtensionCacheDialog({
  mount: stageContainer,
  locales: {en: myCacheLabels},
  listProjects: () => cache.listProjects(),
  listDigests: (bucket) => cache.listDigests(bucket),
  totals: () => cache.totals(),
  onReleaseProject: (bucket) => cache.releaseProject(bucket),
  onReleaseDigest: (bucket, key) => cache.releaseDigests(bucket, [key])
});

await cacheManager.show('en');
```

## Compatibility

| Identifier | Value | Stability |
|---|---|---|
| Product name | `TurboWarp Title Menu` | Human-facing |
| Repository | `kubohiroya/turbowarp-title-menu` | Current source location |
| npm package | `@kubohiroya/turbowarp-title-menu` | Public package contract |
| Extension ID | `kubohiroyaturbowarptitlemenu` | Stored in SB3; migration required to change |

## Development

Use Node.js 24 or later and the pnpm version declared by `packageManager`.

```bash
npm install --global corepack@latest
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
