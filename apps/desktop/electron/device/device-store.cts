import { app } from 'electron';
import { randomUUID } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

import { collectDeviceSystemInfo } from './device-info.cjs';
import type { KioskDeviceRecord } from '../types/devices.types';

const STORE_FILENAME = 'kiosk-device.json';

function getStorePath(): string {
  return path.join(app.getPath('userData'), STORE_FILENAME);
}

export function readDeviceRecord(): KioskDeviceRecord | null {
  const storePath = getStorePath();
  if (!fs.existsSync(storePath)) {
    return null;
  }

  try {
    return JSON.parse(fs.readFileSync(storePath, 'utf-8')) as KioskDeviceRecord;
  } catch {
    return null;
  }
}

export function writeDeviceRecord(record: KioskDeviceRecord): KioskDeviceRecord {
  const storePath = getStorePath();
  fs.mkdirSync(path.dirname(storePath), { recursive: true });
  fs.writeFileSync(storePath, JSON.stringify(record, null, 2), 'utf-8');
  return record;
}

export function registerOrUpdateDevice(): KioskDeviceRecord {
  const systemInfo = collectDeviceSystemInfo();
  const existing = readDeviceRecord();
  const now = new Date().toISOString();

  const record: KioskDeviceRecord = {
    ...systemInfo,
    kioskId: existing?.kioskId ?? randomUUID(),
    registeredAt: existing?.registeredAt ?? now,
    lastSeenAt: now,
    syncedToBackend: existing?.syncedToBackend ?? false,
    backendId: existing?.backendId ?? null,
  };

  return writeDeviceRecord(record);
}

export function getStoreFilePath(): string {
  return getStorePath();
}
