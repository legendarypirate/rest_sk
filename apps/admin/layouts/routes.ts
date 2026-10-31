import { holdsAllPermissions } from '@packages/types';

import { ADMIN_APP_HOME } from '@/lib/routes';

import type { NavGroupConfig, NavItemConfig } from '@/types/routes';

export const ADMIN_PATHS = {
  analyze: ADMIN_APP_HOME,
  users: '/iam/users',
  roles: '/iam/roles',
  resources: '/iam/resources',
  permissions: '/iam/permissions',
  audit: '/security/audit',
  security: '/security/policies',
  settings: '/settings',
} as const;

export function roleResourcesPath(roleId: string) {
  return `${ADMIN_PATHS.roles}/${roleId}/resources`;
}

export function adminDetailPath(base: string, id: string) {
  return `${base}/${id}`;
}

export function hasPermissions(
  granted: readonly string[],
  required?: string | readonly string[],
  match: 'all' | 'any' = 'all',
) {
  if (!required) {
    return true;
  }

  if (holdsAllPermissions(granted)) {
    return true;
  }

  const keys = Array.isArray(required) ? required : [required];

  if (match === 'any') {
    return keys.some((key) => granted.includes(key));
  }

  return keys.every((key) => granted.includes(key));
}

export function flattenAdminMenu(menu: readonly NavGroupConfig[]) {
  return menu.flatMap((group) =>
    group.items.flatMap((item) => [item, ...(item.children ?? [])]),
  );
}

export function findAdminNavItem(
  pathname: string,
  menu: readonly NavGroupConfig[],
) {
  return flattenAdminMenu(menu).find((item) =>
    isAdminNavItemActive(item, pathname),
  );
}

export function isAdminNavItemActive(item: NavItemConfig, pathname: string) {
  if (item.exact) {
    return pathname === item.path;
  }

  return pathname === item.path || pathname.startsWith(`${item.path}/`);
}
