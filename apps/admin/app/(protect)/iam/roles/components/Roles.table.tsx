'use client';

import { cn } from '@packages/ui/lib/utils';
import {
  DeleteButton,
  EditButton,
  PermissionsButton,
} from '@packages/ui/main/MButtons';
import {
  MTable,
  MTableBody,
  MTableCell,
  MTableHead,
  MTableHeader,
  MTableRow,
} from '@packages/ui/main/MTable';
import { SortHead } from '@packages/ui/main/MTable.helper';
import { MTableSkeleton } from '@packages/ui/main/MTableSkeleton';
import { MTableEmpty } from '@packages/ui/main/MTable.empty';
import { isPlatformSuperAdminRole, type RoleListItem } from '@packages/types';
import Link from 'next/link';

import { roleResourcesPath } from '@/layouts/routes';
import { Icons } from '@/utils/icons';
import type { ListRolesQueryDto } from '@/types/iam/role.dto';

import {
  ROLE_SCOPE_LABELS,
  canDeleteRole,
  canMutateRole,
  formatDateTime,
} from '../lib/labels';

type RolesTableProps = {
  items: RoleListItem[];
  isLoading: boolean;
  errorMessage?: string;
  sortBy: NonNullable<ListRolesQueryDto['sortBy']>;
  sortDirection: NonNullable<ListRolesQueryDto['sortDirection']>;
  onSort: (field: NonNullable<ListRolesQueryDto['sortBy']>) => void;
  canWrite: boolean;
  onEdit: (role: RoleListItem) => void;
  onPermissions: (role: RoleListItem) => void;
  onDelete: (role: RoleListItem) => void;
};

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

export function RolesTable({
  items,
  isLoading,
  errorMessage,
  sortBy,
  sortDirection,
  onSort,
  canWrite,
  onEdit,
  onPermissions,
  onDelete,
}: RolesTableProps) {
  if (isLoading && items.length === 0) {
    return <MTableSkeleton />;
  }

  if (errorMessage) {
    return (
      <div className="min-h-48 text-sm flex items-center justify-center text-destructive">
        {errorMessage}
      </div>
    );
  }

  if (items.length === 0) {
    return <MTableEmpty icon={Icons.roles} text="Системийн эрх олдсонгүй." />;
  }

  return (
    <MTable>
      <MTableHeader>
        <MTableRow>
          <MTableHead className="w-32">Үйлдэл</MTableHead>
          <SortHead
            field="name"
            label="Нэр"
            sortBy={sortBy}
            sortOrder={sortDirection}
            onSort={onSort}
          />
          <SortHead
            field="slug"
            label="Холбоос"
            sortBy={sortBy}
            sortOrder={sortDirection}
            onSort={onSort}
          />
          <MTableHead>Хүрээ</MTableHead>
          <SortHead
            field="priority"
            label="Эрэмбэ"
            sortBy={sortBy}
            sortOrder={sortDirection}
            onSort={onSort}
          />
          <MTableHead>Хэрэглэгч</MTableHead>
          <MTableHead>Зөвшөөрөл</MTableHead>
          <SortHead
            field="createdAt"
            label="Үүссэн"
            sortBy={sortBy}
            sortOrder={sortDirection}
            onSort={onSort}
          />
        </MTableRow>
      </MTableHeader>
      <MTableBody>
        {items.map((role) => {
            const mutable = canMutateRole(role);
            const removable = canDeleteRole(role);

            return (
              <MTableRow key={role.id}>
                <MTableCell>
                  <div className="flex gap-1">
                    <PermissionsButton
                      size="icon"
                      text={false}
                      disabled={isPlatformSuperAdminRole(role.slug)}
                      tooltip={
                        isPlatformSuperAdminRole(role.slug)
                          ? 'Энэ системийн эрх систем дээр бүх эрхтэй'
                          : true
                      }
                      onClick={() => onPermissions(role)}
                    />
                    {canWrite ? (
                      <>
                        <EditButton
                          size="icon"
                          text={false}
                          disabled={!mutable}
                          onClick={() => onEdit(role)}
                        />
                        <DeleteButton
                          size="icon"
                          text={false}
                          disabled={!removable}
                          onClick={() => onDelete(role)}
                        />
                      </>
                    ) : null}
                  </div>
                </MTableCell>
                <MTableCell className="font-medium">
                  <div className="gap-2 flex flex-wrap items-center">
                    {isPlatformSuperAdminRole(role.slug) ? (
                      <span>{role.name}</span>
                    ) : (
                      <Link
                        href={roleResourcesPath(role.id)}
                        className="hover:text-primary hover:underline"
                      >
                        {role.name}
                      </Link>
                    )}
                    {role.isSystem ? (
                      <RoleBadge className="bg-muted text-muted-foreground">
                        систем
                      </RoleBadge>
                    ) : null}
                    {isPlatformSuperAdminRole(role.slug) ? (
                      <RoleBadge className="bg-primary/10 text-primary">
                        бүх эрх
                      </RoleBadge>
                    ) : null}
                    {role.isDefault ? (
                      <RoleBadge className="bg-primary/10 text-primary">
                        анхны
                      </RoleBadge>
                    ) : null}
                  </div>
                </MTableCell>
                <MTableCell className="text-muted-foreground">
                  {role.slug}
                </MTableCell>
                <MTableCell>{ROLE_SCOPE_LABELS[role.scope]}</MTableCell>
                <MTableCell>{role.priority}</MTableCell>
                <MTableCell>{role.userCount}</MTableCell>
                <MTableCell>
                  {isPlatformSuperAdminRole(role.slug)
                    ? 'Бүгд'
                    : role.permissionCount}
                </MTableCell>
                <MTableCell>{formatDateTime(role.createdAt)}</MTableCell>

              </MTableRow>
            );
          })}
      </MTableBody>
    </MTable>
  );
}
