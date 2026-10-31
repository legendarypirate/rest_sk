'use client';

import type { UserListItem, UserStatus } from '@packages/types';
import { DeleteButton, EditButton, ViewButton } from '@packages/ui/main/MButtons';
import { StatusCell } from '@packages/ui/main/Status.cell';
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

import { Icons } from '@/utils/icons';

import type { ListUsersQueryDto } from '@/types/iam/user.dto';

import {
  CREATE_STATUS_OPTIONS,
  USER_STATUS_CLASS,
  USER_STATUS_LABELS,
  canMutateUser,
  displayName,
  formatDateTime,
} from '../lib/labels';

type UsersTableProps = {
  items: UserListItem[];
  isLoading: boolean;
  errorMessage?: string;
  sortBy: NonNullable<ListUsersQueryDto['sortBy']>;
  sortDirection: NonNullable<ListUsersQueryDto['sortDirection']>;
  onSort: (field: NonNullable<ListUsersQueryDto['sortBy']>) => void;
  canEdit: boolean;
  canDelete: boolean;
  currentUserId?: string;
  statusPending?: boolean;
  onView: (user: UserListItem) => void;
  onEdit: (user: UserListItem) => void;
  onDelete: (user: UserListItem) => void;
  onStatusChange: (user: UserListItem, status: UserStatus) => void;
};

export function UsersTable({
  items,
  isLoading,
  errorMessage,
  sortBy,
  sortDirection,
  onSort,
  canEdit,
  canDelete,
  currentUserId,
  statusPending,
  onView,
  onEdit,
  onDelete,
  onStatusChange,
}: UsersTableProps) {
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
    return <MTableEmpty icon={Icons.users} text="Хэрэглэгч олдсонгүй." />;
  }

  return (
    <MTable>
      <MTableHeader>
        <MTableRow>
          <MTableHead className="w-32">Үйлдэл</MTableHead>
          <SortHead
            field="displayName"
            label="Нэр"
            sortBy={sortBy}
            sortOrder={sortDirection}
            onSort={onSort}
          />
          <SortHead
            field="email"
            label="Имэйл"
            sortBy={sortBy}
            sortOrder={sortDirection}
            onSort={onSort}
          />
          <MTableHead>Нэвтрэх нэр</MTableHead>
          <MTableHead>Төлөв</MTableHead>
          <MTableHead>Системийн эрх</MTableHead>
          <SortHead
            field="lastLoginAt"
            label="Сүүлд нэвтэрсэн"
            sortBy={sortBy}
            sortOrder={sortDirection}
            onSort={onSort}
          />
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
        {items.map((user) => {
          const mutable = canMutateUser(user);
          const removable = mutable && user.id !== currentUserId;
          const roles = user.roles.map((role) => role.name).join(', ');

          return (
            <MTableRow key={user.id}>
              <MTableCell>
                <div className="flex gap-1">
                  <ViewButton
                    size="icon"
                    text={false}
                    onClick={() => onView(user)}
                  />
                  {canEdit ? (
                    <EditButton
                      size="icon"
                      text={false}
                      disabled={!mutable}
                      onClick={() => onEdit(user)}
                    />
                  ) : null}
                  {canDelete ? (
                    <DeleteButton
                      size="icon"
                      text={false}
                      disabled={!removable}
                      onClick={() => onDelete(user)}
                    />
                  ) : null}
                </div>
              </MTableCell>
              <MTableCell className="font-medium">
                {displayName(user)}
                {user.isSystemUser ? (
                  <span className="ml-2 text-xs text-muted-foreground">
                    систем
                  </span>
                ) : null}
              </MTableCell>
              <MTableCell>{user.email ?? '—'}</MTableCell>
              <MTableCell>{user.username ?? '—'}</MTableCell>
              <MTableCell>
                <StatusCell
                  value={user.status}
                  labels={USER_STATUS_LABELS}
                  classMap={USER_STATUS_CLASS}
                  options={CREATE_STATUS_OPTIONS}
                  disabled={!canEdit || !mutable}
                  pending={statusPending}
                  onChange={(status) => onStatusChange(user, status)}
                />
              </MTableCell>
              <MTableCell className="max-w-48 truncate text-muted-foreground">
                {roles || '—'}
              </MTableCell>
              <MTableCell>{formatDateTime(user.lastLoginAt)}</MTableCell>
              <MTableCell>{formatDateTime(user.createdAt)}</MTableCell>

            </MTableRow>
          );
        })}
      </MTableBody>
    </MTable>
  );
}
