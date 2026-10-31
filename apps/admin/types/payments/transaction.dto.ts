import type { PaymentMethodKind, PaymentStatus } from '@packages/types';

export type ListPaymentTransactionsQueryDto = {
  page?: number;
  limit?: number;
  orderId?: string;
  status?: PaymentStatus;
  method?: PaymentMethodKind;
};
