import definitions from './block-definitions.json';
import {extensionConfig} from './config';
import {createApplicationMenu, type ApplicationMenu} from './application-menu';
import {createDslStorage, type DslStorage} from './dsl-storage';
import {dispatchDslSourceEvent, dslOpenEventName, dslReloadEventName} from './events';
import {createTitleDialog, type TitleDialog} from './title-dialog';

type BlockTypeName = 'COMMAND' | 'REPORTER' | 'BOOLEAN';
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

function stageMount(): HTMLElement | undefined {
  const vm = Scratch.vm as unknown as {renderer?: {canvas?: HTMLCanvasElement}};
  return vm.renderer?.canvas?.parentElement ?? globalThis.document?.body;
}

const defaultLocales = {
  en: {
    title: extensionConfig.name,
    author: `Author: ${extensionConfig.author}`,
    license: `License: ${extensionConfig.license}`,
    website: 'Official Website',
    close: 'Close',
    open: 'Open DSL',
    reload: 'Reload DSL',
    about: 'About'
  },
  ja: {
    title: extensionConfig.name,
    author: `作者: ${extensionConfig.author}`,
    license: `ライセンス: ${extensionConfig.license}`,
    website: '公式Webサイト',
    close: '閉じる',
    open: 'DSLを開く',
    reload: 'DSLを再読み込み',
    about: '情報'
  }
} as const;

export class TurboWarpTitleMenuExtension implements TurboWarpExtension {
  private titleDialog: TitleDialog | null = null;
  private applicationMenu: ApplicationMenu | null = null;
  private storage: DslStorage | null = null;

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
    this.ensureTitleDialog().show(this.browserLocale());
  }

  public showMenu(): void {
    this.ensureApplicationMenu().show(this.browserLocale());
  }

  public hasSavedDsl(): boolean {
    return this.ensureStorage().load() !== null;
  }

  public savedDslName(): string {
    return this.ensureStorage().load()?.name ?? '';
  }

  private ensureTitleDialog(): TitleDialog {
    if (this.titleDialog) return this.titleDialog;
    const mount = stageMount();
    this.titleDialog = createTitleDialog({
      document: globalThis.document,
      ...(mount ? {mount} : {}),
      locales: defaultLocales,
      websiteUrl: extensionConfig.homepage
    });
    return this.titleDialog;
  }

  private ensureApplicationMenu(): ApplicationMenu {
    if (this.applicationMenu) return this.applicationMenu;
    const mount = stageMount();
    this.applicationMenu = createApplicationMenu({
      document: globalThis.document,
      ...(mount ? {mount} : {}),
      locales: defaultLocales,
      reloadEnabled: this.hasSavedDsl(),
      onOpen: () => this.openDslFilePicker(),
      onReload: () => this.reloadSavedDsl(),
      onAbout: () => this.showTitle(),
      onClose: () => this.applicationMenu?.hide()
    });
    return this.applicationMenu;
  }

  private ensureStorage(): DslStorage {
    this.storage ??= createDslStorage({namespace: extensionConfig.id});
    return this.storage;
  }

  private async openDslFilePicker(): Promise<void> {
    const document = globalThis.document;
    if (!document) throw new TypeError('document is required to open a DSL file');
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.txt,.yaml,.yml,.json,.k4,.kamishibai';
    const chosen = await new Promise<File | null>((resolve) => {
      input.addEventListener(
        'change',
        () => {
          resolve(input.files?.[0] ?? null);
        },
        {once: true}
      );
      input.click();
    });
    if (!chosen) return;
    const source = await chosen.text();
    const record = this.ensureStorage().save({name: chosen.name, source});
    this.applicationMenu?.setReloadEnabled(true);
    dispatchDslSourceEvent(dslOpenEventName, record);
  }

  private reloadSavedDsl(): void {
    const record = this.ensureStorage().load();
    if (!record) {
      this.applicationMenu?.setReloadEnabled(false);
      return;
    }
    dispatchDslSourceEvent(dslReloadEventName, record);
  }

  private browserLocale(): 'en' | 'ja' {
    const language = globalThis.navigator?.language ?? '';
    return /^ja(?:-|$)/i.test(language) ? 'ja' : 'en';
  }

  private toScratchBlock(block: BlockDefinition): Record<string, unknown> {
    return {
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
  }
}
