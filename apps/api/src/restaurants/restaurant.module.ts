import { Module } from '@nestjs/common';

import { RestaurantCommandService } from './restaurant.command.service';
import { RestaurantsController } from './restaurant.controller';
import { RestaurantQueryService } from './restaurant.query.service';

@Module({
  controllers: [RestaurantsController],
  providers: [RestaurantQueryService, RestaurantCommandService],
})
export class RestaurantModule {}
