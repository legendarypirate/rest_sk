import type { UserStatus } from '@packages/types';

export type ListUsersQueryDto = {
  page: number;
  limit: number;
  search?: string;
  status?: UserStatus;
  roleId?: string;
  sortBy?: 'createdAt' | 'updatedAt' | 'lastLoginAt' | 'email' | 'displayName';
  sortDirection?: 'asc' | 'desc';
  includeDeleted?: boolean;
};

export type CreateUserDto = {
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

export type UpdateUserDto = {
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

export type ReplaceUserRolesDto = {
  roleIds: string[];
};

export type DeleteUserDto = {
  reason?: string;
};
