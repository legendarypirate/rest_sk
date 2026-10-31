import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';

import { IntegrationsCommandService } from './integrations.command.service';
import { IntegrationsController } from './integrations.controller';
import { IntegrationsQueryService } from './integrations.query.service';
import { IntegrationsScheduler } from './integrations.scheduler';

@Module({
  imports: [ScheduleModule.forRoot()],
  controllers: [IntegrationsController],
  providers: [IntegrationsQueryService, IntegrationsCommandService, IntegrationsScheduler],
})
export class IntegrationsModule {}
