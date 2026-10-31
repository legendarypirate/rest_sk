import { Module } from '@nestjs/common';

import { UploadsCommandService } from './uploads.command.service';
import { UploadsController } from './uploads.controller';

@Module({
  controllers: [UploadsController],
  providers: [UploadsCommandService],
})
export class UploadsModule {}
