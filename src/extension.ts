import {createAppShellApplicationMenu, resolveAppShellLocale} from '@kubohiroya/turbowarp-app-shell';

import definitions from './block-definitions.json';
import {extensionConfig} from './config';
import {createDslFilesDialog, type DslFilesDialog} from './dsl-files-dialog';
import {createDslStore, readDslFile, type DslFileRecord, type DslStore} from './dsl-store';
import {dispatchDslSourceEvent, dslOpenEventName, dslReloadEventName} from './events';
import {
  describeStoreError,
  dslFilesLocales,
  menuLocales,
  titleLocales,
  type SupportedLocale
} from './locales';
import {createTitleDialog, type TitleDialog} from './title-dialog';

type ApplicationMenu = ReturnType<typeof createAppShellApplicationMenu>;

type BlockTypeName = 'COMMAND' | 'REPORTER' | 'BOOLEAN' | 'HAT';
type ArgumentTypeName = 'STRING';

interface DefinitionArgument {
  type: ArgumentTypeName;
  defaultValue: string;
}

interface BlockDefinition {
  opcode: string;
  blockType: BlockTypeName;
  text: string;
  description: string;
  arguments?: Record<string, DefinitionArgument>;
}

const blockDefinitions = definitions.blocks as readonly BlockDefinition[];

const dslFileAccept = '.txt,.yaml,.yml,.json,.k4,.kamishibai';

function stageMount(): HTMLElement | undefined {
  return Scratch.vm?.renderer?.canvas?.parentElement ?? globalThis.document?.body;
}

export class TurboWarpTitleMenuExtension implements TurboWarpExtension {
  private titleDialog: TitleDialog | null = null;
  private applicationMenu: ApplicationMenu | null = null;
  private filesDialog: DslFilesDialog | null = null;
  private store: DslStore | null = null;
  private openedRecord: DslFileRecord | null = null;
  private lastError = '';

  public getInfo(): Record<string, unknown> {
    return {
      id: extensionConfig.id,
      name: Scratch.translate(definitions.extensionName),
      docsURI: extensionConfig.docsURI,
      blockIconURI: extensionConfig.blockIconURI,
      blocks: blockDefinitions.map((block) => this.toScratchBlock(block))
    };
  }

  public showTitle(): void {
    this.ensureTitleDialog().show(this.locale());
  }

  public showMenu(): void {
    this.ensureApplicationMenu().show(this.locale());
  }

  public showDslFiles(): Promise<unknown> {
    return this.ensureFilesDialog().show(this.locale());
  }

  /** The hat is started by the open path, so its own handler only has to accept the match. */
  public whenDslSourceOpened(): boolean {
    return true;
  }

  public reloadOpenedDsl(): void {
    if (this.openedRecord === null) return;
    this.announce(dslReloadEventName, this.openedRecord);
  }

  public openedDslName(): string {
    return this.openedRecord?.name ?? '';
  }

  public openedDslSource(): string {
    return this.openedRecord?.source ?? '';
  }

  public async hasSavedDsl(): Promise<boolean> {
    return (await this.savedDslCount()) > 0;
  }

  public async savedDslCount(): Promise<number> {
    try {
      return await this.requireStore().count();
    } catch (error) {
      this.recordFailure(error);
      return 0;
    }
  }

  public lastDslError(): string {
    return this.lastError;
  }

  private locale(): SupportedLocale {
    return resolveAppShellLocale() === 'ja' ? 'ja' : 'en';
  }

  /**
   * Opens the store on first use.
   *
   * A browser without IndexedDB, or one with storage blocked, fails here rather than at extension
   * load: the title and menu blocks stay usable even when nothing can be stored.
   */
  private requireStore(): DslStore {
    this.store ??= createDslStore({databaseName: extensionConfig.id});
    return this.store;
  }

  private recordFailure(error: unknown): void {
    this.lastError = describeStoreError(this.locale(), error);
  }

  private announce(eventName: string, record: DslFileRecord): void {
    dispatchDslSourceEvent(eventName, record);
    Scratch.vm?.runtime?.startHats?.(`${extensionConfig.id}_whenDslSourceOpened`);
  }

