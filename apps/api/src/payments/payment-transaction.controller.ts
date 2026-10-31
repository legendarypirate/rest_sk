import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Post, Put, Query, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiNoContentResponse, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';

import { authRequestContext } from '@/iam/auth-request.context';
import type { AuthenticatedUser } from '@/iam/auth.types';
import { RequirePermissions } from '@/iam/decorators/auth.decorators';
import { CurrentUser } from '@/iam/decorators/current-user.decorator';

import {
  ListPaymentEventsQueryDto,
  ListPaymentTransactionsQueryDto,
  UpsertPaymentEventDto,
  UpsertPaymentTransactionDto,
} from './dto/transaction.dto';
import { PaymentTransactionCommandService } from '@/payments/payment-transaction.command.service';
import { PaymentTransactionQueryService } from '@/payments/payment-transaction.query.service';

@ApiTags('payment-transactions')
@ApiBearerAuth()
@Controller('payment-transactions')
export class PaymentTransactionsController {
  constructor(
    private readonly queries: PaymentTransactionQueryService,
    private readonly commands: PaymentTransactionCommandService,
  ) {}

  @Get()
  @RequirePermissions('platform:payment-transactions:read')
  list(@Query() query: ListPaymentTransactionsQueryDto) {
    return this.queries.listTransactions(query);
  }

  @Get(':id')
  @RequirePermissions('platform:payment-transactions:read')
  getById(@Param('id', ParseUUIDPipe) id: string) {
    return this.queries.getTransaction(id);
  }

  @Post()
  @RequirePermissions('platform:payment-transactions:add')
  @ApiCreatedResponse()
  create(@Body() body: UpsertPaymentTransactionDto, @CurrentUser() actor: AuthenticatedUser, @Req() request: Request) {
    return this.commands.createTransaction(actor, body, authRequestContext(request));
  }

  @Put(':id')
  @RequirePermissions('platform:payment-transactions:edit')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpsertPaymentTransactionDto,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() request: Request,
  ) {
    return this.commands.updateTransaction(actor, id, body, authRequestContext(request));
  }

  @Delete(':id')
  @RequirePermissions('platform:payment-transactions:delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() actor: AuthenticatedUser, @Req() request: Request) {
    return this.commands.removeTransaction(actor, id, authRequestContext(request));
  }
}

@ApiTags('payment-events')
@ApiBearerAuth()
@Controller('payment-events')
export class PaymentEventsController {
  constructor(
    private readonly queries: PaymentTransactionQueryService,
    private readonly commands: PaymentTransactionCommandService,
  ) {}

  @Get()
  @RequirePermissions('platform:payment-events:read')
  list(@Query() query: ListPaymentEventsQueryDto) {
    return this.queries.listEvents(query);
  }

  @Get(':id')
  @RequirePermissions('platform:payment-events:read')
  getById(@Param('id', ParseUUIDPipe) id: string) {
    return this.queries.getEvent(id);
  }

  @Post()
  @RequirePermissions('platform:payment-events:add')
  @ApiCreatedResponse()
  create(@Body() body: UpsertPaymentEventDto, @CurrentUser() actor: AuthenticatedUser, @Req() request: Request) {
    return this.commands.createEvent(actor, body, authRequestContext(request));
  }

  @Put(':id')
  @RequirePermissions('platform:payment-events:edit')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpsertPaymentEventDto,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() request: Request,
  ) {
    return this.commands.updateEvent(actor, id, body, authRequestContext(request));
  }

  @Delete(':id')
  @RequirePermissions('platform:payment-events:delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() actor: AuthenticatedUser, @Req() request: Request) {
    return this.commands.removeEvent(actor, id, authRequestContext(request));
  }
}
