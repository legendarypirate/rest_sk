'use client';

import { TableFooter } from '@packages/ui/main/MTable.footer';

import { getApiErrorMessage } from '@/lib/api-error';

import { usePaymentTransactions } from '../hooks';
import { TransactionsFilters } from './Transactions.filters';
import { TransactionsTable } from './Transactions.table';

export function TransactionsScreen() {
  const list = usePaymentTransactions();
  const items = list.query.data?.items ?? [];
  const meta = list.query.data?.meta;

  return (
    <div className="min-h-0 flex flex-1 flex-col">
      <div className="gap-3 px-4 py-3 flex items-center justify-between border-b">
        <div>
          <h1 className="text-lg font-semibold">Төлбөр</h1>
          <p className="text-sm text-muted-foreground">
            Төлсөн, төлөөгүй, амжилтгүй төлбөрийг энд харна
          </p>
        </div>
      </div>
      <div className="px-4 pt-4">
        <TransactionsFilters
          values={list.draft}
          onChange={(key, value) => {
            list.setDraft((current) => ({
              ...current,
              [key]: String(value ?? ''),
            }));
          }}
          onSearch={list.apply}
          onClear={list.clear}
          hasActiveFilters={list.hasActiveFilters}
        />
      </div>
      <div className="min-h-0 px-4 flex-1 overflow-auto">
        <TransactionsTable
          items={items}
          isLoading={list.query.isPending}
          errorMessage={list.query.isError ? getApiErrorMessage(list.query.error) : undefined}
        />
      </div>
      {meta ? (
        <TableFooter
          meta={{
            total: meta.total,
            page: meta.page,
            limit: typeof meta.limit === 'number' ? meta.limit : list.limit,
            totalPages: meta.totalPages,
          }}
          limit={list.limit}
          onLimitChange={list.setLimit}
          onPageChange={list.setPage}
          isVisible={meta.totalPages > 1}
        />
      ) : null}
    </div>
  );
}
