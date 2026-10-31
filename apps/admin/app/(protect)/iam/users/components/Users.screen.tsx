'use client';

import { toast } from '@packages/ui/components/sonner';
import { CreateButton } from '@packages/ui/main/MButtons';
import { useDialog } from '@packages/ui/main/MDialog.context';
import { TableFooter } from '@packages/ui/main/MTable.footer';
import type { UserListItem, UserStatus } from '@packages/types';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { usePermission } from '@/hooks/use.permission';
import { getApiErrorMessage } from '@/lib/api-error';
import { ADMIN_PATHS, adminDetailPath } from '@/layouts/routes';
import { PlatformPermission } from '@/types/routes';

import { useUserMutate, useUsers } from '../hooks';
import { UserDelete } from './User.delete';
import { UserForm } from './User.form';
import { UsersFilters } from './Users.filters';
import { UsersTable } from './Users.table';

const FORM_DIALOG_CLASS = 'min-w-[640px] sm:max-w-2xl';

export function UsersScreen() {
  const router = useRouter();
  const { showDialog } = useDialog();
  const { can, user: actor } = usePermission();
  const canAdd = can(PlatformPermission.UsersAdd);
  const canEdit = can(PlatformPermission.UsersEdit);
  const canDelete = can(PlatformPermission.UsersDelete);
  const users = useUsers();
  const { changeStatus } = useUserMutate();
  const [deleting, setDeleting] = useState<UserListItem | null>(null);

  const meta = users.query.data?.meta;
  const items = users.query.data?.items ?? [];

  function handleCreate() {
    showDialog({
      title: 'Хэрэглэгч үүсгэх',
      description: 'Платформд нэвтрэх эрхтэй хэрэглэгч бүртгэнэ.',
      content: <UserForm mode="add" onSuccess={() => users.setPage(1)} />,
      class: FORM_DIALOG_CLASS,
    });
  }

  function handleEdit(user: UserListItem) {
    showDialog({
      title: 'Хэрэглэгч засах',
      description: 'Хэрэглэгчийн мэдээллийг шинэчилнэ үү.',
      content: <UserForm mode="edit" user={user} />,
      class: FORM_DIALOG_CLASS,
    });
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
        <div>
          <h1 className="text-lg font-semibold">Хэрэглэгчид</h1>
          <p className="text-sm text-muted-foreground">
            Платформын хэрэглэгчдийг харах, үүсгэх, засах
          </p>
        </div>
        {canAdd ? (
          <CreateButton
            text="Хэрэглэгч нэмэх"
            tooltip={false}
            onClick={handleCreate}
          />
        ) : null}
      </div>

      <div className="px-4 pt-4">
        <UsersFilters
          values={users.draft}
          onChange={(key, value) => {
            users.setDraft((current) => ({
              ...current,
              [key]: key === 'includeDeleted' ? Boolean(value) : (value ?? ''),
            }));
          }}
          onSearch={users.applyFilters}
          onClear={users.clearFilters}
          hasActiveFilters={users.hasActiveFilters}
        />
      </div>

      <div className="min-h-0 flex-1 overflow-auto px-4">
        <UsersTable
          items={items}
          isLoading={users.query.isPending}
          errorMessage={
            users.query.isError ? getApiErrorMessage(users.query.error) : undefined
          }
          sortBy={users.sortBy}
          sortDirection={users.sortDirection}
          onSort={users.changeSort}
          canEdit={canEdit}
          canDelete={canDelete}
          currentUserId={actor?.id}
          statusPending={changeStatus.isPending}
          onView={(user) => {
            router.push(adminDetailPath(ADMIN_PATHS.users, user.id));
          }}
          onEdit={handleEdit}
          onDelete={setDeleting}
          onStatusChange={(user, status: UserStatus) => {
            if (status === user.status || status === 'DELETED') {
              return;
            }

            changeStatus.mutate(
              { id: user.id, status },
              {
                onSuccess: () => {
                  toast.success('Төлөв шинэчлэгдлээ.');
                },
              },
            );
          }}
        />
      </div>

      {meta ? (
        <TableFooter
          meta={{
            total: meta.total,
            page: meta.page,
            limit: typeof meta.limit === 'number' ? meta.limit : users.limit,
            totalPages: meta.totalPages,
          }}
          limit={users.limit}
          onLimitChange={users.setLimit}
          onPageChange={users.setPage}
          isVisible={meta.totalPages > 1}
        />
      ) : null}

      <UserDelete
        user={deleting}
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
      />
    </div>
  );
}
