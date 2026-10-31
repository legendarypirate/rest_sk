import { net, protocol } from 'electron';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

export const KIOSK_SCHEME = 'kiosk';

export function registerKioskScheme() {
  protocol.registerSchemesAsPrivileged([
    {
      scheme: KIOSK_SCHEME,
      privileges: {
        standard: true,
        secure: true,
        supportFetchAPI: true,
        corsEnabled: true,
        stream: true,
      },
    },
  ]);
}

function resolveSafePath(root: string, pathname: string) {
  const relative = decodeURIComponent(pathname).replace(/^\/+/, '');
  const withIndex =
    !relative || relative.endsWith('/') ? `${relative}index.html` : relative;
  const candidate = path.normalize(path.join(root, withIndex));
  const rootWithSep = root.endsWith(path.sep) ? root : `${root}${path.sep}`;

  if (candidate !== root && !candidate.startsWith(rootWithSep)) {
    return path.join(root, 'index.html');
  }

  if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
    return candidate;
  }

  const asIndex = path.join(candidate, 'index.html');
  if (fs.existsSync(asIndex)) {
    return asIndex;
  }

  return path.join(root, 'index.html');
}

export function handleKioskProtocol(rendererRoot: string) {
  protocol.handle(KIOSK_SCHEME, (request) => {
    const url = new URL(request.url);
    const filePath = resolveSafePath(rendererRoot, url.pathname);
    return net.fetch(pathToFileURL(filePath).href);
  });
}

export function packagedRendererUrl() {
  return `${KIOSK_SCHEME}://app/`;
}
