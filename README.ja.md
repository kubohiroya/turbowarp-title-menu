# TurboWarp Title Menu

[English](README.md)

TurboWarp拡張やPackager実行環境で使える、汎用のタイトル表示、アプリケーションメニュー、DSLソース保存機構です。

## 利用者ガイド

英語ドキュメント: [https://kubohiroya.github.io/turbowarp-title-menu/](https://kubohiroya.github.io/turbowarp-title-menu/)

## できること

- 起動直後のタイトル表示として、タイトル、作者名、ライセンス、公式Webサイト、言語切替、閉じるボタンを表示します。
- ステージ上に、DSLファイルを開く、保存済みDSLを再読み込みする、情報を表示する、閉じる、という汎用メニューを表示します。
- DSLソースを `localStorage` に保存し、TM Kamishibai専用ではない形で再読み込みできます。
- ホスト側ランタイムから直接組み込める Composition API を提供します。

## 要件と安全性

- TurboWarp Desktop、TurboWarp Web、またはCustom Extensionを許可したTurboWarp Packagerプロジェクト
- タイトル/メニュー表示用のブラウザDOM
- DSLソース保存用の `localStorage`
- unsandboxed extension mode

> [!IMPORTANT]
> この拡張はステージ上にDOM UIを作成し、ブラウザストレージを使うため、sandboxなしで実行する必要があります。信頼できる生成済み拡張コードだけを読み込んでください。

## インストール

```bash
pnpm add --save-exact @kubohiroya/turbowarp-title-menu@0.1.0
```

TurboWarpでは `dist/turbowarp-title-menu.js` をCustom Extensionとして読み込み、sandboxなしの実行を許可します。

## クイックスタート

1. `dist/turbowarp-title-menu.js` をCustom Extensionとして読み込みます。
2. 起動直後に `show title dialog` を実行します。
3. DSLファイル選択や再読み込みが必要な場面で `show application menu` を実行します。

```text
when green flag clicked
show title dialog
```

## ブロック参照

### `show title dialog`

TurboWarpステージ上に設定済みタイトルダイアログを表示します。

| Property | Value |
|---|---|
| Type | Command |
| Opcode | `showTitle` |

### `show application menu`

TurboWarpステージ上に汎用アプリケーションメニューを表示します。

| Property | Value |
|---|---|
| Type | Command |
| Opcode | `showMenu` |

### `has saved DSL source?`

DSLソースが `localStorage` に保存されているかを返します。

| Property | Value |
|---|---|
| Type | Boolean |
| Opcode | `hasSavedDsl` |

### `saved DSL file name`

現在 `localStorage` に保存されているDSLソースのファイル名を返します。

| Property | Value |
|---|---|
| Type | Reporter |
| Opcode | `savedDslName` |

## Composition API

ホスト側からDOMマウント先、locale、コールバック、storage namespaceを明示して組み込めます。

```ts
import {createApplicationMenu, createDslStorage, createTitleDialog} from '@kubohiroya/turbowarp-title-menu';
```

## 開発

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm run check
```

## ライセンス

[Mozilla Public License 2.0](LICENSE) (SPDX: `MPL-2.0`)
