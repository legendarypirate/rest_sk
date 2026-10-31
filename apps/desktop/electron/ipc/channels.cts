export const IpcChannel = {
  DisplayInfo: 'kiosk:display-info',
  SetResolution: 'kiosk:set-resolution',
  ToggleFullscreen: 'kiosk:toggle-fullscreen',
  DeviceInfo: 'kiosk:device-info',
  DeviceRegister: 'kiosk:device-register',
  DeviceSync: 'kiosk:device-sync',
  CheckoutComplete: 'kiosk:checkout:complete',
  EbarimtSubmit: 'kiosk:ebarimt:submit',
  PosCharge: 'kiosk:pos:charge',
  PrinterPrint: 'kiosk:printer:print',
} as const;

export type IpcChannel = (typeof IpcChannel)[keyof typeof IpcChannel];
