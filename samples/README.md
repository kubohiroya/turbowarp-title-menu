# 最小デモ

[Editorで開く](https://turbowarp.org/editor?project_url=https%3A%2F%2Fkubohiroya.github.io%2Fturbowarp-title-menu%2Fsamples%2Fchoose-menu-action.sb3) · [SB3をダウンロード](https://kubohiroya.github.io/turbowarp-title-menu/samples/choose-menu-action.sb3)

緑の旗を押し、メニューの **Hello** を選択すると `Selected action` が `Hello` になります。**Close** を選ぶとメニューを閉じます。

公式TurboWarp Editorでカスタム拡張の確認画面の **Run extension without sandbox** をチェックし、**Allow** を選択してください。SB3はこのリポジトリの配布JSを内包します。 app-shellは配布JSに含まれ、追加のホストは不要です。

`choose-menu-action/project.json` とSVGが編集用ソースです。`samples/manifest.json` が配布設定と期待値です。編集後はNode.js 26で `node scripts/build-samples.mjs`、`node scripts/build-samples.mjs --check`、`node --test scripts/verify-samples.mjs` を実行し、生成SB3をコミットしてください。`node scripts/prepare-pages.mjs` は既存docs/distと配布ファイルを `_site` に配置します。本体フラグの既定値は変更しません。
