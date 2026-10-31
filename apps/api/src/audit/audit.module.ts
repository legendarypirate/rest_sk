import { Global, Module } from '@nestjs/common';

import { AuditCommandService } from './audit.command.service';
import { AuditController } from './audit.controller';
import { AuditQueryService } from './audit.query.service';

@Global()
@Module({
  controllers: [AuditController],
  providers: [AuditQueryService, AuditCommandService],
  exports: [AuditQueryService, AuditCommandService],
})
export class AuditModule {}
