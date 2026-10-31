import type { Permission as PermissionRow, Prisma, Role } from '@generated/prisma/client';
import { UserStatus } from '@generated/prisma/client';
import type {
  Permission,
  RoleDetail,
  RoleListItem,
  RolePermissionAssignment,
} from '@packages/types';

import { toIso } from '@/common/utils/date';

export type RoleListRow = Role & {
  _count: { userRoles: number; permissions: number };
};

export type RoleDetailRow = Role & {
  _count: { userRoles: number; permissions: number };
  permissions: Array<{ permission: PermissionRow }>;
};

export const roleListInclude = {
  _count: {
    select: {
      permissions: true,
      userRoles: {
        where: {
          user: {
            deletedAt: null,
            status: { not: UserStatus.DELETED },
          },
        },
      },
    },
  },
} satisfies Prisma.RoleInclude;

export const roleDetailInclude = {
  ...roleListInclude,
  permissions: {
    include: { permission: true },
    orderBy: { permission: { key: 'asc' as const } },
  },
} satisfies Prisma.RoleInclude;

export function toPermission(permission: PermissionRow): Permission {
  return {
    id: permission.id,
    key: permission.key,
    name: permission.name,
    description: permission.description,
    resource: permission.resource,
    resourceId: permission.resourceId,
    action: permission.action,
    scope: permission.scope,
    isDangerous: permission.isDangerous,
  };
}

export function toRoleListItem(role: RoleListRow): RoleListItem {
  return {
    id: role.id,
    slug: role.slug,
    name: role.name,
    description: role.description,
    scope: role.scope,
    isSystem: role.isSystem,
    isDefault: role.isDefault,
    priority: role.priority,
    userCount: role._count.userRoles,
    permissionCount: role._count.permissions,
    createdAt: role.createdAt.toISOString(),
    updatedAt: role.updatedAt.toISOString(),
    deletedAt: toIso(role.deletedAt),
  };
}

export function toRoleDetail(role: RoleDetailRow): RoleDetail {
  return {
    ...toRoleListItem(role),
    permissions: role.permissions.map((link) => toPermission(link.permission)),
  };
}

export function toRolePermissionAssignment(
  row: {
    id: string;
    roleId: string;
    permissionId: string;
    createdAt: Date;
    permission: PermissionRow;
  },
): RolePermissionAssignment {
  return {
    id: row.id,
    roleId: row.roleId,
    permissionId: row.permissionId,
    createdAt: row.createdAt.toISOString(),
    permission: toPermission(row.permission),
  };
}
