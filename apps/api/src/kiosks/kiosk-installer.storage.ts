import { existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';

export const KIOSK_INSTALLER_FILENAME = 'Khongor-Kiosk-Setup.exe';
export const KIOSK_INSTALLER_MAX_BYTES = 400 * 1024 * 1024;

export function kioskInstallerDir() {
  return path.resolve(process.cwd(), 'storage', 'kiosk');
}

export function kioskInstallerPath() {
  return path.join(kioskInstallerDir(), KIOSK_INSTALLER_FILENAME);
}

export function ensureKioskInstallerDir() {
  const dir = kioskInstallerDir();
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  return dir;
}

export function isExeFile(file: { originalname?: string; mimetype?: string }) {
  const name = file.originalname?.toLowerCase() ?? '';
  const mime = file.mimetype?.toLowerCase() ?? '';
  if (!name.endsWith('.exe')) {
    return false;
  }
  return (
    mime === '' ||
    mime === 'application/octet-stream' ||
    mime === 'application/x-msdownload' ||
    mime === 'application/vnd.microsoft.portable-executable' ||
    mime === 'application/x-msdos-program'
  );
}
