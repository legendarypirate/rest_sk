'use client';

import { PLATFORM_SUPER_ADMIN_SLUG, holdsAllPermissions } from '@packages/types';
import { useQuery } from '@tanstack/react-query';

import { hasPermissions } from '@/layouts/routes';
import { readSession, sessionQueryKey } from '@/providers';

export type AccessCheck = {
  permission?: string | readonly string[];
  match?: 'all' | 'any';
};

export function usePermission() {
  const session = useQuery({
    queryKey: sessionQueryKey,
    queryFn: readSession,
    retry: false,
  });

  const user = session.data;
  const permissions = user?.permissions ?? [];
  const roles = user?.roles ?? [];
  const isPlatformAdmin = roles.includes(PLATFORM_SUPER_ADMIN_SLUG);
  const isSuperAdmin = roles.includes(PLATFORM_SUPER_ADMIN_SLUG);

  function can(
    permission?: string | readonly string[],
    match: 'all' | 'any' = 'all',
  ) {
    if (isSuperAdmin || holdsAllPermissions(permissions)) {
      return true;
    }

    return hasPermissions(permissions, permission, match);
  }

  function canAccess(check: AccessCheck = {}) {
    if (isSuperAdmin || holdsAllPermissions(permissions)) {
      return true;
    }

    return hasPermissions(permissions, check.permission, check.match);
  }

  return {
    user,
    isLoading: session.isPending,
    permissions,
    roles,
    isPlatformAdmin,
    can,
    canAccess,
    hasRole: (slug: string) => roles.includes(slug),
  };
}
