import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Post, Put, Query, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiNoContentResponse, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';

import { authRequestContext } from '@/iam/auth-request.context';
import type { AuthenticatedUser } from '@/iam/auth.types';
import { RequirePermissions } from '@/iam/decorators/auth.decorators';
import { CurrentUser } from '@/iam/decorators/current-user.decorator';

import {
  ListKitchenOrderItemsQueryDto,
  ListKitchenOrdersQueryDto,
  ListKitchenTicketsQueryDto,
  UpsertKitchenOrderDto,
  UpsertKitchenOrderItemDto,
  UpsertKitchenTicketDto,
} from './dto/kitchen-order.dto';
import { KitchenOrderCommandService } from '@/kitchens/kitchen-order.command.service';
import { KitchenOrderQueryService } from '@/kitchens/kitchen-order.query.service';

@ApiTags('kitchen-orders')
@ApiBearerAuth()
@Controller('kitchen-orders')
export class KitchenOrdersController {
  constructor(
    private readonly queries: KitchenOrderQueryService,
    private readonly commands: KitchenOrderCommandService,
  ) {}

  @Get()
  @RequirePermissions('platform:kitchen-orders:read')
  list(@Query() query: ListKitchenOrdersQueryDto) {
    return this.queries.listOrders(query);
  }

  @Get(':id')
  @RequirePermissions('platform:kitchen-orders:read')
  getById(@Param('id', ParseUUIDPipe) id: string) {
    return this.queries.getOrder(id);
  }

  @Post()
  @RequirePermissions('platform:kitchen-orders:add')
  @ApiCreatedResponse()
  create(@Body() body: UpsertKitchenOrderDto, @CurrentUser() actor: AuthenticatedUser, @Req() request: Request) {
    return this.commands.createOrder(actor, body, authRequestContext(request));
  }

  @Put(':id')
  @RequirePermissions('platform:kitchen-orders:edit')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpsertKitchenOrderDto,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() request: Request,
  ) {
    return this.commands.updateOrder(actor, id, body, authRequestContext(request));
  }

  @Delete(':id')
  @RequirePermissions('platform:kitchen-orders:delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() actor: AuthenticatedUser, @Req() request: Request) {
    return this.commands.removeOrder(actor, id, authRequestContext(request));
  }
}

@ApiTags('kitchen-order-items')
@ApiBearerAuth()
@Controller('kitchen-order-items')
export class KitchenOrderItemsController {
  constructor(
    private readonly queries: KitchenOrderQueryService,
    private readonly commands: KitchenOrderCommandService,
  ) {}

  @Get()
  @RequirePermissions('platform:kitchen-order-items:read')
  list(@Query() query: ListKitchenOrderItemsQueryDto) {
    return this.queries.listItems(query);
  }

  @Get(':id')
  @RequirePermissions('platform:kitchen-order-items:read')
  getById(@Param('id', ParseUUIDPipe) id: string) {
    return this.queries.getItem(id);
  }

  @Post()
  @RequirePermissions('platform:kitchen-order-items:add')
  @ApiCreatedResponse()
  create(@Body() body: UpsertKitchenOrderItemDto, @CurrentUser() actor: AuthenticatedUser, @Req() request: Request) {
    return this.commands.createItem(actor, body, authRequestContext(request));
  }

  @Put(':id')
  @RequirePermissions('platform:kitchen-order-items:edit')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpsertKitchenOrderItemDto,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() request: Request,
  ) {
    return this.commands.updateItem(actor, id, body, authRequestContext(request));
  }

  @Delete(':id')
  @RequirePermissions('platform:kitchen-order-items:delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() actor: AuthenticatedUser, @Req() request: Request) {
    return this.commands.removeItem(actor, id, authRequestContext(request));
  }
}

@ApiTags('kitchen-tickets')
@ApiBearerAuth()
@Controller('kitchen-tickets')
export class KitchenTicketsController {
  constructor(
    private readonly queries: KitchenOrderQueryService,
    private readonly commands: KitchenOrderCommandService,
  ) {}

  @Get()
  @RequirePermissions('platform:kitchen-tickets:read')
  list(@Query() query: ListKitchenTicketsQueryDto) {
    return this.queries.listTickets(query);
  }

  @Get(':id')
  @RequirePermissions('platform:kitchen-tickets:read')
  getById(@Param('id', ParseUUIDPipe) id: string) {
    return this.queries.getTicket(id);
  }

  @Post()
  @RequirePermissions('platform:kitchen-tickets:add')
  @ApiCreatedResponse()
  create(@Body() body: UpsertKitchenTicketDto, @CurrentUser() actor: AuthenticatedUser, @Req() request: Request) {
    return this.commands.createTicket(actor, body, authRequestContext(request));
  }

  @Put(':id')
  @RequirePermissions('platform:kitchen-tickets:edit')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpsertKitchenTicketDto,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() request: Request,
  ) {
    return this.commands.updateTicket(actor, id, body, authRequestContext(request));
  }

  @Delete(':id')
  @RequirePermissions('platform:kitchen-tickets:delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() actor: AuthenticatedUser, @Req() request: Request) {
    return this.commands.removeTicket(actor, id, authRequestContext(request));
  }
}
