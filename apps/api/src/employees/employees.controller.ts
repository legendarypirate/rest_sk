import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { RequirePermissions } from '@/iam/decorators/auth.decorators';

import { ListEmployeesQueryDto } from './dto/employees.dto';
import { EmployeesQueryService } from './employees.query.service';

@ApiTags('employees')
@ApiBearerAuth()
@Controller('employees')
export class EmployeesController {
  constructor(private readonly queries: EmployeesQueryService) {}

  @Get()
  @RequirePermissions('platform:employees:read')
  list(@Query() query: ListEmployeesQueryDto) {
    return this.queries.list(query);
  }
}
