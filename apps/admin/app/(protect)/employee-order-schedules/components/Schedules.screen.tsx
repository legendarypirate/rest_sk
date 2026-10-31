'use client';

import { CreateButton } from '@packages/ui/main/MButtons';
import { useDialog } from '@packages/ui/main/MDialog.context';
import { TableFooter } from '@packages/ui/main/MTable.footer';
import type { EmployeeOrderScheduleItem } from '@packages/types';
import { useState } from 'react';

import { usePermission } from '@/hooks/use.permission';
import { getApiErrorMessage } from '@/lib/api-error';
import { PlatformPermission } from '@/types/routes';

import { useSchedules } from '../hooks';
import { ScheduleDelete } from './Schedule.delete';
import { ScheduleForm } from './Schedule.form';
import { SchedulesTable } from './Schedules.table';

const FORM_DIALOG_CLASS = 'min-w-[640px] sm:max-w-2xl';

export function SchedulesScreen() {
  const { showDialog } = useDialog();
  const { can } = usePermission();
  const list = useSchedules();
  const [deleting, setDeleting] = useState<EmployeeOrderScheduleItem | null>(null);
  const items = list.query.data?.items ?? [];
  const meta = list.query.data?.meta;

  function openForm(item?: EmployeeOrderScheduleItem) {
    showDialog({
      title: item ? 'Захиалгын цаг засах' : 'Захиалгын цаг бүртгэх',
      content: <ScheduleForm mode={item ? 'edit' : 'add'} item={item} />,
      class: FORM_DIALOG_CLASS,
    });
  }

  return (
    <div className="min-h-0 flex flex-1 flex-col">
      <div className="gap-3 px-4 py-3 flex items-center justify-between border-b">
        <div>
          <h1 className="text-lg font-semibold">Захиалгын цаг</h1>
          <p className="text-sm text-muted-foreground">Зөвхөн энэ интервалд захиалга авна</p>
        </div>
        {can(PlatformPermission.EmployeeOrderSchedulesAdd) ? (
          <CreateButton text="Бүртгэх" tooltip={false} onClick={() => openForm()} />
        ) : null}
      </div>
      <div className="min-h-0 px-4 flex-1 overflow-auto">
        <SchedulesTable
          items={items}
          isLoading={list.query.isPending}
          errorMessage={list.query.isError ? getApiErrorMessage(list.query.error) : undefined}
          canEdit={can(PlatformPermission.EmployeeOrderSchedulesEdit)}
          canDelete={can(PlatformPermission.EmployeeOrderSchedulesDelete)}
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
      <ScheduleDelete item={deleting} open={Boolean(deleting)} onClose={() => setDeleting(null)} />
    </div>
  );
}
