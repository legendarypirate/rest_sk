'use client';

import { CreateButton } from '@packages/ui/main/MButtons';
import { useDialog } from '@packages/ui/main/MDialog.context';
import { TableFooter } from '@packages/ui/main/MTable.footer';
import type { RoleListItem } from '@packages/types';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { usePermission } from '@/hooks/use.permission';
import { getApiErrorMessage } from '@/lib/api-error';
import { roleResourcesPath } from '@/layouts/routes';
import { PlatformPermission } from '@/types/routes';

import { useRoles } from '../hooks';
import { RoleDelete } from './Role.delete';
import { RoleForm } from './Role.form';
import { RolesFilters } from './Roles.filters';
import { RolesTable } from './Roles.table';

const FORM_DIALOG_CLASS = 'min-w-[640px] sm:max-w-2xl';

export function RolesScreen() {
  const router = useRouter();
  const { showDialog } = useDialog();
  const { can } = usePermission();
  const canWrite = can(PlatformPermission.RolesManage);
  const roles = useRoles();
  const [deleting, setDeleting] = useState<RoleListItem | null>(null);

  const meta = roles.query.data?.meta;
  const items = roles.query.data?.items ?? [];

  function handleCreate() {
    showDialog({
      title: 'Системийн эрх үүсгэх',
      description: 'Платформын эрх бүхий системийн эрх бүртгэнэ.',
      content: <RoleForm mode="add" onSuccess={() => roles.setPage(1)} />,
      class: FORM_DIALOG_CLASS,
    });
  }

  function handleEdit(role: RoleListItem) {
    showDialog({
      title: 'Системийн эрх засах',
      description: 'Системийн эрхийн мэдээллийг шинэчилнэ үү.',
      content: <RoleForm mode="edit" role={role} />,
      class: FORM_DIALOG_CLASS,
    });
  }

  return (
    <div className="min-h-0 flex flex-1 flex-col">
      <div className="gap-3 px-4 py-3 flex items-center justify-between border-b">
        <div>
          <h1 className="text-lg font-semibold">Системийн эрх</h1>
          <p className="text-sm text-muted-foreground">
            Платформын системийн эрх, зөвшөөрлийг харах, үүсгэх, засах
          </p>
        </div>
        {canWrite ? (
          <CreateButton
            text="Системийн эрх нэмэх"
            tooltip={false}
            onClick={handleCreate}
          />
        ) : null}
      </div>

      <div className="px-4 pt-4">
        <RolesFilters
          values={roles.draft}
          onChange={(key, value) => {
            roles.setDraft((current) => ({
              ...current,
              [key]: key === 'includeDeleted' ? Boolean(value) : (value ?? ''),
            }));
          }}
          onSearch={roles.applyFilters}
          onClear={roles.clearFilters}
          hasActiveFilters={roles.hasActiveFilters}
        />
      </div>

      <div className="min-h-0 px-4 flex-1 overflow-auto">
        <RolesTable
          items={items}
          isLoading={roles.query.isPending}
          errorMessage={
            roles.query.isError
              ? getApiErrorMessage(roles.query.error)
              : undefined
          }
          sortBy={roles.sortBy}
          sortDirection={roles.sortDirection}
          onSort={roles.changeSort}
          canWrite={canWrite}
          onEdit={handleEdit}
          onPermissions={(role) => router.push(roleResourcesPath(role.id))}
          onDelete={setDeleting}
        />
      </div>

      {meta ? (
        <TableFooter
          meta={{
            total: meta.total,
            page: meta.page,
            limit: typeof meta.limit === 'number' ? meta.limit : roles.limit,
            totalPages: meta.totalPages,
          }}
          limit={roles.limit}
          onLimitChange={roles.setLimit}
          onPageChange={roles.setPage}
          isVisible={meta.totalPages > 1}
        />
      ) : null}

      <RoleDelete
        role={deleting}
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
      />
    </div>
  );
}
