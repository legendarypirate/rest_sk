'use client';

import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query';
import type { DateRangeValue } from '@packages/ui/main/MFilters';
import { useEffect, useState } from 'react';

import { listEmployeeMealOrders, onEmployeeMealOrderUpdated } from '@/services/employee-meals/employee-meals.service';
import { mealDaysQueryKey } from '../../employee-meal-days/hooks/use.meal-days';

export const mealOrdersQueryKey = ['employee-meal-orders'] as const;

export type MealOrderFilters = {
  search: string;
  serviceDate: DateRangeValue | undefined;
};

const emptyFilters: MealOrderFilters = { search: '', serviceDate: undefined };

export function toDateOnly(date?: Date) {
  if (!date) return undefined;
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

export function todayDateOnly() {
  return toDateOnly(new Date()) ?? '';
}

export function useMealOrders() {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<MealOrderFilters>(emptyFilters);
  const [applied, setApplied] = useState<MealOrderFilters>(emptyFilters);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(30);
  const today = todayDateOnly();
  const from = toDateOnly(applied.serviceDate?.from) ?? today;
  const to = toDateOnly(applied.serviceDate?.to ?? applied.serviceDate?.from) ?? today;
  const query = useQuery({
    queryKey: [...mealOrdersQueryKey, page, limit, applied.search, from, to],
    queryFn: () =>
      listEmployeeMealOrders({
        page,
        limit,
        search: applied.search || undefined,
        from,
        to,
      }),
    placeholderData: keepPreviousData,
  });

  useEffect(
    () =>
      onEmployeeMealOrderUpdated(() => {
        void queryClient.invalidateQueries({ queryKey: mealOrdersQueryKey });
        void queryClient.invalidateQueries({ queryKey: mealDaysQueryKey });
      }),
    [queryClient],
  );

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
      applied.search || applied.serviceDate?.from || applied.serviceDate?.to,
    ),
    from,
    to,
    search: applied.search,
    query,
  };
}
