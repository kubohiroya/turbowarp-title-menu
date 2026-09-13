export const titleLocales = Object.freeze({
    en: {
        title: 'TurboWarp Title Menu',
        author: 'Author: Hiroya Kubo',
        license: 'License: MPL-2.0',
        website: 'Official Website',
        close: 'Close'
    },
    ja: {
        title: 'TurboWarp Title Menu',
        author: '作者: Hiroya Kubo',
        license: 'ライセンス: MPL-2.0',
        website: '公式Webサイト',
        close: '閉じる'
    }
});
export const menuLocales = Object.freeze({
    en: { files: 'DSL files', reload: 'Reload DSL', about: 'About', close: 'Close' },
    ja: { files: 'DSLファイル', reload: 'DSLを再読み込み', about: '情報', close: '閉じる' }
});
export const dslFilesLocales = Object.freeze({
    en: {
        title: 'DSL files',
        add: 'Add file',
        open: 'Open',
        rename: 'Rename',
        remove: 'Delete',
        confirmRemove: 'Delete for good?',
        confirm: 'OK',
        cancel: 'Cancel',
        close: 'Close',
        sortByName: 'Name',
        sortByDate: 'Updated',
        sortBySize: 'Size',
        empty: 'No DSL file is saved yet. Use Add file to store one.'
    },
    ja: {
        title: 'DSLファイル',
        add: 'ファイルを追加',
        open: '開く',
        rename: '名前を変える',
        remove: '削除',
        confirmRemove: '本当に削除?',
        confirm: 'OK',
        cancel: 'やめる',
        close: '閉じる',
        sortByName: '名前',
        sortByDate: '更新日時',
        sortBySize: 'サイズ',
        empty: '保存されたDSLファイルはありません。「ファイルを追加」から保存してください。'
    }
});
const storeErrorMessages = Object.freeze({
    en: {
        unavailable: 'Browser storage is unavailable, so DSL files cannot be saved.',
        'invalid-name': 'That file name cannot be used.',
        'invalid-source': 'That file could not be read as text.',
        'name-taken': 'Another DSL file already uses that name.',
        'too-large': 'That DSL file is too large to store.',
        'too-many': 'The DSL store is full. Delete a file before adding another.',
        'not-found': 'That DSL file is no longer stored.',
        quota: 'Browser storage is full. Delete a DSL file and try again.',
        failed: 'The DSL storage operation failed.'
    },
    ja: {
        unavailable: 'ブラウザの保存領域が使えないため、DSLファイルを保存できません。',
        'invalid-name': 'そのファイル名は使えません。',
        'invalid-source': 'そのファイルをテキストとして読み込めませんでした。',
        'name-taken': '同じ名前のDSLファイルがすでにあります。',
        'too-large': 'そのDSLファイルは大きすぎて保存できません。',
        'too-many': '保存できる数に達しています。どれかを削除してから追加してください。',
        'not-found': 'そのDSLファイルは保存されていません。',
        quota: 'ブラウザの保存領域がいっぱいです。DSLファイルを削除してからやり直してください。',
        failed: 'DSLファイルの操作に失敗しました。'
    }
});
/** Turns a store error code into operator-facing text, falling back to the raw message. */
export function describeStoreError(locale, error) {
    const code = error?.code;
    const messages = storeErrorMessages[locale] ?? storeErrorMessages.en;
    if (code !== undefined && code in messages)
        return messages[code];
    if (error instanceof Error && error.message.length > 0)
        return error.message;
    return String(error);
}
