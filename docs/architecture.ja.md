# アーキテクチャ

[English](architecture.md)

## ビルド出力

このプロジェクトは実行時の動作と互換性メタデータを分離し、リポジトリに保存された同じソース定義から両方を生成します。

```text
src/index.ts + src/extension.ts
  -> vite-plugin-turbowarp-extension
  -> dist/<extension>.js

src/config.ts + src/block-definitions.json
  -> extension-api-manifest Viteプラグイン
  -> dist/extension-manifest.json
```

manifestプラグインはViteのビルド後フェーズで実行されます。これにより、JavaScriptプラグインの単一出力検証を維持しながら、TurboWarpバンドルの完成後にだけmanifestを追加します。

## 拡張機能API manifest v1

`schemas/extension-manifest.schema.json`が規範となるJSON Schemaです。`formatVersion`は`1`で、互換性のないmanifest形式を導入するときに変更する必要があります。

v1契約は次の情報を含みます。

- TurboWarp拡張機能のID
- 各ブロックのopcodeとブロック種類
- 各引数のID、引数種類、任意のメニュー参照
- 各メニューのIDとReporterブロックを受け付けるかどうか

ブロック、引数、メニューは、シリアライズ前に識別子で並べ替えられます。テキスト、説明、既定値、静的メニュー項目は、保存済みプロジェクトのAPI参照を識別しないため、意図的に除外しています。そのため互換性チェッカーは、API変更とドキュメントまたはローカライズの変更を区別できます。

## 差分の検出

`dist/`はリリース成果物としてコミットされます。`npm run check:dist`は両方のファイルを再ビルドし、`dist/`配下に変更、削除、未追跡ファイルがある場合に失敗します。これにより、ローカル検証とCIの両方でmanifestとバンドルの差分を検出できます。

## turbowarp-app-shellとの層の分け方

`@kubohiroya/turbowarp-app-shell`はDOMの機構を所有し、Scratch APIもアプリの語彙も持ちません。
本パッケージはその上の層で、primitiveを合成してタイトル画面、アプリケーションメニュー、DSL
ファイル保管を作り、blockとして公開する完成した拡張です。

アプリケーションメニューは`createAppShellApplicationMenu`をそのまま使っており、同じ部品の二重
実装ではありません。項目は本拡張の語彙なので、別の項目が必要なホストはcomposition API経由で同じ
primitiveを自分で合成します。タイトルダイアログだけは本パッケージが持ちます。app-shellにはabout
パネルのprimitiveがなく、こちらはタイトル・作者・ライセンス・Webサイトをまとめて表示するため、
website/closeのボタン対とは別物だからです。

## DSLファイルの保管

`src/dsl-store.ts`は複数のDSLファイルをIndexedDBに保管します。データベースは、生成したidをkeyに
持ち`name`に一意indexを張った`files` storeと、最後に開いたidを持つ`meta` storeで構成します。

名前を一意にしているのは、一覧の意味を保ち、同じファイルを再度追加したときに重複を増やさず上書き
するためです。storeが自分でレコードを消すことはありません。上限を超えるファイルや、件数上限を超える
追加は、型付きの`DslStoreError`で拒否します。黙って以前のDSLを失うより、理由を運用者に伝えることを
優先します。並べ替えはsummaryを読んだ後にメモリ上で行い、indexを増やさず、名前による同点処理で
順序を安定させます。

`src/dsl-files-dialog.ts`は表示と操作の状態だけを持ちます。並べ替え順、名前を編集中の行、削除の
確認待ちの行の3つです。保管処理はすべて呼び出し側のコールバックなので、IndexedDBのstoreでも、
テスト用の代替でも、将来のファイルシステム実装でも、ダイアログを変えずに使えます。
