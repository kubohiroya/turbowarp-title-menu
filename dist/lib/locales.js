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
    en: {
        files: 'DSL files',
        cache: 'Extension cache',
        reload: 'Reload DSL',
        about: 'About',
        close: 'Close'
    },
    ja: {
        files: 'DSLファイル',
        cache: '機能拡張キャッシュ',
        reload: 'DSLを再読み込み',
        about: '情報',
        close: '閉じる'
    }
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
/**
 * Wording for the extension cache screen.
 *
 * The notice is the load-bearing part, and it says three things on purpose. Releasing is phrased
 * as letting go of what a project *names*, never as deleting what it owns, because the cache is
 * addressed by content and one copy can be claimed by several projects. It states that nothing is
 * lost for good, so that an operator freeing space is not frightened into leaving it alone. And it
 * states that a project URI is self-declared, the same admission the DSL dialog and the security
 * dialog make about an author's name — the Loader re-checks every digest on use, so a project
 * that files its bytes under somebody else's URI corrupts this list and nothing else.
 */
export const extensionCacheLocales = Object.freeze({
    en: {
        title: 'Extension cache',
        notice: 'Cached entries are addressed by their contents, not owned by a project. Releasing a project drops the digests that project names, which can take bytes another project would have reused. Nothing is lost for good: whatever is still needed is downloaded again the next time a project is opened. Each URI below is what that project called itself and is not verified; the loader re-checks every digest when it uses it, so a wrong URI only misleads this list.',
        total: 'Cached in all: {entries} entries, {bytes}',
        shared: 'Shared by every project (pinned by the catalog)',
        untitled: '(no title recorded)',
        entryCount: '{entries} entries',
        expand: 'Entries',
        collapse: 'Fold',
        release: 'Release',
        confirmRelease: 'Release?',
        cancel: 'Cancel',
        close: 'Close',
        refresh: 'Reload',
        empty: 'Nothing is cached. Opening a project that uses extensions fills this.',
        releaseResult: 'Released {released} entries and freed {freed}.',
        lastUsed: 'used {date}',
        originalSize: '{bytes} of JavaScript'
    },
    ja: {
        title: '機能拡張キャッシュ',
        notice: 'キャッシュは内容で参照されており、作品が所有しているわけではありません。作品を手放すと、その作品が名指すdigestを落とします。別の作品が使い回したはずのバイト列まで落ちることがあります。失われたままにはなりません。必要なものは、次にその作品を開いたときに取り直します。下に出るURIは、その作品自身の申告で、検証していません。Loaderは使うたびにdigestを照合するので、URIが誤っていても狂うのはこの一覧の見え方だけです。',
        total: 'キャッシュ全体: {entries}件、{bytes}',
        shared: 'すべての作品で共有（カタログが指定したもの）',
        untitled: '（タイトル未登録）',
        entryCount: '{entries}件',
        expand: '中身',
        collapse: 'たたむ',
        release: '手放す',
        confirmRelease: '手放す?',
        cancel: 'やめる',
        close: '閉じる',
        refresh: '読み直す',
        empty: 'キャッシュは空です。機能拡張を使う作品を開くと入ります。',
        releaseResult: '{released}件を手放し、{freed}を空けました。',
        lastUsed: '最終利用 {date}',
        originalSize: 'JavaScript {bytes}'
    }
});
const cacheErrorMessages = Object.freeze({
    en: {
        unavailable: 'Browser storage is unavailable, so the extension cache cannot be read.',
        failed: 'The extension cache operation failed.'
    },
    ja: {
        unavailable: 'ブラウザの保存領域が使えないため、機能拡張キャッシュを読めません。',
        failed: '機能拡張キャッシュの操作に失敗しました。'
    }
});
/**
 * Turns a cache failure into operator-facing text.
 *
 * Only the codes this package assigns itself are translated. A failure raised inside IndexedDB
 * keeps its own message, because inventing a friendlier sentence for an unclassified error would
 * hide the one detail that makes it reportable.
 */
export function describeCacheError(locale, error) {
    const code = error?.code;
    const messages = cacheErrorMessages[locale] ?? cacheErrorMessages.en;
    if (code !== undefined && code in messages)
        return messages[code];
    if (error instanceof Error && error.message.length > 0)
        return error.message;
    return String(error);
}
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
