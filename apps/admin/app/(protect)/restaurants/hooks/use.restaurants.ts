'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type { RecordStatus } from '@packages/types';
import { useState } from 'react';

import { listRestaurants } from '@/services/restaurants/restaurants.service';

export const restaurantsQueryKey = ['restaurants'] as const;

export type RestaurantFilters = {
  search: string;
  status: string;
};

const emptyFilters: RestaurantFilters = { search: '', status: '' };

export function useRestaurants() {
  const [draft, setDraft] = useState<RestaurantFilters>(emptyFilters);
  const [applied, setApplied] = useState<RestaurantFilters>(emptyFilters);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(30);
  const query = useQuery({
    queryKey: [...restaurantsQueryKey, page, limit, applied],
    queryFn: () =>
      listRestaurants({
        page,
        limit,
        search: applied.search || undefined,
        status: (applied.status || undefined) as RecordStatus | undefined,
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
    hasActiveFilters: Boolean(applied.search || applied.status),
    query,
  };
}
