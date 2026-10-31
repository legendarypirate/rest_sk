import { Module } from '@nestjs/common';

import { MediaCommandService } from './media.command.service';
import { MediaController } from './media.controller';
import { MediaQueryService } from './media.query.service';

@Module({
  controllers: [MediaController],
  providers: [MediaQueryService, MediaCommandService],
  exports: [MediaQueryService, MediaCommandService],
})
export class MediaModule {}
