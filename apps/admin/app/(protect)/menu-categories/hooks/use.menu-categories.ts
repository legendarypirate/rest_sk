'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type { AvailabilityStatus, RecordStatus } from '@packages/types';
import { useState } from 'react';

import { listMenuCategories } from '@/services/menus/menus.service';

export const menuCategoriesQueryKey = ['menu-categories'] as const;

export type MenuCategoryFilters = {
  search: string;
  status: string;
  availability: string;
};

const emptyFilters: MenuCategoryFilters = {
  search: '',
  status: '',
  availability: '',
};

export function useMenuCategories() {
  const [draft, setDraft] = useState<MenuCategoryFilters>(emptyFilters);
  const [applied, setApplied] = useState<MenuCategoryFilters>(emptyFilters);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(30);
  const query = useQuery({
    queryKey: [...menuCategoriesQueryKey, page, limit, applied],
    queryFn: () =>
      listMenuCategories({
        page,
        limit,
        search: applied.search || undefined,
        status: (applied.status || undefined) as RecordStatus | undefined,
        availability: (applied.availability || undefined) as AvailabilityStatus | undefined,
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
    hasActiveFilters: Boolean(
      applied.search || applied.status || applied.availability,
    ),
    query,
  };
}
