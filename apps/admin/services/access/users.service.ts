import type {
  Paginated,
  UserDetail,
  UserListItem,
  UserStatus,
} from '@packages/types';

import { api } from '@/lib/api';

export type ListUsersParams = {
  page: number;
  limit: number;
  search?: string;
  status?: UserStatus;
  roleId?: string;
  sortBy?: 'createdAt' | 'updatedAt' | 'lastLoginAt' | 'email' | 'displayName';
  sortDirection?: 'asc' | 'desc';
  includeDeleted?: boolean;
};

export type CreateUserInput = {
  email: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  phoneE164?: string;
  status?: UserStatus;
  password: string;
  mustChangePassword?: boolean;
  roleIds?: string[];
};

export type UpdateUserInput = {
  email?: string;
  username?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  displayName?: string | null;
  phoneE164?: string | null;
  status?: UserStatus;
  password?: string;
  mustChangePassword?: boolean;
  rowVersion: number;
};

function toSearchParams(params: ListUsersParams) {
  const query = new URLSearchParams();
  query.set('page', String(params.page));
  query.set('limit', String(params.limit));

  if (params.search?.trim()) {
    query.set('search', params.search.trim());
  }
  if (params.status) {
    query.set('status', params.status);
  }
  if (params.roleId) {
    query.set('roleId', params.roleId);
  }
  if (params.sortBy) {
    query.set('sortBy', params.sortBy);
  }
  if (params.sortDirection) {
    query.set('sortDirection', params.sortDirection);
  }
  if (params.includeDeleted) {
    query.set('includeDeleted', 'true');
  }

  return query.toString();
}

export function listUsers(params: ListUsersParams) {
  return api<Paginated<UserListItem>>(`auth/users?${toSearchParams(params)}`);
}

export function getUser(id: string) {
  return api<UserDetail>(`auth/users/${id}`);
}

export function createUser(input: CreateUserInput) {
  return api<UserDetail>('auth/users', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function updateUser(id: string, input: UpdateUserInput) {
  return api<UserDetail>(`auth/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  });
}

export function deleteUser(id: string, reason?: string) {
  return api<void>(`auth/users/${id}`, {
    method: 'DELETE',
    body: JSON.stringify(reason ? { reason } : {}),
  });
}

export function replaceUserRoles(id: string, roleIds: string[]) {
  return api<UserDetail>(`auth/users/${id}/roles`, {
    method: 'PUT',
    body: JSON.stringify({ assignments: roleIds.map((roleId) => ({ roleId })) }),
  });
}
