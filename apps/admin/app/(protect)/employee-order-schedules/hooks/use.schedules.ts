'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import { listEmployeeOrderSchedules } from '@/services/employee-meals/employee-meals.service';

export const schedulesQueryKey = ['employee-order-schedules'] as const;

export function useSchedules() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(30);
  const query = useQuery({
    queryKey: [...schedulesQueryKey, page, limit],
    queryFn: () => listEmployeeOrderSchedules({ page, limit }),
    placeholderData: keepPreviousData,
  });
  return {
    page,
    setPage,
    limit,
    setLimit: (next: number) => {
      setLimit(next);
      setPage(1);
    },
    query,
  };
}
