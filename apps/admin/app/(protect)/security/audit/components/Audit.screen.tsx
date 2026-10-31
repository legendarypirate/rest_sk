'use client';

import { useDialog } from '@packages/ui/main/MDialog.context';
import { TableFooter } from '@packages/ui/main/MTable.footer';
import type { AuditListItem } from '@packages/types';
import type { DateRangeValue } from '@packages/ui/main/MFilters';

import { getApiErrorMessage } from '@/lib/api-error';

import { useAudit } from '../hooks';
import { AuditDetail } from './Audit.detail';
import { AuditFilters } from './Audit.filters';
import { AuditTable } from './Audit.table';

const DETAIL_DIALOG_CLASS = 'min-w-[640px] sm:max-w-2xl';

export function AuditScreen() {
  const { showDialog } = useDialog();
  const audit = useAudit();
  const meta = audit.query.data?.meta;
  const items = audit.query.data?.items ?? [];

  function handleView(item: AuditListItem) {
    showDialog({
      title: 'Аудитын дэлгэрэнгүй',
      description: 'Хэн, юу, хэзээ өөрчилснийг харна.',
      content: <AuditDetail id={item.id} />,
      class: DETAIL_DIALOG_CLASS,
    });
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
        <div>
          <h1 className="text-lg font-semibold">Аудитын бүртгэл</h1>
          <p className="text-sm text-muted-foreground">
            Нэвтрэлт, өөрчлөлт, эрх олголтыг цаг хугацаагаар харна
          </p>
        </div>
      </div>

      <div className="px-4 pt-4">
        <AuditFilters
          values={audit.draft}
          onChange={(key, value) => {
            audit.setDraft((current) => ({
              ...current,
              [key]:
                key === 'createdAt'
                  ? (value as DateRangeValue | undefined)
                  : ((value as string | undefined) ?? ''),
            }));
          }}
          onSearch={audit.applyFilters}
          onClear={audit.clearFilters}
          hasActiveFilters={audit.hasActiveFilters}
        />
      </div>

      <div className="min-h-0 flex-1 overflow-auto px-4">
        <AuditTable
          items={items}
          isLoading={audit.query.isPending}
          errorMessage={
            audit.query.isError
              ? getApiErrorMessage(audit.query.error)
              : undefined
          }
          sortDirection={audit.sortDirection}
          onSort={audit.changeSort}
          onView={handleView}
        />
      </div>

      {meta ? (
        <TableFooter
          meta={{
            total: meta.total,
            page: meta.page,
            limit: typeof meta.limit === 'number' ? meta.limit : audit.limit,
            totalPages: meta.totalPages,
          }}
          limit={audit.limit}
          onLimitChange={audit.setLimit}
          onPageChange={audit.setPage}
          isVisible={meta.totalPages > 1}
        />
      ) : null}
    </div>
  );
}
