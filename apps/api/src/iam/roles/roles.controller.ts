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
import { RolePermissionsCommandService } from './role-permissions.command.service';
import { RolePermissionsQueryService } from './role-permissions.query.service';
import { RolesCommandService } from './roles.command.service';
import { RolesQueryService } from './roles.query.service';
import {
  GrantRolePermissionDto,
  ReplaceRolePermissionsDto,
} from './dto/role-permissions.dto';
import {
  CreateRoleDto,
  ListPermissionsQueryDto,
  ListRoleUsersQueryDto,
  ListRolesQueryDto,
  UpdateRoleDto,
} from './dto/roles.dto';

@ApiTags('roles')
@ApiBearerAuth()
@Controller('auth/roles')
export class RolesController {
  constructor(
    private readonly queries: RolesQueryService,
    private readonly commands: RolesCommandService,
    private readonly permissionQueries: RolePermissionsQueryService,
    private readonly permissionCommands: RolePermissionsCommandService,
  ) {}

  @Get()
  @RequirePermissions('platform:roles:read')
  list(@Query() query: ListRolesQueryDto) {
    return this.queries.list(query);
  }

  @Get('permission-catalog')
  @RequirePermissions('platform:roles:read')
  listPermissions(@Query() query: ListPermissionsQueryDto) {
    return this.queries.listPermissions(query);
  }

  @Get('slug/:slug')
  @RequirePermissions('platform:roles:read')
  getBySlug(@Param('slug') slug: string) {
    return this.queries.getBySlug(slug);
  }

  @Get(':id')
  @RequirePermissions('platform:roles:read')
  getById(@Param('id', ParseUUIDPipe) id: string) {
    return this.queries.getById(id);
  }

  @Get(':id/users')
  @RequirePermissions('platform:roles:read')
  listUsers(
    @Param('id', ParseUUIDPipe) id: string,
    @Query() query: ListRoleUsersQueryDto,
  ) {
    return this.queries.listUsers(id, query);
  }

  @Get(':id/permissions')
  @RequirePermissions('platform:roles:read')
  listRolePermissions(@Param('id', ParseUUIDPipe) id: string) {
    return this.permissionQueries.listByRoleId(id);
  }

  @Post()
  @RequirePermissions('platform:roles:manage')
  @ApiCreatedResponse()
  create(
    @Body() body: CreateRoleDto,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() request: Request,
  ) {
    return this.commands.create(actor, body, authRequestContext(request));
  }

  @Put(':id')
  @RequirePermissions('platform:roles:manage')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateRoleDto,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() request: Request,
  ) {
    return this.commands.update(actor, id, body, authRequestContext(request));
  }

  @Delete(':id')
  @RequirePermissions('platform:roles:manage')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() request: Request,
  ) {
    return this.commands.remove(actor, id, authRequestContext(request));
  }

  @Post(':id/permissions')
  @RequirePermissions('platform:roles:manage')
  @ApiCreatedResponse()
  grantPermission(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: GrantRolePermissionDto,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() request: Request,
  ) {
    return this.permissionCommands.grant(
      actor,
      id,
      body,
      authRequestContext(request),
    );
  }

  @Put(':id/permissions')
  @RequirePermissions('platform:roles:manage')
  replacePermissions(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: ReplaceRolePermissionsDto,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() request: Request,
  ) {
    return this.permissionCommands.replace(
      actor,
      id,
      body,
      authRequestContext(request),
    );
  }

  @Delete(':id/permissions/:permissionId')
  @RequirePermissions('platform:roles:manage')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  revokePermission(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('permissionId', ParseUUIDPipe) permissionId: string,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() request: Request,
  ) {
    return this.permissionCommands.revoke(
      actor,
      id,
      permissionId,
      authRequestContext(request),
    );
  }
}
