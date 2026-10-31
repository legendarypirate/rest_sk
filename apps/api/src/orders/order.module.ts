import { Module } from '@nestjs/common';

import { OrderCommandService } from '@/orders/order.command.service';
import {
  OrderItemsController,
  OrderStatusHistoryController,
  OrdersController,
} from '@/orders/order.controller';
import { OrderQueryService } from '@/orders/order.query.service';

@Module({
  controllers: [OrdersController, OrderItemsController, OrderStatusHistoryController],
  providers: [OrderQueryService, OrderCommandService],
})
export class OrderModule {}
