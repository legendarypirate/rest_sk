export type RoleScope = 'PLATFORM' | 'ORGANIZATION';
export type PermissionScope = 'PLATFORM' | 'ORGANIZATION';

export const PLATFORM_SUPER_ADMIN_SLUG = 'platform_super_admin';
export const ALL_PERMISSIONS = '*' as const;

export function isPlatformSuperAdminRole(slug: string) {
  return slug === PLATFORM_SUPER_ADMIN_SLUG;
}

export function holdsAllPermissions(granted: readonly string[]) {
  return granted.includes(ALL_PERMISSIONS);
}

export type Permission = {
  id: string;
  key: string;
  name: string;
  description: string | null;
  resource: string;
  resourceId: string | null;
  action: string;
  scope: PermissionScope;
  isDangerous: boolean;
};

export type RolePermissionAssignment = {
  id: string;
  roleId: string;
  permissionId: string;
  createdAt: string;
  permission: Permission;
};

export type RoleListItem = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  scope: RoleScope;
  isSystem: boolean;
  isDefault: boolean;
  priority: number;
  userCount: number;
  permissionCount: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

export type RoleDetail = RoleListItem & {
  permissions: Permission[];
};
