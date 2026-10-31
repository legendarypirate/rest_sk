import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { RequirePermissions } from '@/iam/decorators/auth.decorators';
import { AuditQueryService } from './audit.query.service';
import { ListAuditQueryDto } from './dto/audit.dto';

@ApiTags('audit')
@ApiBearerAuth()
@Controller('audit')
export class AuditController {
  constructor(private readonly queries: AuditQueryService) {}

  @Get()
  @RequirePermissions('platform:audit:read')
  list(@Query() query: ListAuditQueryDto) {
    return this.queries.list(query);
  }

  @Get(':id/verify')
  @RequirePermissions('platform:audit:read')
  verify(@Param('id', ParseUUIDPipe) id: string) {
    return this.queries.verify(id);
  }

  @Get(':id')
  @RequirePermissions('platform:audit:read')
  getById(@Param('id', ParseUUIDPipe) id: string) {
    return this.queries.getById(id);
  }
}
