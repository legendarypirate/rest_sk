import { app } from 'electron';
import fs from 'node:fs';
import path from 'node:path';

import { DEFAULT_KIOSK_CONFIG, type KioskConfig } from '../types/config.types';

let cachedConfig: KioskConfig | null = null;

function configPaths(): string[] {
  return [
    path.join(app.getPath('userData'), 'kiosk.config.json'),
    path.join(process.cwd(), 'kiosk.config.json'),
    path.join(__dirname, '../../../kiosk.config.json'),
  ];
}

export function loadKioskConfig(): KioskConfig {
  if (cachedConfig) {
    return cachedConfig;
  }

  for (const configPath of configPaths()) {
    if (!fs.existsSync(configPath)) {
      continue;
    }

    try {
      const parsed = JSON.parse(fs.readFileSync(configPath, 'utf-8')) as Partial<KioskConfig>;
      cachedConfig = {
        display: { ...DEFAULT_KIOSK_CONFIG.display, ...parsed.display },
        printer: { ...DEFAULT_KIOSK_CONFIG.printer, ...parsed.printer },
        pos: { ...DEFAULT_KIOSK_CONFIG.pos, ...parsed.pos },
      };
      console.log(`[kiosk] Loaded config from ${configPath}`);
      return cachedConfig;
    } catch (error) {
      console.warn(`[kiosk] Failed to parse ${configPath}:`, error);
    }
  }

  cachedConfig = DEFAULT_KIOSK_CONFIG;
  return cachedConfig;
}

export function getConfigFileHint(): string {
  return configPaths().join(' | ');
}
