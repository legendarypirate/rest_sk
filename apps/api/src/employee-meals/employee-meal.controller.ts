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
  ApiBody,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { Request } from 'express';

import { authRequestContext } from '@/iam/auth-request.context';
import type { AuthenticatedUser } from '@/iam/auth.types';
import { Public, RequirePermissions } from '@/iam/decorators/auth.decorators';
import { CurrentUser } from '@/iam/decorators/current-user.decorator';

import {
  CreateEmployeeMealOrderDto,
  ListEmployeeMealDaysQueryDto,
  ListEmployeeMealOrdersQueryDto,
  ListEmployeeMealTypesQueryDto,
  ListEmployeeOrderSchedulesQueryDto,
  UpdateEmployeeMealOrderDto,
  UpsertEmployeeMealDayDto,
  UpsertEmployeeMealTypeDto,
  UpsertEmployeeOrderScheduleDto,
} from './dto/employee-meal.dto';
import { EmployeeMealCommandService } from './employee-meal.command.service';
import { EmployeeMealQueryService } from './employee-meal.query.service';
import { todayDateOnly } from './employee-meal.mapper';

function contextOf(request: Request) {
  return authRequestContext(request);
}

@ApiTags('employee-meal-types')
@ApiBearerAuth()
@Controller('employee-meal-types')
export class EmployeeMealTypesController {
  constructor(
    private readonly queries: EmployeeMealQueryService,
    private readonly commands: EmployeeMealCommandService,
  ) {}

  @Get()
  @RequirePermissions('platform:employee-meal-types:read')
  list(@Query() query: ListEmployeeMealTypesQueryDto) {
    return this.queries.listTypes(query);
  }

  @Get(':id')
  @RequirePermissions('platform:employee-meal-types:read')
  getById(@Param('id', ParseUUIDPipe) id: string) {
    return this.queries.getType(id);
  }

  @Post()
  @RequirePermissions('platform:employee-meal-types:add')
  @ApiCreatedResponse()
  create(
    @Body() body: UpsertEmployeeMealTypeDto,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() request: Request,
  ) {
    return this.commands.createType(actor, body, contextOf(request));
  }

  @Put(':id')
  @RequirePermissions('platform:employee-meal-types:edit')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpsertEmployeeMealTypeDto,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() request: Request,
  ) {
    return this.commands.updateType(actor, id, body, contextOf(request));
  }

  @Delete(':id')
  @RequirePermissions('platform:employee-meal-types:delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() request: Request,
  ) {
    return this.commands.removeType(actor, id, contextOf(request));
  }
}

@ApiTags('employee-order-schedules')
@ApiBearerAuth()
@Controller('employee-order-schedules')
export class EmployeeOrderSchedulesController {
  constructor(
    private readonly queries: EmployeeMealQueryService,
    private readonly commands: EmployeeMealCommandService,
  ) {}

  @Get()
  @Public()
  list(@Query() query: ListEmployeeOrderSchedulesQueryDto) {
    return this.queries.listSchedules(query);
  }

  @Get(':id')
  @RequirePermissions('platform:employee-order-schedules:read')
  getById(@Param('id', ParseUUIDPipe) id: string) {
    return this.queries.getSchedule(id);
  }

  @Post()
  @RequirePermissions('platform:employee-order-schedules:add')
  @ApiCreatedResponse()
  create(
    @Body() body: UpsertEmployeeOrderScheduleDto,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() request: Request,
  ) {
    return this.commands.createSchedule(actor, body, contextOf(request));
  }

  @Put(':id')
  @RequirePermissions('platform:employee-order-schedules:edit')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpsertEmployeeOrderScheduleDto,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() request: Request,
  ) {
    return this.commands.updateSchedule(actor, id, body, contextOf(request));
  }

  @Delete(':id')
  @RequirePermissions('platform:employee-order-schedules:delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() request: Request,
  ) {
    return this.commands.removeSchedule(actor, id, contextOf(request));
  }
}

@ApiTags('employee-meal-days')
@ApiBearerAuth()
@Controller('employee-meal-days')
export class EmployeeMealDaysController {
  constructor(
    private readonly queries: EmployeeMealQueryService,
    private readonly commands: EmployeeMealCommandService,
  ) {}

  @Get()
  @Public()
  list(@Query() query: ListEmployeeMealDaysQueryDto) {
    return this.queries.listDays(query);
  }

  @Get(':id')
  @RequirePermissions('platform:employee-meal-days:read')
  getById(@Param('id', ParseUUIDPipe) id: string) {
    return this.queries.getDay(id);
  }

  @Post()
  @RequirePermissions('platform:employee-meal-days:add')
  @ApiCreatedResponse()
  create(
    @Body() body: UpsertEmployeeMealDayDto,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() request: Request,
  ) {
    return this.commands.createDay(actor, body, contextOf(request));
  }

  @Put(':id')
  @RequirePermissions('platform:employee-meal-days:edit')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpsertEmployeeMealDayDto,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() request: Request,
  ) {
    return this.commands.updateDay(actor, id, body, contextOf(request));
  }

  @Delete(':id')
  @RequirePermissions('platform:employee-meal-days:delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() request: Request,
  ) {
    return this.commands.removeDay(actor, id, contextOf(request));
  }
}

@ApiTags('employee-meal-orders')
@ApiBearerAuth()
@Controller('employee-meal-orders')
export class EmployeeMealOrdersController {
  constructor(
    private readonly queries: EmployeeMealQueryService,
    private readonly commands: EmployeeMealCommandService,
  ) {}

  @Get()
  @RequirePermissions('platform:employee-meal-orders:read')
  list(@Query() query: ListEmployeeMealOrdersQueryDto) {
    return this.queries.listOrders(query);
  }

  /** Kitchen display for MLOS — same list as admin, defaults to today. */
  @Get('board')
  @Public()
  @Throttle({ default: { limit: 60, ttl: 60_000 } })
  listBoard(@Query() query: ListEmployeeMealOrdersQueryDto) {
    const today = todayDateOnly();
    query.from = query.from ?? today;
    query.to = query.to ?? query.from ?? today;
    return this.queries.listOrders(query);
  }

  @Get(':id')
  @RequirePermissions('platform:employee-meal-orders:read')
  getById(@Param('id', ParseUUIDPipe) id: string) {
    return this.queries.getOrder(id);
  }

  @Public()
  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  @Post('request')
  @ApiBody({ type: CreateEmployeeMealOrderDto })
  @ApiCreatedResponse()
  request(@Body() body: CreateEmployeeMealOrderDto) {
    return this.commands.requestOrder(body);
  }

  @Post()
  @Public()
  @ApiBody({ type: CreateEmployeeMealOrderDto })
  @ApiCreatedResponse()
  create(
    @Body() body: CreateEmployeeMealOrderDto,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() request: Request,
  ) {
    return this.commands.createOrder(actor, body, contextOf(request));
  }

  @Put(':id')
  @RequirePermissions('platform:employee-meal-orders:edit')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateEmployeeMealOrderDto,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() request: Request,
  ) {
    return this.commands.updateOrder(actor, id, body, contextOf(request));
  }

  @Delete(':id')
  @RequirePermissions('platform:employee-meal-orders:delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() request: Request,
  ) {
    return this.commands.removeOrder(actor, id, contextOf(request));
  }
}
