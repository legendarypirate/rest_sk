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
import { ApiBearerAuth, ApiCreatedResponse, ApiNoContentResponse, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';

import { authRequestContext } from '@/iam/auth-request.context';
import type { AuthenticatedUser } from '@/iam/auth.types';
import { RequirePermissions } from '@/iam/decorators/auth.decorators';
import { CurrentUser } from '@/iam/decorators/current-user.decorator';

import { ListMenuCategoriesQueryDto, UpsertMenuCategoryDto } from './dto/menu.dto';
import { MenuCommandService } from './menu.command.service';
import { MenuQueryService } from './menu.query.service';

@ApiTags('menu-categories')
@ApiBearerAuth()
@Controller('menu-categories')
export class MenuCategoriesController {
  constructor(
    private readonly queries: MenuQueryService,
    private readonly commands: MenuCommandService,
  ) {}

  @Get()
  @RequirePermissions('platform:menu-categories:read')
  list(@Query() query: ListMenuCategoriesQueryDto) {
    return this.queries.listCategories(query);
  }

  @Get(':id')
  @RequirePermissions('platform:menu-categories:read')
  getById(@Param('id', ParseUUIDPipe) id: string) {
    return this.queries.getCategory(id);
  }

  @Post()
  @RequirePermissions('platform:menu-categories:add')
  @ApiCreatedResponse()
  create(
    @Body() body: UpsertMenuCategoryDto,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() request: Request,
  ) {
    return this.commands.createCategory(actor, body, authRequestContext(request));
  }

  @Put(':id')
  @RequirePermissions('platform:menu-categories:edit')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpsertMenuCategoryDto,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() request: Request,
  ) {
    return this.commands.updateCategory(actor, id, body, authRequestContext(request));
  }

  @Delete(':id')
  @RequirePermissions('platform:menu-categories:delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() request: Request,
  ) {
    return this.commands.removeCategory(actor, id, authRequestContext(request));
  }
}
