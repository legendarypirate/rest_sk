import { Module } from '@nestjs/common';

import { PaymentTransactionCommandService } from '@/payments/payment-transaction.command.service';
import { PaymentEventsController, PaymentTransactionsController } from '@/payments/payment-transaction.controller';
import { PaymentTransactionQueryService } from '@/payments/payment-transaction.query.service';
import { RefundCommandService } from '@/payments/refund.command.service';
import { RefundsController } from '@/payments/refund.controller';
import { RefundQueryService } from '@/payments/refund.query.service';

@Module({
  controllers: [PaymentTransactionsController, PaymentEventsController, RefundsController],
  providers: [
    PaymentTransactionQueryService,
    PaymentTransactionCommandService,
    RefundQueryService,
    RefundCommandService,
  ],
})
export class PaymentModule {}
