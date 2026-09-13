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
type ArgumentTypeName = 'STRING' | 'NUMBER' | 'BOOLEAN';

interface DefinitionArgument {
  type: ArgumentTypeName;
  defaultValue?: string | number | boolean;
  menu?: string;
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

/** Reserved action IDs the extension handles itself. A project may still remove or relabel them. */
const builtinActionIds = ['files', 'reload', 'about', 'close'] as const;

type BuiltinActionId = (typeof builtinActionIds)[number];

interface MenuActionEntry {
  id: string;
  labels: Record<SupportedLocale, string>;
  enabled: boolean;
}

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
  private menuActions: MenuActionEntry[] = builtinActionIds.map((id) => ({
    id,
    labels: {en: menuLocales.en[id], ja: menuLocales.ja[id]},
    enabled: true
  }));
  private menuVisible = false;

  public getInfo(): Record<string, unknown> {
    return {
      id: extensionConfig.id,
      name: Scratch.translate(definitions.extensionName),
      docsURI: extensionConfig.docsURI,
      blockIconURI: extensionConfig.blockIconURI,
      blocks: blockDefinitions.map((block) => this.toScratchBlock(block)),
      menus: definitions.menus
    };
  }

  public showTitle(): void {
    this.ensureTitleDialog().show(this.locale());
  }

  /**
   * Shows the application menu.
   *
   * An empty registry does nothing: the underlying primitive requires at least one action, and a
   * project that cleared the actions to install its own should not be interrupted by an error
   * between the two steps.
   */
  public showMenu(): void {
    if (this.menuActions.length === 0) return;
    this.ensureApplicationMenu().show(this.locale());
    this.menuVisible = true;
  }

  /** Backs the dynamic `menuActions` dropdown, so it always lists what the project registered. */
  public menuActionItems(): Array<{text: string; value: string}> {
    if (this.menuActions.length === 0) return [{text: '\u2014', value: ''}];
    const locale = this.locale();
    return this.menuActions.map((action) => ({text: action.labels[locale], value: action.id}));
  }

  public addAppMenuAction(args: {ACTION: unknown; LABEL: unknown}): void {
    const id = Scratch.Cast.toString(args.ACTION).trim();
    if (id.length === 0) return;
    const label = Scratch.Cast.toString(args.LABEL);
    const existing = this.menuActions.find((action) => action.id === id);
    if (existing === undefined) {
      this.menuActions.push({id, labels: {en: label, ja: label}, enabled: true});
    } else {
      existing.labels = {en: label, ja: label};
    }
    this.rebuildMenu();
  }

  public clearAppMenuActions(): void {
    this.menuActions = [];
    this.rebuildMenu();
  }

  public setAppMenuActionEnabled(args: {ACTION: unknown; ENABLED: unknown}): void {
    const id = Scratch.Cast.toString(args.ACTION);
    const action = this.menuActions.find((entry) => entry.id === id);
    if (action === undefined) return;
    action.enabled = Scratch.Cast.toBoolean(args.ENABLED);
    this.applicationMenu?.setActionState(id, {enabled: action.enabled});
  }

  /** Started by the menu callback, so the handler only has to accept the match. */
  public whenAppMenuActionSelected(): boolean {
    return true;
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

  /**
   * Rebuilds the menu after its action list changed.
   *
   * The app-shell primitive fixes its actions at construction, so a changed list means a new menu.
   * A menu that was on screen is shown again, because a project that adds an action while the menu
   * is open should not have it silently disappear. Clearing every action closes the menu instead,
   * because the primitive refuses to build one with no actions.
   */
  private rebuildMenu(): void {
    this.applicationMenu?.dispose();
    this.applicationMenu = null;
    if (!this.menuVisible) return;
    if (this.menuActions.length === 0) {
      this.menuVisible = false;
      return;
    }
    this.showMenu();
  }

  private selectMenuAction(id: string): void {
    Scratch.vm?.runtime?.startHats?.(`${extensionConfig.id}_whenAppMenuActionSelected`, {ACTION: id});
    if (!builtinActionIds.includes(id as BuiltinActionId)) return;
    if (id === 'files') void this.showDslFiles();
    if (id === 'reload') this.reloadOpenedDsl();
    if (id === 'about') this.showTitle();
    if (id === 'close') this.hideMenu();
  }

  private hideMenu(): void {
    this.applicationMenu?.hide();
    this.menuVisible = false;
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
    this.applicationMenu = createAppShellApplicationMenu({
      document: globalThis.document,
      mount,
      initialLocale: this.locale(),
      actions: this.menuActions.map((action) => ({
        id: action.id,
        labels: action.labels,
        enabled: action.enabled,
        onSelect: () => this.selectMenuAction(action.id)
      }))
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
            ...(argument.defaultValue === undefined ? {} : {defaultValue: argument.defaultValue}),
            ...(argument.menu === undefined ? {} : {menu: argument.menu})
          }
        ])
      )
    };
    if (block.blockType === 'HAT') scratchBlock['isEdgeActivated'] = false;
    return scratchBlock;
  }
}
