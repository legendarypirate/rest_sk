'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type { PaymentMethodKind, PaymentStatus } from '@packages/types';
import { useState } from 'react';

import { listPaymentTransactions } from '@/services/payments/transactions.service';

export const transactionsQueryKey = ['payment-transactions'] as const;

export type TransactionFilters = {
  status: string;
  method: string;
};

const emptyFilters: TransactionFilters = { status: '', method: '' };

export function usePaymentTransactions() {
  const [draft, setDraft] = useState<TransactionFilters>(emptyFilters);
  const [applied, setApplied] = useState<TransactionFilters>(emptyFilters);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(30);
  const query = useQuery({
    queryKey: [...transactionsQueryKey, page, limit, applied.status, applied.method],
    queryFn: () =>
      listPaymentTransactions({
        page,
        limit,
        status: (applied.status || undefined) as PaymentStatus | undefined,
        method: (applied.method || undefined) as PaymentMethodKind | undefined,
      }),
    placeholderData: keepPreviousData,
  });
  return {
    draft,
    setDraft,
    page,
    setPage,
    limit,
    setLimit: (next: number) => {
      setLimit(next);
      setPage(1);
    },
    apply: () => {
      setApplied(draft);
      setPage(1);
    },
    clear: () => {
      setDraft(emptyFilters);
      setApplied(emptyFilters);
      setPage(1);
    },
    hasActiveFilters: Boolean(applied.status || applied.method),
    query,
  };
}
