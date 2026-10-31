import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Post, Put, Query, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiNoContentResponse, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';

import { authRequestContext } from '@/iam/auth-request.context';
import type { AuthenticatedUser } from '@/iam/auth.types';
import { RequirePermissions } from '@/iam/decorators/auth.decorators';
import { CurrentUser } from '@/iam/decorators/current-user.decorator';

import {
  CreateOrderStatusHistoryDto,
  ListOrderItemsQueryDto,
  ListOrderStatusHistoryQueryDto,
  ListOrdersQueryDto,
  UpsertOrderDto,
  UpsertOrderItemDto,
} from './dto/order.dto';
import { OrderCommandService } from '@/orders/order.command.service';
import { OrderQueryService } from '@/orders/order.query.service';

@ApiTags('orders')
@ApiBearerAuth()
@Controller('orders')
export class OrdersController {
  constructor(
    private readonly queries: OrderQueryService,
    private readonly commands: OrderCommandService,
  ) {}

  @Get()
  @RequirePermissions('platform:orders:read')
  list(@Query() query: ListOrdersQueryDto) {
    return this.queries.listOrders(query);
  }

  @Get(':id')
  @RequirePermissions('platform:orders:read')
  getById(@Param('id', ParseUUIDPipe) id: string) {
    return this.queries.getOrder(id);
  }

  @Post()
  @RequirePermissions('platform:orders:add')
  @ApiCreatedResponse()
  create(@Body() body: UpsertOrderDto, @CurrentUser() actor: AuthenticatedUser, @Req() request: Request) {
    return this.commands.createOrder(actor, body, authRequestContext(request));
  }

  @Put(':id')
  @RequirePermissions('platform:orders:edit')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpsertOrderDto,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() request: Request,
  ) {
    return this.commands.updateOrder(actor, id, body, authRequestContext(request));
  }

  @Delete(':id')
  @RequirePermissions('platform:orders:delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() actor: AuthenticatedUser, @Req() request: Request) {
    return this.commands.removeOrder(actor, id, authRequestContext(request));
  }
}

@ApiTags('order-items')
@ApiBearerAuth()
@Controller('order-items')
export class OrderItemsController {
  constructor(
    private readonly queries: OrderQueryService,
    private readonly commands: OrderCommandService,
  ) {}

  @Get()
  @RequirePermissions('platform:order-items:read')
  list(@Query() query: ListOrderItemsQueryDto) {
    return this.queries.listItems(query);
  }

  @Get(':id')
  @RequirePermissions('platform:order-items:read')
  getById(@Param('id', ParseUUIDPipe) id: string) {
    return this.queries.getItem(id);
  }

  @Post()
  @RequirePermissions('platform:order-items:add')
  @ApiCreatedResponse()
  create(@Body() body: UpsertOrderItemDto, @CurrentUser() actor: AuthenticatedUser, @Req() request: Request) {
    return this.commands.createItem(actor, body, authRequestContext(request));
  }

  @Put(':id')
  @RequirePermissions('platform:order-items:edit')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpsertOrderItemDto,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() request: Request,
  ) {
    return this.commands.updateItem(actor, id, body, authRequestContext(request));
  }

  @Delete(':id')
  @RequirePermissions('platform:order-items:delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() actor: AuthenticatedUser, @Req() request: Request) {
    return this.commands.removeItem(actor, id, authRequestContext(request));
  }
}

@ApiTags('order-status-history')
@ApiBearerAuth()
@Controller('order-status-history')
export class OrderStatusHistoryController {
  constructor(
    private readonly queries: OrderQueryService,
    private readonly commands: OrderCommandService,
  ) {}

  @Get()
  @RequirePermissions('platform:order-status-history:read')
  list(@Query() query: ListOrderStatusHistoryQueryDto) {
    return this.queries.listHistory(query);
  }

  @Get(':id')
  @RequirePermissions('platform:order-status-history:read')
  getById(@Param('id', ParseUUIDPipe) id: string) {
    return this.queries.getHistory(id);
  }

  @Post()
  @RequirePermissions('platform:order-status-history:add')
  @ApiCreatedResponse()
  create(@Body() body: CreateOrderStatusHistoryDto, @CurrentUser() actor: AuthenticatedUser, @Req() request: Request) {
    return this.commands.createHistory(actor, body, authRequestContext(request));
  }

  @Delete(':id')
  @RequirePermissions('platform:order-status-history:delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() actor: AuthenticatedUser, @Req() request: Request) {
    return this.commands.removeHistory(actor, id, authRequestContext(request));
  }
}
