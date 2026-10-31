import { app, BrowserWindow } from 'electron';

import {
  applyDevRuntimeFlags,
  isDevSession,
  packagedRendererRoot,
  rendererUrlFromArg,
} from './app/env.cjs';
import { registerOrUpdateDevice } from './device/device-store.cjs';
import { registerIpcHandlers } from './ipc/register.cjs';
import {
  handleKioskProtocol,
  packagedRendererUrl,
  registerKioskScheme,
} from './app/protocol.cjs';
import { hardenSession } from './app/security.cjs';
import { createMainWindow, preloadPathFromMain } from './app/windows.cjs';

registerKioskScheme();
applyDevRuntimeFlags();

let windowRef: BrowserWindow | null = null;

app
  .whenReady()
  .then(() => {
    const isDev = isDevSession();
    hardenSession(isDev);
    registerOrUpdateDevice();

    if (!isDev) {
      handleKioskProtocol(packagedRendererRoot(app.getAppPath()));
    }

    registerIpcHandlers(() => windowRef);

    const rendererUrl = isDev ? rendererUrlFromArg()! : packagedRendererUrl();
    windowRef = createMainWindow({
      rendererUrl,
      preloadPath: preloadPathFromMain(__dirname),
      fullscreen: true,
      openDevTools: isDev,
    });
    windowRef.on('closed', () => {
      windowRef = null;
    });

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        windowRef = createMainWindow({
          rendererUrl,
          preloadPath: preloadPathFromMain(__dirname),
          fullscreen: true,
          openDevTools: isDev,
        });
      }
    });
  })
  .catch((error: unknown) => {
    console.error('Khongor kiosk failed to start', error);
    app.quit();
  });

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
