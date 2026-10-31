import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Post, Put, Query, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiNoContentResponse, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';

import { authRequestContext } from '@/iam/auth-request.context';
import type { AuthenticatedUser } from '@/iam/auth.types';
import { RequirePermissions } from '@/iam/decorators/auth.decorators';
import { CurrentUser } from '@/iam/decorators/current-user.decorator';

import { ListRefundsQueryDto, UpsertRefundDto } from './dto/refund.dto';
import { RefundCommandService } from '@/payments/refund.command.service';
import { RefundQueryService } from '@/payments/refund.query.service';

@ApiTags('refunds')
@ApiBearerAuth()
@Controller('refunds')
export class RefundsController {
  constructor(
    private readonly queries: RefundQueryService,
    private readonly commands: RefundCommandService,
  ) {}

  @Get()
  @RequirePermissions('platform:refunds:read')
  list(@Query() query: ListRefundsQueryDto) {
    return this.queries.list(query);
  }

  @Get(':id')
  @RequirePermissions('platform:refunds:read')
  getById(@Param('id', ParseUUIDPipe) id: string) {
    return this.queries.getById(id);
  }

  @Post()
  @RequirePermissions('platform:refunds:add')
  @ApiCreatedResponse()
  create(@Body() body: UpsertRefundDto, @CurrentUser() actor: AuthenticatedUser, @Req() request: Request) {
    return this.commands.create(actor, body, authRequestContext(request));
  }

  @Put(':id')
  @RequirePermissions('platform:refunds:edit')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpsertRefundDto,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() request: Request,
  ) {
    return this.commands.update(actor, id, body, authRequestContext(request));
  }

  @Delete(':id')
  @RequirePermissions('platform:refunds:delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() actor: AuthenticatedUser, @Req() request: Request) {
    return this.commands.remove(actor, id, authRequestContext(request));
  }
}
