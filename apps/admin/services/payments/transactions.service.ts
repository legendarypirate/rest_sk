import type { Paginated, PaymentTransactionItem } from '@packages/types';

import { api } from '@/lib/api';
import { toSearchParams } from '@/lib/search-params';
import type { ListPaymentTransactionsQueryDto } from '@/types/payments/transaction.dto';

export function listPaymentTransactions(params: ListPaymentTransactionsQueryDto = {}) {
  return api<Paginated<PaymentTransactionItem>>(
    `payment-transactions?${toSearchParams({ ...params })}`,
  );
}
