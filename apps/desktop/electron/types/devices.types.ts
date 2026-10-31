export interface DeviceSystemInfo {
    deviceName: string;
    userName: string;
    ipAddresses: string[];
    primaryIp: string | null;
    appVersion: string;
    installPath: string;
    platform: string;
}
  
export interface KioskDeviceRecord extends DeviceSystemInfo {
    kioskId: string;
    registeredAt: string;
    lastSeenAt: string;
    syncedToBackend: boolean;
    backendId?: string | null;
}

export interface DeviceSyncResult {
    synced: boolean;
    message: string;
    backendId?: string | null;
}
  