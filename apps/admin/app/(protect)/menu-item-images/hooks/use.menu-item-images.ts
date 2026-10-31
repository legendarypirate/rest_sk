'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import { listMenuItemImages } from '@/services/menus/menus.service';

export const menuItemImagesQueryKey = ['menu-item-images'] as const;

export type MenuItemImageFilters = {
  menuItemId: string;
};

const emptyFilters: MenuItemImageFilters = { menuItemId: '' };

export function useMenuItemImages() {
  const [draft, setDraft] = useState<MenuItemImageFilters>(emptyFilters);
  const [applied, setApplied] = useState<MenuItemImageFilters>(emptyFilters);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(30);
  const query = useQuery({
    queryKey: [...menuItemImagesQueryKey, page, limit, applied],
    queryFn: () =>
      listMenuItemImages({
        page,
        limit,
        menuItemId: applied.menuItemId || undefined,
      }),
    placeholderData: keepPreviousData,
  });
  return {
    draft,
    setDraft,
    page,
    setPage,
    limit,
    setLimit: (next: number) => {
      setLimit(next);
      setPage(1);
    },
    apply: () => {
      setApplied(draft);
      setPage(1);
    },
    clear: () => {
      setDraft(emptyFilters);
      setApplied(emptyFilters);
      setPage(1);
    },
    hasActiveFilters: Boolean(applied.menuItemId),
    query,
  };
}
