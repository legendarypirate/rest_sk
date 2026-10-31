'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import { listMenuCategoryImages } from '@/services/menus/menus.service';

export const menuCategoryImagesQueryKey = ['menu-category-images'] as const;

export type MenuCategoryImageFilters = {
  menuCategoryId: string;
};

const emptyFilters: MenuCategoryImageFilters = { menuCategoryId: '' };

export function useMenuCategoryImages() {
  const [draft, setDraft] = useState<MenuCategoryImageFilters>(emptyFilters);
  const [applied, setApplied] = useState<MenuCategoryImageFilters>(emptyFilters);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(30);
  const query = useQuery({
    queryKey: [...menuCategoryImagesQueryKey, page, limit, applied],
    queryFn: () =>
      listMenuCategoryImages({
        page,
        limit,
        menuCategoryId: applied.menuCategoryId || undefined,
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
    hasActiveFilters: Boolean(applied.menuCategoryId),
    query,
  };
}
