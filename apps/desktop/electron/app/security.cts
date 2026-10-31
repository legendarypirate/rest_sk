import { session } from 'electron';

export function hardenSession(isDev: boolean) {
  const current = session.defaultSession;

  current.setPermissionRequestHandler((_webContents, _permission, callback) => {
    callback(false);
  });

  if (isDev) {
    return;
  }

  current.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self' kiosk:; connect-src 'self' kiosk: http://127.0.0.1:* http://localhost:* ws://127.0.0.1:* ws://localhost:*; img-src 'self' kiosk: data: blob:; style-src 'self' 'unsafe-inline' kiosk:; script-src 'self' 'unsafe-inline' kiosk:; font-src 'self' kiosk: data:; worker-src 'self' blob:",
        ],
      },
    });
  });
}
