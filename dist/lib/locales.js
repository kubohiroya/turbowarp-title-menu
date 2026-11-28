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
/** Text for the cache manager table. */
export const cacheManagerLocales = Object.freeze({
    en: {
        title: 'Cache manager',
        notice: 'Each row is one project\'s use of one cached copy. Releasing a use only removes it from this browser\'s cache; the project still refers to the same address and downloads it again the next time it is opened, so it may not work offline until then. A copy another project still uses stays. Names, addresses and project titles are what the projects recorded and are not verified; the loader checks every copy by its SHA-256 before using it.',
        search: 'Search names, addresses, projects or digests',
        kindFilter: 'Kind',
        kindAll: 'All kinds',
        kinds: {
            costume: 'Costume',
            backdrop: 'Backdrop',
            sound: 'Sound',
            document: 'Document',
            extension: 'Extension',
            other: 'Other',
            unknown: 'Unknown'
        },
        projectFilter: 'Project',
        projectAll: 'All projects',
        shared: 'Shared by every project',
        untitled: '(no title recorded)',
        unnamed: '(no name recorded)',
        columns: { select: 'Select', name: 'Name', kind: 'Kind', project: 'Project', size: 'Size', lastAccess: 'Last used' },
        total: '{entries} cached copies, {bytes} ({uses} uses).',
        shown: 'Showing {shown} of {uses}.',
        selectShown: 'Select shown ({count})',
        selectAll: 'Select all in the cache ({count})',
        clearSelection: 'Clear selection',
        selection: '{uses} selected. Frees about {bytes}; {kept} copies stay because another project uses them.',
        release: 'Release selected',
        confirmRelease: 'Release {uses}?',
        cancel: 'Cancel',
        close: 'Close',
        refresh: 'Reload',
        loading: 'Reading the cache…',
        empty: 'Nothing is cached. Opening a project that uses remote data fills this.',
        noMatches: 'Nothing matches the search.',
        releaseResult: 'Released {released} of {requested} and freed {freed}.',
        releaseStale: '{missing} had already been released elsewhere.',
        sharedBy: 'used by {uses} projects',
        redacted: 'Address shortened: credentials or a query were removed',
        digest: 'SHA-256 {key}',
        embedNotice: 'Embedding puts the data into the open project, unsaved, and keeps its address so it can be referenced remotely again. The project grows by that much. Its cached copy is released only after the project is saved.',
        embedFormat: 'Embed as',
        embedFormats: { 'embedded-file': 'A file in the SB3', 'embedded-data': 'Data in project.json' },
        embed: 'Embed {uses} in this project',
        embedAndRelease: 'Embed {uses} and release after saving',
        embedOtherProjects: '{uses} selected belong to other projects. Open a project to embed its data.',
        embedResult: 'Embedded {embedded} of {requested} into the open project. Save it to keep the change.',
        embedSkipped: '{count} could not be embedded: {reasons}.',
        embedSkipReasons: {
            'not-in-project': 'the open project does not refer to it with this digest',
            changed: 'the project data no longer matches the digest',
            unsupported: 'its owner cannot embed it'
        },
        embedReleasePending: 'Its cached copies are released once the project is saved.',
        embedReleaseResult: 'The project was saved: released {released} and freed {freed}. {kept} were kept.'
    },
    ja: {
        title: 'キャッシュ管理',
        notice: '1行は、1つの作品がキャッシュの1つの実体を使っていることを表します。手放すと、このブラウザーのキャッシュから外れるだけです。作品は同じ URL を参照し続け、次に開いたときに取得し直すので、それまではオフラインで使えないことがあります。別の作品が使っている実体は残ります。名前・URL・作品名は作品が記録したもので、検証していません。Loader は使う前に SHA-256 で照合します。',
        search: '名前・URL・作品・digest で検索',
        kindFilter: '種類',
        kindAll: 'すべての種類',
        kinds: {
            costume: 'コスチューム',
            backdrop: '背景',
            sound: '音',
            document: '文書',
            extension: '機能拡張',
            other: 'その他',
            unknown: '不明'
        },
        projectFilter: '作品',
        projectAll: 'すべての作品',
        shared: 'すべての作品で共有',
        untitled: '（作品名の記録なし）',
        unnamed: '（名前の記録なし）',
        columns: { select: '選択', name: '名前', kind: '種類', project: '作品', size: '容量', lastAccess: '最終利用' },
        total: 'キャッシュの実体 {entries}件、{bytes}（利用 {uses}件）。',
        shown: '{uses}件中 {shown}件を表示。',
        selectShown: '表示中を選択（{count}件）',
        selectAll: 'キャッシュ全体を選択（{count}件）',
        clearSelection: '選択を解除',
        selection: '{uses}件を選択中。約 {bytes} 空きます。{kept}件の実体は別の作品が使っているので残ります。',
        release: '選択を手放す',
        confirmRelease: '{uses}件を手放す?',
        cancel: 'やめる',
        close: '閉じる',
        refresh: '読み直す',
        loading: 'キャッシュを読んでいます…',
        empty: 'キャッシュは空です。リモートのデータを使う作品を開くと入ります。',
        noMatches: '検索に合うものはありません。',
        releaseResult: '{requested}件中 {released}件を手放し、{freed} 空けました。',
        releaseStale: '{missing}件は別の場所で既に手放されていました。',
        sharedBy: '{uses}作品が利用',
        redacted: 'URL を短縮しました（資格情報やクエリを除去）',
        digest: 'SHA-256 {key}',
        embedNotice: '埋め込むと、開いている作品にデータを入れます（未保存）。URL は残すので、あとで同じ内容をリモート参照に戻せます。作品はその分大きくなります。キャッシュの実体は作品を保存してから手放します。',
        embedFormat: '埋め込み方',
        embedFormats: { 'embedded-file': 'SB3 内のファイル', 'embedded-data': 'project.json 内のデータ' },
        embed: '{uses}件をこの作品に埋め込む',
        embedAndRelease: '{uses}件を埋め込み、保存後に手放す',
        embedOtherProjects: '選択のうち{uses}件は別の作品のものです。埋め込むにはその作品を開いてください。',
        embedResult: '{requested}件中 {embedded}件を開いている作品に埋め込みました。保存すると確定します。',
        embedSkipped: '{count}件は埋め込めませんでした（{reasons}）。',
        embedSkipReasons: {
            'not-in-project': '開いている作品がこの digest で参照していない',
            changed: '作品のデータが digest と一致しない',
            unsupported: '所有者が埋め込みに対応していない'
        },
        embedReleasePending: '作品を保存すると、キャッシュの実体を手放します。',
        embedReleaseResult: '作品を保存しました。{released}件を手放し、{freed} 空けました。{kept}件は残しました。'
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
