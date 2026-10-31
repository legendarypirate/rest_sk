'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type { AvailabilityStatus, FoodType, RecordStatus } from '@packages/types';
import { useState } from 'react';

import { listMenuItems } from '@/services/menus/menus.service';

export const menuItemsQueryKey = ['menu-items'] as const;

export type MenuItemFilters = {
  search: string;
  status: string;
  availability: string;
  categoryId: string;
  foodType: string;
};

const emptyFilters: MenuItemFilters = {
  search: '',
  status: '',
  availability: '',
  categoryId: '',
  foodType: '',
};

export function useMenuItems() {
  const [draft, setDraft] = useState<MenuItemFilters>(emptyFilters);
  const [applied, setApplied] = useState<MenuItemFilters>(emptyFilters);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(30);
  const query = useQuery({
    queryKey: [...menuItemsQueryKey, page, limit, applied],
    queryFn: () =>
      listMenuItems({
        page,
        limit,
        search: applied.search || undefined,
        categoryId: applied.categoryId || undefined,
        status: (applied.status || undefined) as RecordStatus | undefined,
        availability: (applied.availability || undefined) as AvailabilityStatus | undefined,
        foodType: (applied.foodType || undefined) as FoodType | undefined,
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
      applied.search || applied.status || applied.availability || applied.categoryId || applied.foodType,
    ),
    query,
  };
}
