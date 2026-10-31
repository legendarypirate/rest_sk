import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  Req,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { Request } from 'express';

import { authRequestContext } from '@/iam/auth-request.context';
import type { AuthenticatedUser } from '@/iam/auth.types';
import { RequirePermissions } from '@/iam/decorators/auth.decorators';
import { CurrentUser } from '@/iam/decorators/current-user.decorator';

import { ListIntegrationsQueryDto, UpsertIntegrationDto } from './dto/integration.dto';
import { IntegrationsCommandService } from './integrations.command.service';
import { IntegrationsQueryService } from './integrations.query.service';

@ApiTags('integrations')
@ApiBearerAuth()
@Controller('integrations')
export class IntegrationsController {
  constructor(
    private readonly queries: IntegrationsQueryService,
    private readonly commands: IntegrationsCommandService,
  ) {}

  @Get()
  @RequirePermissions('platform:integrations:read')
  list(@Query() query: ListIntegrationsQueryDto) {
    return this.queries.list(query);
  }

  @Get(':id')
  @RequirePermissions('platform:integrations:read')
  getById(@Param('id', ParseUUIDPipe) id: string) {
    return this.queries.getById(id);
  }

  @Post()
  @RequirePermissions('platform:integrations:add')
  @ApiCreatedResponse()
  create(
    @Body() body: UpsertIntegrationDto,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() request: Request,
  ) {
    return this.commands.create(actor, body, authRequestContext(request));
  }

  @Put(':id')
  @RequirePermissions('platform:integrations:edit')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpsertIntegrationDto,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() request: Request,
  ) {
    return this.commands.update(actor, id, body, authRequestContext(request));
  }

  @Post('sync-employees')
  @RequirePermissions('platform:employees:edit')
  syncAll() {
    return this.commands.syncAll();
  }

  @Post(':id/sync-employees')
  @RequirePermissions('platform:integrations:edit')
  sync(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() request: Request,
  ) {
    return this.commands.syncEmployees(actor, id, authRequestContext(request));
  }

  @Delete(':id')
  @RequirePermissions('platform:integrations:delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() request: Request,
  ) {
    return this.commands.remove(actor, id, authRequestContext(request));
  }
}
