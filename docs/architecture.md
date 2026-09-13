# Architecture

[日本語](architecture.ja.md)

## Build outputs

The project keeps runtime behavior and compatibility metadata separate while generating both from
the same checked-in source definitions.

```text
src/index.ts + src/extension.ts
  -> vite-plugin-turbowarp-extension
  -> dist/<extension>.js

src/config.ts + src/block-definitions.json
  -> extension-api-manifest Vite plugin
  -> dist/extension-manifest.json
```

The manifest plugin runs in Vite's post-build phase. This preserves the JavaScript plugin's
single-output validation and adds the manifest only after the TurboWarp bundle is complete.

## Extension API manifest v1

`schemas/extension-manifest.schema.json` is the normative JSON Schema. `formatVersion` is `1` and
must change when an incompatible manifest shape is introduced.

The v1 contract contains:

- the TurboWarp extension ID;
- each block opcode and block type;
- each argument ID, argument type, and optional menu reference;
- each menu ID and whether it accepts reporter blocks.

Blocks, arguments, and menus are sorted by their identifiers before serialization. Text,
descriptions, default values, and static menu items are intentionally excluded because they do not
identify saved-project API references. A compatibility checker can therefore distinguish API
changes from documentation or localization changes.

## Drift detection

`dist/` is committed as a release artifact. `npm run check:dist` rebuilds both files and fails when
Git reports any modified, deleted, or untracked file below `dist/`. This catches manifest and bundle
drift in local checks and CI.

## Layering against turbowarp-app-shell

`@kubohiroya/turbowarp-app-shell` owns the DOM mechanics and knows no Scratch API and no application
vocabulary. This package is the layer above it: a finished TurboWarp extension that composes those
primitives into a title screen, an application menu, and DSL file storage, and publishes them as
blocks.

The application menu is `createAppShellApplicationMenu` used directly, not a second implementation
of the same control. Its actions are this extension's own vocabulary, so a host project that needs
different actions composes the same primitive through the composition API instead of inheriting a
fixed set. The title dialog stays local because app-shell has no about-panel primitive: it presents
title, author, license, and website together rather than a website/close control pair.

## DSL file storage

`src/dsl-store.ts` keeps many DSL files in IndexedDB. The database holds a `files` store keyed by a
generated id with a unique index on `name`, and a `meta` store holding the last opened id.

Names are unique so a listing stays meaningful and re-adding the same file updates it in place
instead of accumulating duplicates. The store never evicts a record: a file over the byte limit, or
one past the file-count limit, is refused with a typed `DslStoreError` so the operator learns why
rather than losing an earlier DSL silently. Sorting happens in memory after reading the summaries,
which keeps the index set small and the order stable through a name tiebreak.

`src/dsl-files-dialog.ts` owns presentation and interaction state only: the sort order, the row
being renamed, and the row awaiting delete confirmation. Every storage operation is a caller
supplied callback, so the dialog works against the IndexedDB store, a test double, or a future
file-system backend without change.
