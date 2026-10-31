import { api } from '@/lib/api';

export type KioskInstallerMeta = {
  exists: boolean;
  filename: string;
  size: number | null;
  updatedAt: string | null;
};

export function getKioskInstallerMeta() {
  return api<KioskInstallerMeta>('kiosk/installer/meta');
}

export function uploadKioskInstaller(file: File) {
  const body = new FormData();
  body.append('file', file);
  return api<KioskInstallerMeta>('kiosk/installer', { method: 'POST', body });
}

export const KIOSK_INSTALLER_DOWNLOAD_URL = '/api/v1/kiosk/installer';
