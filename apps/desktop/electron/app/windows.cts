import { BrowserWindow, screen, shell } from 'electron';
import path from 'node:path';

export const RESOLUTION_PRESETS = {
  fullHd: { width: 1920, height: 1080 },
  hdReady: { width: 1366, height: 768 },
  portraitKiosk: { width: 1080, height: 1920 },
  squareTablet: { width: 1200, height: 1200 },
} as const;

export type ResolutionPreset = keyof typeof RESOLUTION_PRESETS;

export function applyResolution(windowRef: BrowserWindow, preset: ResolutionPreset) {
  const size = RESOLUTION_PRESETS[preset];
  if (!size) {
    return;
  }
  windowRef.setResizable(true);
  windowRef.setSize(size.width, size.height);
  windowRef.center();
}

function fitPortraitWindow(fullscreen: boolean) {
  const preset = RESOLUTION_PRESETS.portraitKiosk;
  if (fullscreen) {
    return preset;
  }

  const area = screen.getPrimaryDisplay().workAreaSize;
  const scale = Math.min(area.width / preset.width, area.height / preset.height, 1);
  return {
    width: Math.round(preset.width * scale),
    height: Math.round(preset.height * scale),
  };
}

type CreateWindowInput = {
  rendererUrl: string;
  preloadPath: string;
  fullscreen: boolean;
  openDevTools?: boolean;
};

export function createMainWindow({
  rendererUrl,
  preloadPath,
  fullscreen,
  openDevTools = false,
}: CreateWindowInput) {
  const fitted = fitPortraitWindow(fullscreen);
  const windowRef = new BrowserWindow({
    width: fitted.width,
    height: fitted.height,
    minWidth: 360,
    minHeight: 640,
    show: false,
    fullscreen,
    autoHideMenuBar: true,
    backgroundColor: '#071018',
    title: 'Khongor Self-Service Kiosk',
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  windowRef.webContents.setWindowOpenHandler(({ url }) => {
    void shell.openExternal(url);
    return { action: 'deny' };
  });

  windowRef.webContents.on('will-navigate', (event, url) => {
    const allowed = new URL(rendererUrl);
    const next = new URL(url);
    if (next.origin !== allowed.origin) {
      event.preventDefault();
    }
  });

  void windowRef.loadURL(rendererUrl);
  windowRef.once('ready-to-show', () => {
    windowRef.show();
    if (fullscreen) {
      windowRef.setFullScreen(true);
    }
    if (openDevTools) {
      windowRef.webContents.openDevTools({ mode: 'detach' });
    }
  });

  windowRef.webContents.on('before-input-event', (event, input) => {
    if (!openDevTools || input.type !== 'keyDown') {
      return;
    }
    if (input.key === 'F12' || (input.control && input.shift && input.key.toLowerCase() === 'i')) {
      event.preventDefault();
      windowRef.webContents.toggleDevTools();
    }
  });

  return windowRef;
}

export function preloadPathFromMain(mainDir: string) {
  return path.join(mainDir, 'preload.cjs');
}
