'use client';

import { MFilters } from '@packages/ui/main/MFilters';

import type { TransactionFilters } from '../hooks';
import { PAYMENT_METHOD_OPTIONS, PAYMENT_STATUS_OPTIONS } from '../lib/labels';

export function TransactionsFilters({
  values,
  onChange,
  onSearch,
  onClear,
  hasActiveFilters,
}: {
  values: TransactionFilters;
  onChange: (key: string, value: unknown) => void;
  onSearch: () => void;
  onClear: () => void;
  hasActiveFilters: boolean;
}) {
  return (
    <MFilters
      title="Төлбөр хайх"
      values={values}
      onChange={onChange}
      onSearch={onSearch}
      onClear={onClear}
      hasActiveFilters={hasActiveFilters}
      fields={[
        {
          key: 'status',
          type: 'select',
          label: 'Төлөв',
          placeholder: 'Бүгд',
          options: PAYMENT_STATUS_OPTIONS,
        },
        {
          key: 'method',
          type: 'select',
          label: 'Хэлбэр',
          placeholder: 'Бүгд',
          options: PAYMENT_METHOD_OPTIONS,
        },
      ]}
    />
  );
}
