'use client';

import { ImportButton } from '@packages/ui/main/MButtons';
import { TableFooter } from '@packages/ui/main/MTable.footer';

import { usePermission } from '@/hooks/use.permission';
import { getApiErrorMessage } from '@/lib/api-error';
import { PlatformPermission } from '@/types/routes';

import { useEmployees, useEmployeeSync } from '../hooks';
import { EmployeesFilters } from './Employees.filters';
import { EmployeesTable } from './Employees.table';

export function EmployeesScreen() {
  const { can } = usePermission();
  const canSync = can(PlatformPermission.EmployeesEdit);
  const employees = useEmployees();
  const { sync } = useEmployeeSync();

  const meta = employees.query.data?.meta;
  const items = employees.query.data?.items ?? [];

  return (
    <div className="min-h-0 flex flex-1 flex-col">
      <div className="gap-3 px-4 py-3 flex items-center justify-between border-b">
        <div>
          <h1 className="text-lg font-semibold">Ажилтнууд</h1>
          <p className="text-sm text-muted-foreground">
            Үндсэн системээс татсан ажилтан, код, тээврийн хэрэгсэл
          </p>
        </div>
        {canSync ? (
          <ImportButton
            text={sync.isPending ? 'Татаж байна…' : 'Ажилтан татах'}
            tooltip={false}
            disabled={sync.isPending}
            onClick={() => sync.mutate()}
          />
        ) : null}
      </div>

      <div className="px-4 pt-4">
        <EmployeesFilters
          values={employees.draft}
          onChange={(key, value) => {
            employees.setDraft((current) => ({
              ...current,
              [key]: value ?? '',
            }));
          }}
          onSearch={employees.applyFilters}
          onClear={employees.clearFilters}
          hasActiveFilters={employees.hasActiveFilters}
        />
      </div>

      <div className="min-h-0 px-4 flex-1 overflow-auto">
        <EmployeesTable
          items={items}
          isLoading={employees.query.isPending}
          errorMessage={
            employees.query.isError ? getApiErrorMessage(employees.query.error) : undefined
          }
          sortBy={employees.sortBy}
          sortDirection={employees.sortDirection}
          onSort={employees.changeSort}
        />
      </div>

      {meta ? (
        <TableFooter
          meta={{
            total: meta.total,
            page: meta.page,
            limit: typeof meta.limit === 'number' ? meta.limit : employees.limit,
            totalPages: meta.totalPages,
          }}
          limit={employees.limit}
          onLimitChange={employees.setLimit}
          onPageChange={employees.setPage}
          isVisible={meta.totalPages > 1}
        />
      ) : null}
    </div>
  );
}
