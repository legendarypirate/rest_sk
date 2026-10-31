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

import { authRequestContext } from '../auth-request.context';
import type { AuthenticatedUser } from '../auth.types';
import { RequirePermissions } from '../decorators/auth.decorators';
import { CurrentUser } from '../decorators/current-user.decorator';
import {
  CreateResourceDto,
  ListResourcesQueryDto,
  UpdateResourceDto,
} from './dto/resources.dto';
import { ResourcesCommandService } from './resources.command.service';
import { ResourcesQueryService } from './resources.query.service';

@ApiTags('resources')
@ApiBearerAuth()
@Controller('auth/resources')
export class ResourcesController {
  constructor(
    private readonly queries: ResourcesQueryService,
    private readonly commands: ResourcesCommandService,
  ) {}

  @Get()
  @RequirePermissions('platform:resources:read')
  list(@Query() query: ListResourcesQueryDto) {
    return this.queries.list(query);
  }

  @Get('menu')
  menu(@CurrentUser() actor: AuthenticatedUser) {
    return this.queries.menu(actor.permissions);
  }

  @Get(':id')
  @RequirePermissions('platform:resources:read')
  getById(@Param('id', ParseUUIDPipe) id: string) {
    return this.queries.getById(id);
  }

  @Post()
  @RequirePermissions('platform:resources:manage')
  @ApiCreatedResponse()
  create(
    @Body() body: CreateResourceDto,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() request: Request,
  ) {
    return this.commands.create(actor, body, authRequestContext(request));
  }

  @Put(':id')
  @RequirePermissions('platform:resources:manage')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateResourceDto,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() request: Request,
  ) {
    return this.commands.update(actor, id, body, authRequestContext(request));
  }

  @Delete(':id')
  @RequirePermissions('platform:resources:manage')
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
