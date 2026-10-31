import type { Permission as PermissionRow, Prisma, Resource } from '@generated/prisma/client';
import type {
  ResourceDetail,
  ResourceListItem,
  ResourceMenuGroup,
  ResourceMenuItem,
} from '@packages/types';
import { holdsAllPermissions, isDangerousResourceAction } from '@packages/types';

import { toIso } from '@/common/utils/date';
import { toPermission } from '../roles/roles.mapper';

export type ResourceListRow = Resource & {
  permissions: Array<Pick<PermissionRow, 'action'>>;
  _count: { permissions: number };
};

export type ResourceDetailRow = Resource & {
  permissions: PermissionRow[];
  _count: { permissions: number };
};

export const resourceListInclude = {
  permissions: {
    select: { action: true },
    orderBy: { action: 'asc' as const },
  },
  _count: { select: { permissions: true } },
} satisfies Prisma.ResourceInclude;

export const resourceDetailInclude = {
  permissions: { orderBy: { action: 'asc' as const } },
  _count: { select: { permissions: true } },
} satisfies Prisma.ResourceInclude;

export const resourceMenuInclude = {
  permissions: { select: { key: true, action: true } },
} satisfies Prisma.ResourceInclude;

export type ResourceMenuRow = Resource & {
  permissions: Array<{ key: string; action: string }>;
};

export function toResourceListItem(row: ResourceListRow): ResourceListItem {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    scope: row.scope,
    path: row.path,
    icon: row.icon,
    groupKey: row.groupKey,
    groupLabel: row.groupLabel,
    groupSortOrder: row.groupSortOrder,
    sortOrder: row.sortOrder,
    isSystem: row.isSystem,
    isMenu: row.isMenu,
    menuExact: row.menuExact,
    menuAnyOf: row.menuAnyOf,
    parentId: row.parentId,
    permissionCount: row._count.permissions,
    actions: row.permissions.map((permission) => permission.action),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    deletedAt: toIso(row.deletedAt),
  };
}

export function toResourceDetail(row: ResourceDetailRow): ResourceDetail {
  return {
    ...toResourceListItem({
      ...row,
      permissions: row.permissions.map((permission) => ({
        action: permission.action,
      })),
    }),
    permissions: row.permissions.map(toPermission),
  };
}

export function toResourceMenu(
  rows: ResourceMenuRow[],
  granted: readonly string[],
): ResourceMenuGroup[] {
  const groups = new Map<
    string,
    { group: ResourceMenuGroup; sortOrder: number }
  >();

  for (const row of rows) {
    if (!row.path) {
      continue;
    }

    const allowed =
      holdsAllPermissions(granted) ||
      (row.menuAnyOf.length
        ? row.menuAnyOf.some((key) => granted.includes(key))
        : canSeeResource(row, granted));

    if (!allowed) {
      continue;
    }

    const groupId = row.groupKey ?? 'other';
    const existing = groups.get(groupId);
    const group =
      existing?.group ??
      ({
        id: groupId,
        label: row.groupLabel ?? groupId,
        items: [],
      } satisfies ResourceMenuGroup);

    group.items.push({
      menuId: row.slug,
      path: row.path,
      label: row.name,
      icon: row.icon ?? 'settings',
      exact: row.menuExact || undefined,
    });

    groups.set(groupId, {
      group,
      sortOrder: existing
        ? Math.min(existing.sortOrder, row.groupSortOrder)
        : row.groupSortOrder,
    });
  }

  return [...groups.values()]
    .sort((left, right) => {
      if (left.sortOrder !== right.sortOrder) {
        return left.sortOrder - right.sortOrder;
      }
      return left.group.label.localeCompare(right.group.label, 'mn');
    })
    .map((entry) => entry.group);
}

function canSeeResource(
  row: ResourceMenuRow,
  granted: readonly string[],
) {
  if (row.permissions.length === 0) {
    return true;
  }

  const read = row.permissions.find((permission) => permission.action === 'read');

  if (read) {
    return granted.includes(read.key);
  }

  return row.permissions.some((permission) => granted.includes(permission.key));
}

export function permissionKey(
  scope: Resource['scope'],
  slug: string,
  action: string,
) {
  const prefix = scope === 'ORGANIZATION' ? 'organization' : 'platform';
  return `${prefix}:${slug}:${action}`;
}

export function isDangerousAction(action: string) {
  return isDangerousResourceAction(action);
}
