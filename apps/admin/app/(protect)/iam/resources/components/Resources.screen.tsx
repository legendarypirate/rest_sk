'use client';

import { CreateButton } from '@packages/ui/main/MButtons';
import { useDialog } from '@packages/ui/main/MDialog.context';
import { TableFooter } from '@packages/ui/main/MTable.footer';
import type { ResourceListItem } from '@packages/types';
import { useState } from 'react';

import { usePermission } from '@/hooks/use.permission';
import { getApiErrorMessage } from '@/lib/api-error';
import { PlatformPermission } from '@/types/routes';

import { useResources } from '../hooks';
import { ResourceDelete } from './Resource.delete';
import { ResourceForm } from './Resource.form';
import { ResourcesFilters } from './Resources.filters';
import { ResourcesTable } from './Resources.table';

const FORM_DIALOG_CLASS = 'min-w-[640px] sm:max-w-2xl';

export function ResourcesScreen() {
  const { showDialog } = useDialog();
  const { can } = usePermission();
  const canWrite = can(PlatformPermission.ResourcesManage);
  const resources = useResources();
  const [deleting, setDeleting] = useState<ResourceListItem | null>(null);

  const meta = resources.query.data?.meta;
  const items = resources.query.data?.items ?? [];

  function handleCreate() {
    showDialog({
      title: 'Цэс үүсгэх',
      description: 'Цэс, зөвшөөрөл үүсгэх модуль бүртгэнэ.',
      content: (
        <ResourceForm mode="add" onSuccess={() => resources.setPage(1)} />
      ),
      class: FORM_DIALOG_CLASS,
    });
  }

  function handleEdit(resource: ResourceListItem) {
    showDialog({
      title: 'Цэс засах',
      description: 'Модулийн цэс, зөвшөөрлийг шинэчилнэ үү.',
      content: <ResourceForm mode="edit" resource={resource} />,
      class: FORM_DIALOG_CLASS,
    });
  }

  return (
    <div className="min-h-0 flex flex-1 flex-col">
      <div className="gap-3 px-4 py-3 flex items-center justify-between border-b">
        <div>
          <h1 className="text-lg font-semibold">Цэс</h1>
          <p className="text-sm text-muted-foreground">
            Админ цэс, IAM зөвшөөрлийг динамикаар удирдана
          </p>
        </div>
        {canWrite ? (
          <CreateButton
            text="Цэс нэмэх"
            tooltip={false}
            onClick={handleCreate}
          />
        ) : null}
      </div>

      <div className="px-4 pt-4">
        <ResourcesFilters
          values={resources.draft}
          onChange={(key, value) => {
            resources.setDraft((current) => ({
              ...current,
              [key]: key === 'includeDeleted' ? Boolean(value) : (value ?? ''),
            }));
          }}
          onSearch={resources.applyFilters}
          onClear={resources.clearFilters}
          hasActiveFilters={resources.hasActiveFilters}
        />
      </div>

      <div className="min-h-0 px-4 flex-1 overflow-auto">
        <ResourcesTable
          items={items}
          isLoading={resources.query.isPending}
          errorMessage={
            resources.query.isError
              ? getApiErrorMessage(resources.query.error)
              : undefined
          }
          sortBy={resources.sortBy}
          sortDirection={resources.sortDirection}
          onSort={resources.changeSort}
          canWrite={canWrite}
          onEdit={handleEdit}
          onDelete={setDeleting}
        />
      </div>

      {meta ? (
        <TableFooter
          meta={{
            total: meta.total,
            page: meta.page,
            limit:
              typeof meta.limit === 'number' ? meta.limit : resources.limit,
            totalPages: meta.totalPages,
          }}
          limit={resources.limit}
          onLimitChange={resources.setLimit}
          onPageChange={resources.setPage}
          isVisible={meta.totalPages > 1}
        />
      ) : null}

      <ResourceDelete
        resource={deleting}
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
      />
    </div>
  );
}
