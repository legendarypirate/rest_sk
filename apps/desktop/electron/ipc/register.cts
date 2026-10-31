import { ipcMain, screen, type BrowserWindow } from 'electron';

import { completeCheckout } from '../services/checkout.cjs';
import { getStoreFilePath, readDeviceRecord, registerOrUpdateDevice } from '../device/device-store.cjs';
import { submitEbarimtReceipt } from '../services/ebarimt.cjs';
import { IpcChannel } from './channels.cjs';
import { getConfigFileHint, loadKioskConfig } from '../config/kiosk-config.cjs';
import { chargeCard } from '../services/pos.cjs';
import { printReceipt } from '../services/printer.cjs';
import type { ReceiptData } from '../types/config.types';
import type { DeviceSyncResult, KioskDeviceRecord } from '../types/devices.types';
import { applyResolution, type ResolutionPreset } from '../app/windows.cjs';

export function registerIpcHandlers(getWindow: () => BrowserWindow | null) {
  ipcMain.handle(IpcChannel.DisplayInfo, () => {
    const display = screen.getPrimaryDisplay();
    const config = loadKioskConfig();

    return {
      width: display.bounds.width,
      height: display.bounds.height,
      scaleFactor: display.scaleFactor,
      preset: config.display.preset,
      configPath: getConfigFileHint(),
    };
  });

  ipcMain.handle(IpcChannel.SetResolution, (_event, preset: ResolutionPreset) => {
    const windowRef = getWindow();
    if (!windowRef) {
      return;
    }
    applyResolution(windowRef, preset);
  });

  ipcMain.handle(IpcChannel.ToggleFullscreen, () => {
    const windowRef = getWindow();
    if (!windowRef) {
      return;
    }
    windowRef.setFullScreen(!windowRef.isFullScreen());
  });

  ipcMain.handle(IpcChannel.DeviceInfo, (): KioskDeviceRecord => {
    return readDeviceRecord() ?? registerOrUpdateDevice();
  });

  ipcMain.handle(IpcChannel.DeviceRegister, (): KioskDeviceRecord => {
    return registerOrUpdateDevice();
  });

  ipcMain.handle(IpcChannel.DeviceSync, async (): Promise<DeviceSyncResult> => {
    const record = registerOrUpdateDevice();
    return {
      synced: false,
      message: `Локал хадгалагдлаа (${getStoreFilePath()}). Backend холбогдоогүй.`,
      backendId: record.backendId ?? null,
    };
  });

  ipcMain.handle(IpcChannel.CheckoutComplete, (_event, receipt: ReceiptData) =>
    completeCheckout(receipt),
  );

  ipcMain.handle(IpcChannel.EbarimtSubmit, (_event, payload) => submitEbarimtReceipt(payload));

  ipcMain.handle(IpcChannel.PosCharge, (_event, amount: number) => chargeCard(amount));

  ipcMain.handle(IpcChannel.PrinterPrint, (_event, receipt: ReceiptData) => printReceipt(receipt));
}
