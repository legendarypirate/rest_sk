'use client';

import { toast } from '@packages/ui/components/sonner';
import {
  BackButton,
  CancelButton,
  SaveButton,
} from '@packages/ui/main/MButtons';
import { isPlatformSuperAdminRole } from '@packages/types';
import { cn } from '@packages/ui/lib/utils';
import { useParams, useRouter } from 'next/navigation';

import { getApiErrorMessage } from '@/lib/api-error';
import { ADMIN_PATHS } from '@/layouts/routes';
import { DocumentTitle } from '@/layouts/document.title';
import { usePermission } from '@/hooks/use.permission';
import { PlatformPermission } from '@/types/routes';

import { useRoleMutate, useRoleResources } from '../hooks';
import { ROLE_SCOPE_LABELS, canAssignRolePermissions } from '../lib/labels';
import { RoleResourcesFilters } from './Role.resources.filters';
import { RoleResourcesMatrix } from './Role.resources.matrix';

function RoleBadge({
  children,
  className,
}: {
  children: string;
  className?: string;
}) {
  return (
    <span
      className={cn('px-2 py-0.5 text-xs font-medium rounded-full', className)}
    >
      {children}
    </span>
  );
}

export function RoleResourcesScreen() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const roleId = typeof params.id === 'string' ? params.id : '';
  const { can } = usePermission();
  const canWrite = can(PlatformPermission.RolesManage);
  const { replacePermissions } = useRoleMutate();
  const resources = useRoleResources(roleId);

  const role = resources.role;
  const isSuperAdmin = isPlatformSuperAdminRole(role?.slug ?? '');
  const isSystem = Boolean(role?.isSystem);
  const isDeleted = Boolean(role?.deletedAt);
  const assignable = role ? canAssignRolePermissions(role) : false;
  const readOnly =
    !canWrite ||
    !assignable ||
    isSystem ||
    isDeleted ||
    isSuperAdmin ||
    replacePermissions.isPending;
  const catalogPermissionIds = resources.matrix.rows.flatMap((row) =>
    Object.values(row.cells).map((cell) => cell.id),
  );
  const selectedIds = isSuperAdmin
    ? catalogPermissionIds
    : resources.selectedIds;
  const totalPermissions = catalogPermissionIds.length;

  async function handleSave() {
    if (!role || readOnly) {
      return;
    }

    try {
      await replacePermissions.mutateAsync({
        id: role.id,
        permissionIds: resources.selectedIds,
      });
      toast.success('Зөвшөөрлийг хадгаллаа');
      resources.markSaved();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  }

  if (resources.roleQuery.isPending) {
    return (
      <div className="min-h-0 text-sm flex flex-1 items-center justify-center text-muted-foreground">
        Уншиж байна…
      </div>
    );
  }

  if (resources.roleQuery.error || !role) {
    return (
      <div className="min-h-0 flex flex-1 flex-col">
        <div className="gap-3 px-4 py-3 flex items-center border-b">
          <BackButton
            text="Системийн эрх"
            tooltip={false}
            onClick={() => router.push(ADMIN_PATHS.roles)}
          />
        </div>
        <div className="text-sm flex flex-1 items-center justify-center text-destructive">
          {resources.roleQuery.error
            ? getApiErrorMessage(resources.roleQuery.error)
            : 'Системийн эрх олдсонгүй.'}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-0 flex flex-1 flex-col">
      <DocumentTitle title={`${role.name} · Зөвшөөрөл`} />

      <div className="gap-3 px-4 py-3 lg:flex-row lg:items-center lg:justify-between flex flex-col border-b">
        <div className="gap-3 min-w-0 flex items-start">
          <BackButton
            size="icon"
            text={false}
            tooltip="Системийн эрхийн жагсаалт"
            onClick={() => router.push(ADMIN_PATHS.roles)}
          />
          <div className="min-w-0">
            <div className="gap-2 flex flex-wrap items-center">
              <h1 className="text-lg font-semibold">{role.name}</h1>
              <RoleBadge className="bg-muted text-muted-foreground">
                {ROLE_SCOPE_LABELS[role.scope]}
              </RoleBadge>
              {role.isSystem ? (
                <RoleBadge className="bg-muted text-muted-foreground">
                  систем
                </RoleBadge>
              ) : null}
              {isSuperAdmin ? (
                <RoleBadge className="bg-primary/10 text-primary">
                  бүх эрх
                </RoleBadge>
              ) : null}
              {role.isDefault ? (
                <RoleBadge className="bg-primary/10 text-primary">
                  анхны
                </RoleBadge>
              ) : null}
              {resources.dirty ? (
                <RoleBadge className="bg-amber-500/15 text-amber-700 dark:text-amber-400">
                  хадгалаагүй
                </RoleBadge>
              ) : null}
            </div>
            <p className="text-sm text-muted-foreground">
              {role.slug} ·{' '}
              {isSuperAdmin
                ? 'Бүх зөвшөөрөл'
                : `${selectedIds.length}/${totalPermissions} зөвшөөрөл`}
            </p>
          </div>
        </div>

        {isSuperAdmin ? null : (
          <div className="gap-2 flex shrink-0 items-center justify-end">
            <CancelButton
              text="Сэргээх"
              tooltip="Олгосон зөвшөөрлийг буцаах"
              disabled={readOnly || !resources.dirty}
              onClick={resources.reset}
            />
            <SaveButton
              text={
                replacePermissions.isPending ? 'Хадгалж байна…' : 'Хадгалах'
              }
              tooltip={false}
              disabled={readOnly || !resources.dirty}
              onClick={() => void handleSave()}
            />
          </div>
        )}
      </div>

      {isSuperAdmin ? (
        <div className="px-4 py-2 text-sm border-b bg-muted/40 text-muted-foreground">
          Platform Super Admin систем дээр бүх эрхтэй. Зөвшөөрөл оноох
          шаардлагагүй.
        </div>
      ) : isSystem ? (
        <div className="px-4 py-2 text-sm border-b bg-muted/40 text-muted-foreground">
          Системийн үүргийн зөвшөөрлийг өөрчлөх боломжгүй.
        </div>
      ) : null}

      <div className="px-4 pt-4">
        <RoleResourcesFilters
          values={resources.draft}
          groupOptions={resources.groupOptions}
          onChange={(key, value) => {
            resources.setDraft((current) => ({
              ...current,
              [key]:
                key === 'grantedOnly'
                  ? Boolean(value)
                  : ((value as string) ?? ''),
            }));
          }}
          onSearch={resources.applyFilters}
          onClear={resources.clearFilters}
          hasActiveFilters={resources.hasActiveFilters}
        />
      </div>

      <div className="min-h-0 px-4 flex-1 overflow-auto">
        <RoleResourcesMatrix
          matrix={resources.visible}
          selectedIds={selectedIds}
          isLoading={resources.catalogQuery.isPending}
          errorMessage={
            resources.catalogQuery.isError
              ? getApiErrorMessage(resources.catalogQuery.error)
              : undefined
          }
          disabled={readOnly}
          onToggle={resources.setPermission}
          onToggleMany={resources.setPermissions}
        />
      </div>
    </div>
  );
}
