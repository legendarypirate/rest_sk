'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type { DateRangeValue } from '@packages/ui/main/MFilters';
import { useState } from 'react';

import { listEmployeeMealDays } from '@/services/employee-meals/employee-meals.service';

export const mealDaysQueryKey = ['employee-meal-days'] as const;

export type MealDayFilters = {
  serviceDate: DateRangeValue | undefined;
};

const emptyFilters: MealDayFilters = { serviceDate: undefined };

function toDateOnly(date?: Date) {
  if (!date) return undefined;
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

export function useMealDays() {
  const [draft, setDraft] = useState<MealDayFilters>(emptyFilters);
  const [applied, setApplied] = useState<MealDayFilters>(emptyFilters);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(30);
  const from = toDateOnly(applied.serviceDate?.from);
  const to = toDateOnly(applied.serviceDate?.to ?? applied.serviceDate?.from);
  const query = useQuery({
    queryKey: [...mealDaysQueryKey, page, limit, from, to],
    queryFn: () => listEmployeeMealDays({ page, limit, from, to }),
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
    hasActiveFilters: Boolean(applied.serviceDate?.from || applied.serviceDate?.to),
    query,
  };
}
