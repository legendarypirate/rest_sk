import type { PermissionScope, RoleScope } from '@packages/types';

export type ListRolesQueryDto = {
  page: number;
  limit: number | '*';
  search?: string;
  scope?: RoleScope;
  isSystem?: boolean;
  sortBy?: 'createdAt' | 'updatedAt' | 'name' | 'slug' | 'priority';
  sortDirection?: 'asc' | 'desc';
  includeDeleted?: boolean;
};

export type ListPermissionsQueryDto = {
  page: number;
  limit: number | '*';
  search?: string;
  scope?: PermissionScope;
  resource?: string;
};

export type CreateRoleDto = {
  slug: string;
  name: string;
  description?: string;
  scope?: RoleScope;
  isDefault?: boolean;
  priority?: number;
  permissionIds?: string[];
};

export type UpdateRoleDto = {
  slug?: string;
  name?: string;
  description?: string | null;
  scope?: RoleScope;
  isDefault?: boolean;
  priority?: number;
};

export type ReplaceRolePermissionsDto = {
  permissionIds: string[];
};
