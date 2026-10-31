import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Post, Put, Query, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiNoContentResponse, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';

import { authRequestContext } from '@/iam/auth-request.context';
import type { AuthenticatedUser } from '@/iam/auth.types';
import { RequirePermissions } from '@/iam/decorators/auth.decorators';
import { CurrentUser } from '@/iam/decorators/current-user.decorator';

import {
  ListKitchenStationsQueryDto as StationsQuery,
  ListKitchensQueryDto as KitchensQuery,
  UpsertKitchenDto as KitchenBody,
  UpsertKitchenStationDto as StationBody,
} from './dto/kitchen.dto';
import { KitchenCommandService } from '@/kitchens/kitchen.command.service';
import { KitchenQueryService } from '@/kitchens/kitchen.query.service';

@ApiTags('kitchens')
@ApiBearerAuth()
@Controller('kitchens')
export class KitchensController {
  constructor(
    private readonly queries: KitchenQueryService,
    private readonly commands: KitchenCommandService,
  ) {}

  @Get()
  @RequirePermissions('platform:kitchens:read')
  list(@Query() query: KitchensQuery) {
    return this.queries.listKitchens(query);
  }

  @Get(':id')
  @RequirePermissions('platform:kitchens:read')
  getById(@Param('id', ParseUUIDPipe) id: string) {
    return this.queries.getKitchen(id);
  }

  @Post()
  @RequirePermissions('platform:kitchens:add')
  @ApiCreatedResponse()
  create(@Body() body: KitchenBody, @CurrentUser() actor: AuthenticatedUser, @Req() request: Request) {
    return this.commands.createKitchen(actor, body, authRequestContext(request));
  }

  @Put(':id')
  @RequirePermissions('platform:kitchens:edit')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: KitchenBody,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() request: Request,
  ) {
    return this.commands.updateKitchen(actor, id, body, authRequestContext(request));
  }

  @Delete(':id')
  @RequirePermissions('platform:kitchens:delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() actor: AuthenticatedUser, @Req() request: Request) {
    return this.commands.removeKitchen(actor, id, authRequestContext(request));
  }
}

@ApiTags('kitchen-stations')
@ApiBearerAuth()
@Controller('kitchen-stations')
export class KitchenStationsController {
  constructor(
    private readonly queries: KitchenQueryService,
    private readonly commands: KitchenCommandService,
  ) {}

  @Get()
  @RequirePermissions('platform:kitchen-stations:read')
  list(@Query() query: StationsQuery) {
    return this.queries.listStations(query);
  }

  @Get(':id')
  @RequirePermissions('platform:kitchen-stations:read')
  getById(@Param('id', ParseUUIDPipe) id: string) {
    return this.queries.getStation(id);
  }

  @Post()
  @RequirePermissions('platform:kitchen-stations:add')
  @ApiCreatedResponse()
  create(@Body() body: StationBody, @CurrentUser() actor: AuthenticatedUser, @Req() request: Request) {
    return this.commands.createStation(actor, body, authRequestContext(request));
  }

  @Put(':id')
  @RequirePermissions('platform:kitchen-stations:edit')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: StationBody,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() request: Request,
  ) {
    return this.commands.updateStation(actor, id, body, authRequestContext(request));
  }

  @Delete(':id')
  @RequirePermissions('platform:kitchen-stations:delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() actor: AuthenticatedUser, @Req() request: Request) {
    return this.commands.removeStation(actor, id, authRequestContext(request));
  }
}
