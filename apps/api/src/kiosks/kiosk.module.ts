import { Module } from '@nestjs/common';

import { KioskCommandService } from '@/kiosks/kiosk.command.service';
import {
  DeviceEventsController,
  KioskCatalogController,
  KioskDevicesController,
  KioskSessionsController,
} from '@/kiosks/kiosk.controller';
import { KioskInstallerService } from '@/kiosks/kiosk-installer.service';
import { KioskQueryService } from '@/kiosks/kiosk.query.service';

@Module({
  controllers: [
    KioskCatalogController,
    KioskDevicesController,
    KioskSessionsController,
    DeviceEventsController,
  ],
  providers: [KioskQueryService, KioskCommandService, KioskInstallerService],
})
export class KioskModule {}
