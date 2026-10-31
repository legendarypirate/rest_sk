import type { Paginated, UserDetail, UserListItem } from '@packages/types';

import { api } from '@/lib/api';
import { toSearchParams } from '@/lib/search-params';
import type {
  CreateUserDto,
  DeleteUserDto,
  ListUsersQueryDto,
  ReplaceUserRolesDto,
  UpdateUserDto,
} from '@/types/iam/user.dto';

export function listUsers(params: ListUsersQueryDto) {
  return api<Paginated<UserListItem>>(
    `auth/users?${toSearchParams({
      page: params.page,
      limit: params.limit,
      search: params.search,
      status: params.status,
      roleId: params.roleId,
      sortBy: params.sortBy,
      sortDirection: params.sortDirection,
      includeDeleted: params.includeDeleted || undefined,
    })}`,
  );
}

export function getUser(id: string) {
  return api<UserDetail>(`auth/users/${id}`);
}

export function createUser(dto: CreateUserDto) {
  return api<UserDetail>('auth/users', {
    method: 'POST',
    body: JSON.stringify(dto),
  });
}

export function updateUser(id: string, dto: UpdateUserDto) {
  return api<UserDetail>(`auth/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(dto),
  });
}

export function deleteUser(id: string, dto: DeleteUserDto = {}) {
  return api<void>(`auth/users/${id}`, {
    method: 'DELETE',
    body: JSON.stringify(dto),
  });
}

export function replaceUserRoles(id: string, dto: ReplaceUserRolesDto) {
  return api<UserDetail>(`auth/users/${id}/roles`, {
    method: 'PUT',
    body: JSON.stringify({
      assignments: dto.roleIds.map((roleId) => ({ roleId })),
    }),
  });
}
