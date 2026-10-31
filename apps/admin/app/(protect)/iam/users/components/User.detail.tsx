'use client';

import type { UserListItem } from '@packages/types';
import { Button } from '@packages/ui/components/button';
import { toast } from '@packages/ui/components/sonner';
import { DeleteButton, EditButton } from '@packages/ui/main/MButtons';
import { StatusCell } from '@packages/ui/main/Status.cell';
import { useDialog } from '@packages/ui/main/MDialog.context';
import { useQuery } from '@tanstack/react-query';
import { KeyRoundIcon } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';

import { DetailChrome } from '@/layouts/detail.chrome';
import { ADMIN_PATHS } from '@/layouts/routes';
import { usePermission } from '@/hooks/use.permission';
import { getUser } from '@/services/iam/users.service';
import { PlatformPermission } from '@/types/routes';

import { useUserMutate, usersQueryKey } from '../hooks';
import {
  CREATE_STATUS_OPTIONS,
  USER_STATUS_CLASS,
  USER_STATUS_LABELS,
  canMutateUser,
  displayName,
  formatDateTime,
} from '../lib/labels';
import { UserDelete } from './User.delete';
import { UserForm } from './User.form';
import { UserPasswordForm } from './User.password.form';

const FORM_DIALOG_CLASS = 'min-w-[640px] sm:max-w-2xl';

export function UserDetail() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = typeof params.id === 'string' ? params.id : '';
  const { showDialog } = useDialog();
  const { can, user: actor } = usePermission();
  const canEdit = can(PlatformPermission.UsersEdit);
  const canDelete = can(PlatformPermission.UsersDelete);
  const { changeStatus } = useUserMutate();
  const [deleting, setDeleting] = useState<UserListItem | null>(null);

  const query = useQuery({
    queryKey: [...usersQueryKey, 'detail', id],
    queryFn: () => getUser(id),
    enabled: Boolean(id),
  });

  const detail = query.data;
  const editable = detail ? canMutateUser(detail) : false;
  const removable = Boolean(
    detail && editable && detail.id !== actor?.id,
  );

  function handleEdit() {
    if (!detail) {
      return;
    }

    showDialog({
      title: 'Хэрэглэгч засах',
      description: 'Хэрэглэгчийн мэдээллийг шинэчилнэ үү.',
      content: <UserForm mode="edit" user={detail} />,
      class: FORM_DIALOG_CLASS,
    });
  }

  function handleChangePassword() {
    if (!detail) {
      return;
    }

    showDialog({
      title: 'Нууц үг солих',
      description: `${detail.email ?? detail.username} хэрэглэгчийн шинэ нууц үг тохируулна.`,
      content: <UserPasswordForm user={detail} />,
      class: 'min-w-[480px] sm:max-w-lg',
    });
  }

  return (
    <>
      <DetailChrome
        title={detail ? displayName(detail) : 'Хэрэглэгч'}
        subtitle={detail?.email ?? detail?.username ?? undefined}
        backHref={ADMIN_PATHS.users}
        loading={query.isPending}
        error={query.error}
        status={
          detail ? (
            <StatusCell
              value={detail.status}
              labels={USER_STATUS_LABELS}
              classMap={USER_STATUS_CLASS}
              options={CREATE_STATUS_OPTIONS}
              disabled={!canEdit || !editable}
              pending={changeStatus.isPending}
              onChange={(status) => {
                if (status === 'DELETED') {
                  return;
                }

                changeStatus.mutate(
                  { id: detail.id, status },
                  {
                    onSuccess: () => {
                      toast.success('Төлөв шинэчлэгдлээ.');
                    },
                  },
                );
              }}
            />
          ) : null
        }
        actions={
          detail ? (
            <>
              {canEdit && editable ? (
                <Button
                  type="button"
                  variant="outline"
                  className="gap-2"
                  onClick={handleChangePassword}
                >
                  <KeyRoundIcon className="size-4" />
                  Нууц үг солих
                </Button>
              ) : null}
              {canEdit ? (
                <EditButton
                  text="Засах"
                  tooltip={false}
                  disabled={!editable}
                  onClick={handleEdit}
                />
              ) : null}
              {canDelete ? (
                <DeleteButton
                  text="Устгах"
                  tooltip={false}
                  disabled={!removable}
                  onClick={() => setDeleting(detail)}
                />
              ) : null}
            </>
          ) : null
        }
        fields={
          detail
            ? [
                { label: 'Имэйл', value: detail.email ?? '—' },
                { label: 'Нэвтрэх нэр', value: detail.username ?? '—' },
                { label: 'Нэр', value: detail.firstName ?? '—' },
                { label: 'Овог', value: detail.lastName ?? '—' },
                { label: 'Харуулах нэр', value: detail.displayName ?? '—' },
                { label: 'Утас', value: detail.phoneE164 ?? '—' },
                {
                  label: 'Имэйл баталгаажсан',
                  value: detail.emailVerified ? 'Тийм' : 'Үгүй',
                },
                {
                  label: 'MFA',
                  value: detail.mfaEnabled ? 'Тийм' : 'Үгүй',
                },
                {
                  label: 'Сүүлд нэвтэрсэн',
                  value: formatDateTime(detail.lastLoginAt),
                },
                {
                  label: 'Үүссэн',
                  value: formatDateTime(detail.createdAt),
                },
              ]
            : []
        }
      >
        {detail ? (
          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium">Системийн эрх</p>
              <p className="text-xs text-muted-foreground">
                Платформ дээр олгосон үүрэг.
              </p>
            </div>
            {detail.assignments.length === 0 ? (
              <p className="text-sm text-muted-foreground">Эрх олгоогүй.</p>
            ) : (
              <div className="space-y-2">
                {detail.assignments.map((assignment) => (
                  <div
                    key={assignment.id}
                    className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
                  >
                    <span>{assignment.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {assignment.scope === 'PLATFORM'
                        ? 'Платформ'
                        : 'Байгууллага'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : null}
      </DetailChrome>

      <UserDelete
        user={deleting}
        open={Boolean(deleting)}
        onClose={() => {
          const wasDeleting = deleting;
          setDeleting(null);
          if (wasDeleting) {
            router.push(ADMIN_PATHS.users);
          }
        }}
      />
    </>
  );
}
