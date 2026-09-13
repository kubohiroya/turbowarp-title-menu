import {createAppShellApplicationMenu} from '@kubohiroya/turbowarp-app-shell';

import {extensionConfig} from './config.js';
import {createDslFilesDialog} from './dsl-files-dialog.js';
import {createDslStore} from './dsl-store.js';
import {dslOpenEventName, dslReloadEventName} from './events.js';
import {createTitleDialog} from './title-dialog.js';
import {TurboWarpTitleMenuExtension} from './extension.js';

const publicApi = Object.freeze({
  createApplicationMenu: createAppShellApplicationMenu,
  createDslFilesDialog,
  createDslStore,
  createTitleDialog,
  dslOpenEventName,
  dslReloadEventName
});

Object.defineProperty(globalThis, 'TurboWarpTitleMenu', {
  value: publicApi,
  configurable: true
});

if (extensionConfig.unsandboxed && !Scratch.extensions.unsandboxed) {
  throw new Error(`${extensionConfig.name} must run unsandboxed.`);
}

Scratch.extensions.register(new TurboWarpTitleMenuExtension());
