import { contextBridge, ipcRenderer } from 'electron';

import type { ReceiptData } from './types/config.types';
import type { DesktopShellAPI } from './types/window.types';
import { IpcChannel } from './ipc/channels.cjs';

const desktopShell: DesktopShellAPI = {
  setResolution: (preset: string) => ipcRenderer.invoke(IpcChannel.SetResolution, preset),
  toggleFullscreen: () => ipcRenderer.invoke(IpcChannel.ToggleFullscreen),
  getDisplayInfo: () => ipcRenderer.invoke(IpcChannel.DisplayInfo),
  getDeviceInfo: () => ipcRenderer.invoke(IpcChannel.DeviceInfo),
  registerDevice: () => ipcRenderer.invoke(IpcChannel.DeviceRegister),
  syncDeviceToBackend: () => ipcRenderer.invoke(IpcChannel.DeviceSync),
  completeCheckout: (receipt: ReceiptData) => ipcRenderer.invoke(IpcChannel.CheckoutComplete, receipt),
  submitEbarimtReceipt: (payload: unknown) => ipcRenderer.invoke(IpcChannel.EbarimtSubmit, payload),
  chargeCard: (amount: number) => ipcRenderer.invoke(IpcChannel.PosCharge, amount),
  printReceipt: (receipt: ReceiptData) => ipcRenderer.invoke(IpcChannel.PrinterPrint, receipt),
};

contextBridge.exposeInMainWorld('desktopShell', desktopShell);
