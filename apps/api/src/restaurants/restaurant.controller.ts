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
  ListRestaurantsQueryDto,
  UpdateRestaurantSettingDto,
  UpsertRestaurantDto,
} from './dto/restaurant.dto';
import { RestaurantCommandService } from './restaurant.command.service';
import { RestaurantQueryService } from './restaurant.query.service';

@ApiTags('restaurants')
@ApiBearerAuth()
@Controller('restaurants')
export class RestaurantsController {
  constructor(
    private readonly queries: RestaurantQueryService,
    private readonly commands: RestaurantCommandService,
  ) {}

  @Get()
  @RequirePermissions('platform:restaurants:read')
  list(@Query() query: ListRestaurantsQueryDto) {
    return this.queries.list(query);
  }

  @Get(':id')
  @RequirePermissions('platform:restaurants:read')
  getById(@Param('id', ParseUUIDPipe) id: string) {
    return this.queries.getById(id);
  }

  @Post()
  @RequirePermissions('platform:restaurants:add')
  @ApiCreatedResponse()
  create(
    @Body() body: UpsertRestaurantDto,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() request: Request,
  ) {
    return this.commands.create(actor, body, authRequestContext(request));
  }

  @Put(':id')
  @RequirePermissions('platform:restaurants:edit')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpsertRestaurantDto,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() request: Request,
  ) {
    return this.commands.update(actor, id, body, authRequestContext(request));
  }

  @Put(':id/setting')
  @RequirePermissions('platform:restaurants:edit')
  updateSetting(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateRestaurantSettingDto,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() request: Request,
  ) {
    return this.commands.updateSetting(actor, id, body, authRequestContext(request));
  }

  @Delete(':id')
  @RequirePermissions('platform:restaurants:delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() actor: AuthenticatedUser,
    @Req() request: Request,
  ) {
    return this.commands.remove(actor, id, authRequestContext(request));
  }
}
