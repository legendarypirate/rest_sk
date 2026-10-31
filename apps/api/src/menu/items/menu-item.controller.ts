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

import {
  ListMenuCategoryImagesQueryDto,
  ListMenuItemImagesQueryDto,
  ListMenuItemsQueryDto,
  MapMenuCategoryImagesDto,
  MapMenuItemImagesDto,
  UpsertMenuCategoryImageDto,
  UpsertMenuItemDto,
  UpsertMenuItemImageDto,
} from './dto/menu-item.dto';
import { MenuItemCommandService } from './menu-item.command.service';
import { MenuItemQueryService } from './menu-item.query.service';

function actorContext(request: Request) {
  return authRequestContext(request);
}

@ApiTags('menu-items')
@ApiBearerAuth()
@Controller('menu-items')
export class MenuItemsController {
  constructor(
    private readonly queries: MenuItemQueryService,
    private readonly commands: MenuItemCommandService,
  ) {}

  @Get()
  @RequirePermissions('platform:menu-items:read')
  list(@Query() query: ListMenuItemsQueryDto) {
    return this.queries.listItems(query);
  }

  @Get(':id')
  @RequirePermissions('platform:menu-items:read')
  getById(@Param('id', ParseUUIDPipe) id: string) {
    return this.queries.getItem(id);
  }

  @Post()
  @RequirePermissions('platform:menu-items:add')
  @ApiCreatedResponse()
  create(@Body() body: UpsertMenuItemDto, @CurrentUser() actor: AuthenticatedUser, @Req() request: Request) {
    return this.commands.createItem(actor, body, actorContext(request));
  }

  @Put(':id')
  @RequirePermissions('platform:menu-items:edit')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpsertMenuItemDto,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() request: Request,
  ) {
    return this.commands.updateItem(actor, id, body, actorContext(request));
  }

  @Delete(':id')
  @RequirePermissions('platform:menu-items:delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() actor: AuthenticatedUser, @Req() request: Request) {
    return this.commands.removeItem(actor, id, actorContext(request));
  }
}

@ApiTags('menu-category-images')
@ApiBearerAuth()
@Controller('menu-category-images')
export class MenuCategoryImagesController {
  constructor(
    private readonly queries: MenuItemQueryService,
    private readonly commands: MenuItemCommandService,
  ) {}

  @Get()
  @RequirePermissions('platform:menu-category-images:read')
  list(@Query() query: ListMenuCategoryImagesQueryDto) {
    return this.queries.listCategoryImages(query);
  }

  @Get(':id')
  @RequirePermissions('platform:menu-category-images:read')
  getById(@Param('id', ParseUUIDPipe) id: string) {
    return this.queries.getCategoryImage(id);
  }

  @Post()
  @RequirePermissions('platform:menu-category-images:add')
  @ApiCreatedResponse()
  create(
    @Body() body: UpsertMenuCategoryImageDto,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() request: Request,
  ) {
    return this.commands.createCategoryImage(actor, body, actorContext(request));
  }

  @Post('map')
  @RequirePermissions('platform:menu-category-images:add')
  @ApiCreatedResponse()
  map(
    @Body() body: MapMenuCategoryImagesDto,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() request: Request,
  ) {
    return this.commands.mapCategoryImages(actor, body, actorContext(request));
  }

  @Put(':id')
  @RequirePermissions('platform:menu-category-images:edit')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpsertMenuCategoryImageDto,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() request: Request,
  ) {
    return this.commands.updateCategoryImage(actor, id, body, actorContext(request));
  }

  @Delete(':id')
  @RequirePermissions('platform:menu-category-images:delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() request: Request,
  ) {
    return this.commands.removeCategoryImage(actor, id, actorContext(request));
  }
}

@ApiTags('menu-item-images')
@ApiBearerAuth()
@Controller('menu-item-images')
export class MenuItemImagesController {
  constructor(
    private readonly queries: MenuItemQueryService,
    private readonly commands: MenuItemCommandService,
  ) {}

  @Get()
  @RequirePermissions('platform:menu-item-images:read')
  list(@Query() query: ListMenuItemImagesQueryDto) {
    return this.queries.listItemImages(query);
  }

  @Get(':id')
  @RequirePermissions('platform:menu-item-images:read')
  getById(@Param('id', ParseUUIDPipe) id: string) {
    return this.queries.getItemImage(id);
  }

  @Post()
  @RequirePermissions('platform:menu-item-images:add')
  @ApiCreatedResponse()
  create(
    @Body() body: UpsertMenuItemImageDto,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() request: Request,
  ) {
    return this.commands.createItemImage(actor, body, actorContext(request));
  }

  @Post('map')
  @RequirePermissions('platform:menu-item-images:add')
  @ApiCreatedResponse()
  map(
    @Body() body: MapMenuItemImagesDto,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() request: Request,
  ) {
    return this.commands.mapItemImages(actor, body, actorContext(request));
  }

  @Put(':id')
  @RequirePermissions('platform:menu-item-images:edit')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpsertMenuItemImageDto,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() request: Request,
  ) {
    return this.commands.updateItemImage(actor, id, body, actorContext(request));
  }

  @Delete(':id')
  @RequirePermissions('platform:menu-item-images:delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() actor: AuthenticatedUser, @Req() request: Request) {
    return this.commands.removeItemImage(actor, id, actorContext(request));
  }
}
