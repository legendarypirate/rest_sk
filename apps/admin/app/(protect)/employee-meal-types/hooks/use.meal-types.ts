'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import { listEmployeeMealTypes } from '@/services/employee-meals/employee-meals.service';

export const mealTypesQueryKey = ['employee-meal-types'] as const;

export function useMealTypes() {
  const [search, setSearch] = useState('');
  const [applied, setApplied] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(30);
  const query = useQuery({
    queryKey: [...mealTypesQueryKey, page, limit, applied],
    queryFn: () => listEmployeeMealTypes({ page, limit, search: applied || undefined }),
    placeholderData: keepPreviousData,
  });
  return {
    search,
    setSearch,
    page,
    setPage,
    limit,
    setLimit: (next: number) => {
      setLimit(next);
      setPage(1);
    },
    apply: () => {
      setApplied(search);
      setPage(1);
    },
    clear: () => {
      setSearch('');
      setApplied('');
      setPage(1);
    },
    hasActiveFilters: Boolean(applied),
    query,
  };
}
