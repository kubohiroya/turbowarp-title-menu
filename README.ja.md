# TurboWarp Title Menu

[English](README.md)

TurboWarp拡張やPackager実行環境で使える、汎用のタイトル表示、アプリケーションメニュー、DSLファイル保管機構です。

## 利用者ガイド

英語ドキュメント: [https://kubohiroya.github.io/turbowarp-title-menu/](https://kubohiroya.github.io/turbowarp-title-menu/)

## できること

- 起動直後のタイトル表示として、タイトル、作者名、ライセンス、公式Webサイト、閉じるボタンを表示します。
- ステージ上にアプリケーションメニューを表示します。共有primitiveの`@kubohiroya/turbowarp-app-shell`の上に作っており、項目はblockから定義してhatで受けられるため、固定の項目に縛られません。
- DSLファイル管理ダイアログで、追加、開く、名前の変更、個別削除ができ、名前・更新日時・サイズで並べ替えできます。
- 複数のDSLファイルをIndexedDBに保管します。TM Kamishibai専用ではありません。
- ホスト側ランタイムから直接組み込める Composition API を提供します。

## 要件と安全性

- TurboWarp Desktop、TurboWarp Web、またはCustom Extensionを許可したTurboWarp Packagerプロジェクト
- タイトル/メニュー表示用のブラウザDOM
- DSLファイル保管用のブラウザIndexedDB
- unsandboxed extension mode

> [!IMPORTANT]
> この拡張はステージ上にDOM UIを作成し、ブラウザストレージを使うため、sandboxなしで実行する必要があります。信頼できる生成済み拡張コードだけを読み込んでください。

IndexedDBはoriginごとに分かれます。TurboWarp Web、TurboWarp Desktop、Packagerで生成したアプリは
それぞれ別の保存領域を持ち、内容は移動しません。ブラウザのデータを消せば消えます。保管したDSLの
バックアップが必要な場合は、元のファイルを別途保存してください。

## インストール

```bash
pnpm add --save-exact @kubohiroya/turbowarp-title-menu@0.2.2
```

TurboWarpでは `dist/turbowarp-title-menu.js` をCustom Extensionとして読み込み、sandboxなしの実行を許可します。

## クイックスタート

1. `dist/turbowarp-title-menu.js` をCustom Extensionとして読み込みます。
2. 起動直後に `show title dialog` を実行します。
3. DSLファイルを扱う場面で `show application menu`、または直接 `show DSL file manager` を実行します。

```text
when green flag clicked
show title dialog
```

メニューは4つの組み込み項目から始まります。合わない場合は、プロジェクト自身の語彙に置き換えます。

```text
when green flag clicked
clear app menu actions
add app menu action [pair] labelled [統合PCとつなぐ]
add app menu action [calibrate] labelled [カメラを校正する]
show application menu

when app menu action [pair v] selected
broadcast [start pairing v]
```

DSLを読み込んだ後の処理は `when a DSL source is opened` から始めます。

```text
when a DSL source is opened
set [source v] to (opened DSL source)
```

## ブロック参照

### `show title dialog`

TurboWarpステージ上に設定済みタイトルダイアログを表示します。

| Property | Value |
|---|---|
| Type | Command |
| Opcode | `showTitle` |

### `show application menu`

TurboWarpステージ上にアプリケーションメニューを表示します。

| Property | Value |
|---|---|
| Type | Command |
| Opcode | `showMenu` |

### `add app menu action [ACTION] labelled [LABEL]`

このプロジェクトが持つメニュー項目を追加します。すでに追加済みのIDなら表示名を変更します。

| Property | Value |
|---|---|
| Type | Command |
| Opcode | `addAppMenuAction` |

### `clear app menu actions`

組み込みを含め、すべてのメニュー項目を削除します。プロジェクト自身の項目だけにしたいときに使います。

| Property | Value |
|---|---|
| Type | Command |
| Opcode | `clearAppMenuActions` |

### `set app menu action [ACTION] enabled [ENABLED]`

メニュー項目の1つを有効／無効にします。

| Property | Value |
|---|---|
| Type | Command |
| Opcode | `setAppMenuActionEnabled` |

### `when app menu action [ACTION] selected`

運用者がそのメニュー項目を選んだときに実行されます。

| Property | Value |
|---|---|
| Type | Hat |
| Opcode | `whenAppMenuActionSelected` |

### `show DSL file manager`

保管したDSLファイルの追加、開く、名前の変更、削除、並べ替えを行うダイアログを表示します。

| Property | Value |
|---|---|
| Type | Command |
| Opcode | `showDslFiles` |

### `when a DSL source is opened`

運用者がDSLファイルを開いた後、または開いているDSLを再通知した後に実行されます。

| Property | Value |
|---|---|
| Type | Hat |
| Opcode | `whenDslSourceOpened` |

### `reload the opened DSL source`

ダイアログを出さずに、現在開いているDSLをもう一度通知します。

| Property | Value |
|---|---|
| Type | Command |
| Opcode | `reloadOpenedDsl` |

### `opened DSL file name`

現在開いているDSLファイルの名前を返します。開いていなければ空文字列です。

| Property | Value |
|---|---|
| Type | Reporter |
| Opcode | `openedDslName` |

### `opened DSL source`

現在開いているDSLファイルの内容を返します。開いていなければ空文字列です。

| Property | Value |
|---|---|
| Type | Reporter |
| Opcode | `openedDslSource` |

### `has a saved DSL file?`

IndexedDBにDSLファイルが1件以上保管されているかを返します。

| Property | Value |
|---|---|
| Type | Boolean |
| Opcode | `hasSavedDsl` |

### `saved DSL file count`

IndexedDBに保管しているDSLファイルの件数を返します。

| Property | Value |
|---|---|
| Type | Reporter |
| Opcode | `savedDslCount` |

### `last DSL storage error`

直近の保管処理の失敗を、表示言語の文章で返します。失敗していなければ空文字列です。

| Property | Value |
|---|---|
| Type | Reporter |
| Opcode | `lastDslError` |

## 動作の要点

| 場面 | 動作 |
|---|---|
| 組み込みのメニュー項目 | `files`／`reload`／`about`／`close` は最初から登録されており、それぞれの動作を保ちます。同時にhatも発火します。`clear app menu actions` で外せます。 |
| メニューの変更 | 項目の追加や消去でメニューを作り直します。表示中だった場合は消えずに再表示します。 |
| 項目が0件のとき | 1件も登録されていない状態では `show application menu` は何もせず、すべて消すと表示中のメニューは閉じます。土台のprimitiveが0件のメニューを作れないため、自分の項目を入れる前に全消しするプロジェクトが途中で止まらないようにしています。 |
| ファイルの追加 | 「ファイルを追加」はファイル選択ダイアログを開き、選ばれた内容を保管します。開きはしません。使うときは「開く」を押します。 |
| 名前の変更 | 名前は一意です。他のファイルと同じ名前にしようとすると失敗し、どちらのファイルも変わりません。 |
| 削除 | 削除には確認のためもう一度クリックが必要です。開いているファイルを削除すると、開いている内容も解除されます。 |
| 保管の上限 | 1 MiBを超えるファイル、および65件目は、理由を表示して拒否します。古いファイルを自動で消すことはしません。 |
| 失敗時 | 失敗はダイアログに表示し、`last DSL storage error` からも読めます。保管の失敗でスクリプトが止まることはありません。 |

## Composition API

ホスト側からDOMマウント先、locale、コールバック、保管先データベースを明示して組み込めます。
アプリケーションメニューは`@kubohiroya/turbowarp-app-shell`の再エクスポートなので、ホストが
自分の操作項目を定義できます。

```ts
import {
  createApplicationMenu,
  createDslFilesDialog,
  createDslStore,
  createTitleDialog
} from '@kubohiroya/turbowarp-title-menu';
```

詳しい例は[英語版README](README.md#composition-api)を参照してください。

## 開発

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm run check
```

## ライセンス

[Mozilla Public License 2.0](LICENSE) (SPDX: `MPL-2.0`)
