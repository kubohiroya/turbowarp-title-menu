import {extensionConfig} from './config.js';
import {createApplicationMenu} from './application-menu.js';
import {createDslStorage} from './dsl-storage.js';
import {dslOpenEventName, dslReloadEventName} from './events.js';
import {createTitleDialog} from './title-dialog.js';
import {TurboWarpTitleMenuExtension} from './extension.js';

const publicApi = Object.freeze({
  createApplicationMenu,
  createDslStorage,
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
