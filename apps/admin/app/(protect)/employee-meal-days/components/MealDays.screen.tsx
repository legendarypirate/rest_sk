'use client';

import { CreateButton } from '@packages/ui/main/MButtons';
import { useDialog } from '@packages/ui/main/MDialog.context';
import { TableFooter } from '@packages/ui/main/MTable.footer';
import type { DateRangeValue } from '@packages/ui/main/MFilters';
import type { EmployeeMealDayItem } from '@packages/types';
import { useState } from 'react';

import { usePermission } from '@/hooks/use.permission';
import { getApiErrorMessage } from '@/lib/api-error';
import { PlatformPermission } from '@/types/routes';

import { useMealDays } from '../hooks';
import { MealDayDelete } from './MealDay.delete';
import { MealDayForm } from './MealDay.form';
import { MealDaysFilters } from './MealDays.filters';
import { MealDaysTable } from './MealDays.table';

export function MealDaysScreen() {
  const { showDialog } = useDialog();
  const { can } = usePermission();
  const list = useMealDays();
  const [deleting, setDeleting] = useState<EmployeeMealDayItem | null>(null);
  const items = list.query.data?.items ?? [];
  const meta = list.query.data?.meta;

  function openForm(item?: EmployeeMealDayItem) {
    showDialog({
      title: item ? 'Өдрийн хоол засах' : 'Өдрийн хоол бүртгэх',
      content: <MealDayForm mode={item ? 'edit' : 'add'} item={item} />,
    });
  }

  return (
    <div className="min-h-0 flex flex-1 flex-col">
      <div className="gap-3 px-4 py-3 flex items-center justify-between border-b">
        <div>
          <h1 className="text-lg font-semibold">Өдрийн хоол</h1>
          <p className="text-sm text-muted-foreground">Тухайн өдрийн порцын тоо захиалгаас гарна</p>
        </div>
        {can(PlatformPermission.EmployeeMealDaysAdd) ? (
          <CreateButton text="Бүртгэх" tooltip={false} onClick={() => openForm()} />
        ) : null}
      </div>
      <div className="px-4 pt-4">
        <MealDaysFilters
          values={list.draft}
          onChange={(key, value) => {
            list.setDraft((current) => ({
              ...current,
              [key]: key === 'serviceDate' ? (value as DateRangeValue | undefined) : value,
            }));
          }}
          onSearch={list.apply}
          onClear={list.clear}
          hasActiveFilters={list.hasActiveFilters}
        />
      </div>
      <div className="min-h-0 px-4 flex-1 overflow-auto">
        <MealDaysTable
          items={items}
          isLoading={list.query.isPending}
          errorMessage={list.query.isError ? getApiErrorMessage(list.query.error) : undefined}
          canEdit={can(PlatformPermission.EmployeeMealDaysEdit)}
          canDelete={can(PlatformPermission.EmployeeMealDaysDelete)}
          onEdit={openForm}
          onDelete={setDeleting}
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
      <MealDayDelete item={deleting} open={Boolean(deleting)} onClose={() => setDeleting(null)} />
    </div>
  );
}
