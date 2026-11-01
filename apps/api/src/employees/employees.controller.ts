import { Body, Controller, Get, Param, ParseUUIDPipe, Put, Query, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';

import { authRequestContext } from '@/iam/auth-request.context';
import type { AuthenticatedUser } from '@/iam/auth.types';
import { RequirePermissions } from '@/iam/decorators/auth.decorators';
import { CurrentUser } from '@/iam/decorators/current-user.decorator';

import { ListEmployeesQueryDto, UpdateEmployeeStatusDto } from './dto/employees.dto';
import { EmployeesCommandService } from './employees.command.service';
import { EmployeesQueryService } from './employees.query.service';

@ApiTags('employees')
@ApiBearerAuth()
@Controller('employees')
export class EmployeesController {
  constructor(
    private readonly queries: EmployeesQueryService,
    private readonly commands: EmployeesCommandService,
  ) {}

  @Get()
  @RequirePermissions('platform:employees:read')
  list(@Query() query: ListEmployeesQueryDto) {
    return this.queries.list(query);
  }

  @Put(':id/status')
  @RequirePermissions('platform:employees:edit')
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateEmployeeStatusDto,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() request: Request,
  ) {
    return this.commands.updateStatus(actor, id, body, authRequestContext(request));
  }
}
