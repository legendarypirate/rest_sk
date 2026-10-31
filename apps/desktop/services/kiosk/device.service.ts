import type { DeviceSyncResult, KioskDeviceRecord } from '@/electron/types/devices.types';

function hasDesktopShell(): boolean {
  return typeof window !== 'undefined' && !!window.desktopShell;
}

export async function getKioskDevice(): Promise<KioskDeviceRecord | null> {
  if (!hasDesktopShell()) {
    return null;
  }
  return window.desktopShell!.getDeviceInfo();
}

export async function registerKioskDevice(): Promise<KioskDeviceRecord | null> {
  if (!hasDesktopShell()) {
    return null;
  }
  return window.desktopShell!.registerDevice();
}

export async function syncKioskDeviceToBackend(): Promise<DeviceSyncResult | null> {
  if (!hasDesktopShell()) {
    return null;
  }
  return window.desktopShell!.syncDeviceToBackend();
}
