import { createReadStream, existsSync, statSync, unlinkSync } from 'node:fs';
import { Injectable, StreamableFile } from '@nestjs/common';

import { BadRequestAppException, NotFoundAppException } from '@/common/exceptions';

import {
  isExeFile,
  KIOSK_INSTALLER_FILENAME,
  kioskInstallerPath,
} from './kiosk-installer.storage';

export type KioskInstallerMeta = {
  exists: boolean;
  filename: string;
  size: number | null;
  updatedAt: string | null;
};

@Injectable()
export class KioskInstallerService {
  meta(): KioskInstallerMeta {
    const filePath = kioskInstallerPath();
    if (!existsSync(filePath)) {
      return {
        exists: false,
        filename: KIOSK_INSTALLER_FILENAME,
        size: null,
        updatedAt: null,
      };
    }
    const stat = statSync(filePath);
    return {
      exists: true,
      filename: KIOSK_INSTALLER_FILENAME,
      size: stat.size,
      updatedAt: stat.mtime.toISOString(),
    };
  }

  assertUploaded(file?: { originalname?: string; mimetype?: string; size?: number }) {
    if (!file || !file.size || !isExeFile(file)) {
      const filePath = kioskInstallerPath();
      if (existsSync(filePath)) {
        unlinkSync(filePath);
      }
      throw new BadRequestAppException();
    }
    return this.meta();
  }

  stream(): StreamableFile {
    const filePath = kioskInstallerPath();
    if (!existsSync(filePath)) {
      throw new NotFoundAppException();
    }
    return new StreamableFile(createReadStream(filePath), {
      type: 'application/vnd.microsoft.portable-executable',
      disposition: `attachment; filename="${KIOSK_INSTALLER_FILENAME}"`,
      length: statSync(filePath).size,
    });
  }
}
