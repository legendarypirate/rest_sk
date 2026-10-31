import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Post, Put, Query, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiNoContentResponse, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';

import { authRequestContext } from '@/iam/auth-request.context';
import type { AuthenticatedUser } from '@/iam/auth.types';
import { RequirePermissions } from '@/iam/decorators/auth.decorators';
import { CurrentUser } from '@/iam/decorators/current-user.decorator';

import { ListEmployeeMealsQueryDto, UpsertEmployeeMealDto } from './dto/meal.dto';
import { MealCommandService } from '@/employee-meal-policies/meals/meal.command.service';
import { MealQueryService } from '@/employee-meal-policies/meals/meal.query.service';

@ApiTags('employee-meals')
@ApiBearerAuth()
@Controller('employee-meals')
export class EmployeeMealsController {
  constructor(
    private readonly queries: MealQueryService,
    private readonly commands: MealCommandService,
  ) {}

  @Get()
  @RequirePermissions('platform:employee-meals:read')
  list(@Query() query: ListEmployeeMealsQueryDto) {
    return this.queries.list(query);
  }

  @Get(':id')
  @RequirePermissions('platform:employee-meals:read')
  getById(@Param('id', ParseUUIDPipe) id: string) {
    return this.queries.getById(id);
  }

  @Post()
  @RequirePermissions('platform:employee-meals:add')
  @ApiCreatedResponse()
  create(@Body() body: UpsertEmployeeMealDto, @CurrentUser() actor: AuthenticatedUser, @Req() request: Request) {
    return this.commands.create(actor, body, authRequestContext(request));
  }

  @Put(':id')
  @RequirePermissions('platform:employee-meals:edit')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpsertEmployeeMealDto,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() request: Request,
  ) {
    return this.commands.update(actor, id, body, authRequestContext(request));
  }

  @Delete(':id')
  @RequirePermissions('platform:employee-meals:delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() actor: AuthenticatedUser, @Req() request: Request) {
    return this.commands.remove(actor, id, authRequestContext(request));
  }
}
