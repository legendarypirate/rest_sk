'use client';

import { useQuery } from '@tanstack/react-query';
import type { ResourceMenuGroup } from '@packages/types';

import { listResourceMenu } from '@/services/iam/resources.service';
import type { NavGroupConfig } from '@/types/routes';
import { resolveIcon } from '@/utils/icons';

export const resourceMenuQueryKey = ['iam', 'resources', 'menu'] as const;

export function toNavMenu(groups: ResourceMenuGroup[]): NavGroupConfig[] {
  return groups.map((group) => ({
    id: group.id,
    label: group.label,
    items: group.items.map((item) => ({
      menuId: item.menuId,
      path: item.path,
      label: item.label,
      icon: resolveIcon(item.icon),
      exact: item.exact,
    })),
  }));
}

export function useResourceMenu() {
  const menuQuery = useQuery({
    queryKey: resourceMenuQueryKey,
    queryFn: listResourceMenu,
  });

  return {
    menu: menuQuery.data ? toNavMenu(menuQuery.data) : [],
    isPending: menuQuery.isPending,
    isError: menuQuery.isError,
  };
}