  private ensureTitleDialog(): TitleDialog {
    if (this.titleDialog) return this.titleDialog;
    const mount = stageMount();
    this.titleDialog = createTitleDialog({
      document: globalThis.document,
      ...(mount ? {mount} : {}),
      locales: titleLocales,
      initialLocale: this.locale(),
      websiteUrl: extensionConfig.homepage
    });
    return this.titleDialog;
  }

  /**
   * Builds the menu from the shared app-shell primitive.
   *
   * The actions below are this extension's own vocabulary, not the primitive's: a host application
   * that needs different actions composes `createAppShellApplicationMenu` itself through the
   * composition API instead of being limited to these four.
   */
  private ensureApplicationMenu(): ApplicationMenu {
    if (this.applicationMenu) return this.applicationMenu;
    const mount = stageMount();
    if (mount === undefined) throw new TypeError('a stage container is required to show the menu');
    const labels = (key: keyof (typeof menuLocales)['en']) => ({
      en: menuLocales.en[key],
      ja: menuLocales.ja[key]
    });
    this.applicationMenu = createAppShellApplicationMenu({
      document: globalThis.document,
      mount,
      initialLocale: this.locale(),
      actions: [
        {id: 'files', labels: labels('files'), icon: {text: '\u{1F4C2}'}, onSelect: () => this.showDslFiles()},
        {id: 'reload', labels: labels('reload'), icon: {text: '↻'}, onSelect: () => this.reloadOpenedDsl()},
        {id: 'about', labels: labels('about'), icon: {text: 'i'}, onSelect: () => this.showTitle()},
        {id: 'close', labels: labels('close'), icon: {text: 'x'}, onSelect: () => this.applicationMenu?.hide()}
      ]
    });
    return this.applicationMenu;
  }

  private ensureFilesDialog(): DslFilesDialog {
    if (this.filesDialog) return this.filesDialog;
    const mount = stageMount();
    this.filesDialog = createDslFilesDialog({
      document: globalThis.document,
      ...(mount ? {mount} : {}),
      locales: dslFilesLocales,
      initialLocale: this.locale(),
      list: (sort) => this.requireStore().list(sort),
      onAdd: () => this.addDslFile(),
      onOpen: (id) => this.openDslFile(id),
      onRename: (id, name) => this.requireStore().rename(id, name),
      onRemove: (id) => this.removeDslFile(id),
      describeError: (error) => describeStoreError(this.locale(), error),
      onError: (error) => this.recordFailure(error)
    });
    return this.filesDialog;
  }

  private async addDslFile(): Promise<void> {
    const chosen = await this.pickDslFile();
    if (chosen === null) return;
    await this.requireStore().save(await readDslFile(chosen));
    this.lastError = '';
  }

  private async openDslFile(id: string): Promise<void> {
    const store = this.requireStore();
    const record = await store.get(id);
    if (record === null) return;
    await store.markOpened(id);
    this.openedRecord = record;
    this.lastError = '';
    this.announce(dslOpenEventName, record);
  }

  private async removeDslFile(id: string): Promise<void> {
    await this.requireStore().remove(id);
    if (this.openedRecord?.id === id) this.openedRecord = null;
    this.lastError = '';
  }

  private pickDslFile(): Promise<File | null> {
    const document = globalThis.document;
    if (!document) throw new TypeError('document is required to open a DSL file');
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = dslFileAccept;
    return new Promise<File | null>((resolve) => {
      input.addEventListener(
        'change',
        () => {
          resolve(input.files?.[0] ?? null);
        },
        {once: true}
      );
      input.click();
    });
  }

  private toScratchBlock(block: BlockDefinition): Record<string, unknown> {
    const scratchBlock: Record<string, unknown> = {
      opcode: block.opcode,
      blockType: Scratch.BlockType[block.blockType],
      text: Scratch.translate(block.text),
      arguments: Object.fromEntries(
        Object.entries(block.arguments ?? {}).map(([name, argument]) => [
          name,
          {
            type: Scratch.ArgumentType[argument.type],
            defaultValue: argument.defaultValue
          }
        ])
      )
    };
    if (block.blockType === 'HAT') scratchBlock['isEdgeActivated'] = false;
    return scratchBlock;
  }
}
