import type { Permission, PermissionScope } from './roles';

export type ResourceListItem = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  scope: PermissionScope;
  path: string | null;
  icon: string | null;
  groupKey: string | null;
  groupLabel: string | null;
  groupSortOrder: number;
  sortOrder: number;
  isSystem: boolean;
  isMenu: boolean;
  menuExact: boolean;
  menuAnyOf: string[];
  parentId: string | null;
  permissionCount: number;
  actions: string[];
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

export type ResourceDetail = ResourceListItem & {
  permissions: Permission[];
};

export type ResourceMenuItem = {
  menuId: string;
  path: string;
  label: string;
  icon: string;
  exact?: boolean;
};

export type ResourceMenuGroup = {
  id: string;
  label: string;
  items: ResourceMenuItem[];
};
