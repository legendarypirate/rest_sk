import { Module } from '@nestjs/common';

import { ResourcesCommandService } from './resources.command.service';
import { ResourcesController } from './resources.controller';
import { ResourcesQueryService } from './resources.query.service';

@Module({
  controllers: [ResourcesController],
  providers: [ResourcesQueryService, ResourcesCommandService],
  exports: [ResourcesQueryService, ResourcesCommandService],
})
export class ResourcesModule {}
