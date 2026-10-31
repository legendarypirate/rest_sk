'use client';

import type { PaymentTransactionItem } from '@packages/types';
import { StatusCell } from '@packages/ui/main/Status.cell';
import {
  MTable,
  MTableBody,
  MTableCell,
  MTableHead,
  MTableHeader,
  MTableRow,
} from '@packages/ui/main/MTable';
import { MTableEmpty } from '@packages/ui/main/MTable.empty';
import { MTableSkeleton } from '@packages/ui/main/MTableSkeleton';

import { Icons } from '@/utils/icons';

import {
  formatAmount,
  formatDateTime,
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_CLASS,
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUS_OPTIONS,
} from '../lib/labels';

export function TransactionsTable({
  items,
  isLoading,
  errorMessage,
}: {
  items: PaymentTransactionItem[];
  isLoading: boolean;
  errorMessage?: string;
}) {
  if (isLoading && items.length === 0) return <MTableSkeleton />;
  if (errorMessage) {
    return (
      <div className="min-h-48 text-sm flex items-center justify-center text-destructive">
        {errorMessage}
      </div>
    );
  }
  if (items.length === 0) {
    return <MTableEmpty icon={Icons.payments} text="Төлбөр олдсонгүй." />;
  }
  return (
    <MTable>
      <MTableHeader>
        <MTableRow>
          <MTableHead>Огноо</MTableHead>
          <MTableHead>Хэлбэр</MTableHead>
          <MTableHead>Дүн</MTableHead>
          <MTableHead>Төлөв</MTableHead>
          <MTableHead>Алдаа</MTableHead>
        </MTableRow>
      </MTableHeader>
      <MTableBody>
        {items.map((item) => (
          <MTableRow key={item.id}>
            <MTableCell>{formatDateTime(item.createdAt)}</MTableCell>
            <MTableCell>{PAYMENT_METHOD_LABELS[item.method]}</MTableCell>
            <MTableCell className="tabular-nums">{formatAmount(item.amount, item.currency)}</MTableCell>
            <MTableCell>
              <StatusCell
                value={item.status}
                labels={PAYMENT_STATUS_LABELS}
                classMap={PAYMENT_STATUS_CLASS}
                options={PAYMENT_STATUS_OPTIONS}
                disabled
              />
            </MTableCell>
            <MTableCell className="max-w-64 truncate text-muted-foreground">
              {item.failureMessage ?? '—'}
            </MTableCell>
          </MTableRow>
        ))}
      </MTableBody>
    </MTable>
  );
}
