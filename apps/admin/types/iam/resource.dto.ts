import type { PermissionScope } from '@packages/types';

export type ListResourcesQueryDto = {
  page: number;
  limit: number | '*';
  search?: string;
  scope?: PermissionScope;
  isSystem?: boolean;
  isMenu?: boolean;
  sortBy?:
    | 'createdAt'
    | 'updatedAt'
    | 'name'
    | 'slug'
    | 'sortOrder'
    | 'groupSortOrder';
  sortDirection?: 'asc' | 'desc';
  includeDeleted?: boolean;
};

export type ResourceActionInput = {
  action: string;
  name?: string;
  isDangerous?: boolean;
};

export type CreateResourceDto = {
  slug: string;
  name: string;
  description?: string;
  scope?: PermissionScope;
  path?: string;
  icon?: string;
  groupKey?: string;
  groupLabel?: string;
  groupSortOrder?: number;
  sortOrder?: number;
  isMenu?: boolean;
  menuExact?: boolean;
  parentId?: string;
  actions?: ResourceActionInput[];
};

export type UpdateResourceDto = {
  slug?: string;
  name?: string;
  description?: string | null;
  scope?: PermissionScope;
  path?: string | null;
  icon?: string | null;
  groupKey?: string | null;
  groupLabel?: string | null;
  groupSortOrder?: number;
  sortOrder?: number;
  isMenu?: boolean;
  menuExact?: boolean;
  parentId?: string | null;
  actions?: ResourceActionInput[];
};
