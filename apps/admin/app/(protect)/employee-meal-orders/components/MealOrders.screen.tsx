'use client';

import type { DateRangeValue } from '@packages/ui/main/MFilters';
import { ExportButton } from '@packages/ui/main/MButtons';
import { TableFooter } from '@packages/ui/main/MTable.footer';
import { toast } from '@packages/ui/components/sonner';
import type { EmployeeMealOrderItem, EmployeeMealOrderStatus } from '@packages/types';
import { useState } from 'react';

import { usePermission } from '@/hooks/use.permission';
import { getApiErrorMessage } from '@/lib/api-error';
import { PlatformPermission } from '@/types/routes';

import { useMealOrderMutate, useMealOrders } from '../hooks';
import { exportMealOrders } from '../lib/export';
import { MealOrdersFilters } from './MealOrders.filters';
import { MealOrdersTable } from './MealOrders.table';

export function MealOrdersScreen() {
  const { can } = usePermission();
  const list = useMealOrders();
  const { update } = useMealOrderMutate();
  const [exporting, setExporting] = useState(false);
  const items = list.query.data?.items ?? [];
  const meta = list.query.data?.meta;

  function changeStatus(item: EmployeeMealOrderItem, status: EmployeeMealOrderStatus) {
    update.mutate({ id: item.id, dto: { status } });
  }

  return (
    <div className="min-h-0 flex flex-1 flex-col">
      <div className="gap-3 px-4 py-3 flex items-center justify-between border-b">
        <div>
          <h1 className="text-lg font-semibold">Хоолны захиалга</h1>
          <p className="text-sm text-muted-foreground">Өнөөдрийн захиалга. Огноогоор шүүж болно</p>
        </div>
        <ExportButton
          text={exporting ? 'Экспортлож байна…' : 'Экспорт'}
          tooltip={false}
          disabled={exporting}
          onClick={() => {
            setExporting(true);
            void exportMealOrders({ from: list.from, to: list.to, search: list.search })
              .catch((error) => toast.error(getApiErrorMessage(error)))
              .finally(() => setExporting(false));
          }}
        />
      </div>
      <div className="px-4 pt-4">
        <MealOrdersFilters
          values={list.draft}
          onChange={(key, value) => {
            list.setDraft((current) => ({
              ...current,
              [key]:
                key === 'serviceDate'
                  ? (value as DateRangeValue | undefined)
                  : String(value ?? ''),
            }));
          }}
          onSearch={list.apply}
          onClear={list.clear}
          hasActiveFilters={list.hasActiveFilters}
        />
      </div>
      <div className="min-h-0 px-4 flex-1 overflow-auto">
        <MealOrdersTable
          items={items}
          isLoading={list.query.isPending}
          errorMessage={list.query.isError ? getApiErrorMessage(list.query.error) : undefined}
          canEdit={can(PlatformPermission.EmployeeMealOrdersEdit)}
          statusPending={update.isPending}
          onStatus={changeStatus}
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
