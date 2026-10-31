import { Module } from '@nestjs/common';

import { KitchenOrderCommandService } from '@/kitchens/kitchen-order.command.service';
import { KitchenOrderItemsController, KitchenOrdersController, KitchenTicketsController } from '@/kitchens/kitchen-order.controller';
import { KitchenOrderQueryService } from '@/kitchens/kitchen-order.query.service';
import { KitchenCommandService } from '@/kitchens/kitchen.command.service';
import { KitchenStationsController, KitchensController } from '@/kitchens/kitchen.controller';
import { KitchenQueryService } from '@/kitchens/kitchen.query.service';

@Module({
  controllers: [
    KitchensController,
    KitchenStationsController,
    KitchenOrdersController,
    KitchenOrderItemsController,
    KitchenTicketsController,
  ],
  providers: [KitchenQueryService, KitchenCommandService, KitchenOrderQueryService, KitchenOrderCommandService],
})
export class KitchenModule {}
