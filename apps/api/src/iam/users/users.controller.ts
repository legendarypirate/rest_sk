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
import { UserRolesCommandService } from './user-roles.command.service';
import { UserRolesQueryService } from './user-roles.query.service';
import { UsersCommandService } from './users.command.service';
import { UsersQueryService } from './users.query.service';
import {
  AssignUserRoleDto,
  ReplaceUserRolesDto,
} from './dto/user-roles.dto';
import {
  CreateUserDto,
  DeleteUserDto,
  ListUsersQueryDto,
  UpdateUserDto,
} from './dto/users.dto';

@ApiTags('users')
@ApiBearerAuth()
@Controller('auth/users')
export class UsersController {
  constructor(
    private readonly queries: UsersQueryService,
    private readonly commands: UsersCommandService,
    private readonly roleQueries: UserRolesQueryService,
    private readonly roleCommands: UserRolesCommandService,
  ) {}

  @Get()
  @RequirePermissions('platform:users:read')
  list(@Query() query: ListUsersQueryDto) {
    return this.queries.list(query);
  }

  @Get('public/:publicId')
  @RequirePermissions('platform:users:read')
  getByPublicId(@Param('publicId', ParseUUIDPipe) publicId: string) {
    return this.queries.getByPublicId(publicId);
  }

  @Get(':id')
  @RequirePermissions('platform:users:read')
  getById(@Param('id', ParseUUIDPipe) id: string) {
    return this.queries.getById(id);
  }

  @Post()
  @RequirePermissions('platform:users:add')
  @ApiCreatedResponse()
  create(
    @Body() body: CreateUserDto,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() request: Request,
  ) {
    return this.commands.create(actor, body, authRequestContext(request));
  }

  @Put(':id')
  @RequirePermissions('platform:users:edit')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateUserDto,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() request: Request,
  ) {
    return this.commands.update(actor, id, body, authRequestContext(request));
  }

  @Delete(':id')
  @RequirePermissions('platform:users:delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: DeleteUserDto = {},
    @CurrentUser() actor: AuthenticatedUser,
    @Req() request: Request,
  ) {
    return this.commands.remove(actor, id, body, authRequestContext(request));
  }

  @Get(':id/roles')
  @RequirePermissions('platform:users:read')
  listRoles(@Param('id', ParseUUIDPipe) id: string) {
    return this.roleQueries.listByUserId(id);
  }

  @Post(':id/roles')
  @RequirePermissions('platform:users:edit')
  @ApiCreatedResponse()
  assignRole(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: AssignUserRoleDto,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() request: Request,
  ) {
    return this.roleCommands.assign(actor, id, body, authRequestContext(request));
  }

  @Put(':id/roles')
  @RequirePermissions('platform:users:edit')
  replaceRoles(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: ReplaceUserRolesDto,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() request: Request,
  ) {
    return this.roleCommands.replace(actor, id, body, authRequestContext(request));
  }

  @Delete(':id/roles/:roleId')
  @RequirePermissions('platform:users:edit')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  revokeRole(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('roleId', ParseUUIDPipe) roleId: string,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() request: Request,
  ) {
    return this.roleCommands.revoke(
      actor,
      id,
      roleId,
      authRequestContext(request),
    );
  }
}
