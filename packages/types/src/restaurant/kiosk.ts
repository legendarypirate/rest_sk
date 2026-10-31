export const KIOSK_DEVICE_STATUSES = ['ONLINE', 'OFFLINE', 'MAINTENANCE', 'DISABLED'] as const;
export type KioskDeviceStatus = (typeof KIOSK_DEVICE_STATUSES)[number];

export const KIOSK_SESSION_STATUSES = ['OPEN', 'CLOSED', 'EXPIRED', 'ABANDONED'] as const;
export type KioskSessionStatus = (typeof KIOSK_SESSION_STATUSES)[number];

export const DEVICE_EVENT_TYPES = [
  'ONLINE',
  'OFFLINE',
  'HEARTBEAT',
  'PRINTER_ERROR',
  'PAYMENT_TERMINAL_ERROR',
  'APPLICATION_CRASH',
  'UPDATE',
] as const;
export type DeviceEventType = (typeof DEVICE_EVENT_TYPES)[number];

export type KioskDeviceItem = {
  id: string;
  publicId: string;
  code: string;
  name: string;
  status: KioskDeviceStatus;
  appVersion: string | null;
  lastSeenAt: string | null;
  ipAddress: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

export type KioskSessionItem = {
  id: string;
  deviceId: string;
  deviceName: string;
  employeeId: string | null;
  employeeName: string | null;
  status: KioskSessionStatus;
  startedAt: string;
  endedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type KioskCatalogProduct = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string | null;
  featured: boolean;
};

export type KioskCatalog = {
  categories: string[];
  products: KioskCatalogProduct[];
};

export type DeviceEventItem = {
  id: string;
  deviceId: string;
  deviceName: string;
  sessionId: string | null;
  type: DeviceEventType;
  message: string | null;
  occurredAt: string;
  createdAt: string;
};
