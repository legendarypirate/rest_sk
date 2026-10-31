import { app } from 'electron';
import os from 'node:os';

import type { DeviceSystemInfo } from '../types/devices.types';

export function collectDeviceSystemInfo(): DeviceSystemInfo {
  const ipAddresses: string[] = [];

  for (const interfaces of Object.values(os.networkInterfaces())) {
    for (const net of interfaces ?? []) {
      const family = net.family as string | number;
      const isIPv4 = family === 'IPv4' || family === 4;
      if (isIPv4 && !net.internal) {
        ipAddresses.push(net.address);
      }
    }
  }

  return {
    deviceName: os.hostname(),
    userName: os.userInfo().username,
    ipAddresses,
    primaryIp: ipAddresses[0] ?? null,
    appVersion: app.getVersion(),
    installPath: app.getPath('exe'),
    platform: process.platform,
  };
}
