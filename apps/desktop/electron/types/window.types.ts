import type { CheckoutResult, ReceiptData } from './config.types';
import type { DeviceSyncResult, KioskDeviceRecord } from './devices.types';
import type { EbarimtPreview } from '@packages/types';

export interface DisplayInfo {
  width: number;
  height: number;
  scaleFactor: number;
  preset: string;
  configPath: string;
}

export interface DesktopShellAPI {
  setResolution: (preset: string) => Promise<void>;
  toggleFullscreen: () => Promise<void>;
  getDisplayInfo: () => Promise<DisplayInfo>;
  getDeviceInfo: () => Promise<KioskDeviceRecord>;
  registerDevice: () => Promise<KioskDeviceRecord>;
  syncDeviceToBackend: () => Promise<DeviceSyncResult>;
  completeCheckout: (receipt: ReceiptData) => Promise<CheckoutResult>;
  submitEbarimtReceipt: (payload: EbarimtPreview) => Promise<unknown>;
  chargeCard: (amount: number) => Promise<unknown>;
  printReceipt: (receipt: ReceiptData) => Promise<unknown>;
}

declare global {
  interface Window {
    desktopShell?: DesktopShellAPI;
  }
}

export { };
