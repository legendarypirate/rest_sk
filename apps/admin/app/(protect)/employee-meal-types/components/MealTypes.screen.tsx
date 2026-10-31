'use client';

import { CreateButton } from '@packages/ui/main/MButtons';
import { useDialog } from '@packages/ui/main/MDialog.context';
import { TableFooter } from '@packages/ui/main/MTable.footer';
import type { EmployeeMealTypeItem } from '@packages/types';
import { useState } from 'react';

import { usePermission } from '@/hooks/use.permission';
import { getApiErrorMessage } from '@/lib/api-error';
import { PlatformPermission } from '@/types/routes';

import { useMealTypes } from '../hooks';
import { MealTypeDelete } from './MealType.delete';
import { MealTypeForm } from './MealType.form';
import { MealTypesFilters } from './MealTypes.filters';
import { MealTypesTable } from './MealTypes.table';

export function MealTypesScreen() {
  const { showDialog } = useDialog();
  const { can } = usePermission();
  const list = useMealTypes();
  const [deleting, setDeleting] = useState<EmployeeMealTypeItem | null>(null);
  const items = list.query.data?.items ?? [];
  const meta = list.query.data?.meta;

  return (
    <div className="min-h-0 flex flex-1 flex-col">
      <div className="gap-3 px-4 py-3 flex items-center justify-between border-b">
        <div>
          <h1 className="text-lg font-semibold">Хоолны төрөл</h1>
          <p className="text-sm text-muted-foreground">Өдрийн болон оройн хоол</p>
        </div>
        {can(PlatformPermission.EmployeeMealTypesAdd) ? (
          <CreateButton
            text="Бүртгэх"
            tooltip={false}
            onClick={() =>
              showDialog({
                title: 'Хоолны төрөл бүртгэх',
                content: <MealTypeForm mode="add" onSuccess={() => list.setPage(1)} />,
              })
            }
          />
        ) : null}
      </div>
      <div className="px-4 pt-4">
        <MealTypesFilters
          search={list.search}
          onSearchChange={list.setSearch}
          onSearch={list.apply}
          onClear={list.clear}
          hasActiveFilters={list.hasActiveFilters}
        />
      </div>
      <div className="min-h-0 px-4 flex-1 overflow-auto">
        <MealTypesTable
          items={items}
          isLoading={list.query.isPending}
          errorMessage={list.query.isError ? getApiErrorMessage(list.query.error) : undefined}
          canEdit={can(PlatformPermission.EmployeeMealTypesEdit)}
          canDelete={can(PlatformPermission.EmployeeMealTypesDelete)}
          onEdit={(item) =>
            showDialog({
              title: 'Хоолны төрөл засах',
              content: <MealTypeForm mode="edit" item={item} />,
            })
          }
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
      <MealTypeDelete item={deleting} open={Boolean(deleting)} onClose={() => setDeleting(null)} />
    </div>
  );
}
