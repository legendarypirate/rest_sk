'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import type { EmployeeStatus } from '@packages/types';

import { listEmployees } from '@/services/employees/employees.service';
import type { ListEmployeesQueryDto } from '@/types/employees/employee.dto';

export const employeesQueryKey = ['employees'] as const;

export type EmployeesFilters = {
  search: string;
  status: EmployeeStatus | '';
};

export const defaultEmployeesFilters: EmployeesFilters = {
  search: '',
  status: '',
};

export function useEmployees() {
  const [draft, setDraft] = useState<EmployeesFilters>(defaultEmployeesFilters);
  const [applied, setApplied] = useState<EmployeesFilters>(defaultEmployeesFilters);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(30);
  const [sortBy, setSortBy] = useState<NonNullable<ListEmployeesQueryDto['sortBy']>>('employeeCode');
  const [sortDirection, setSortDirection] =
    useState<NonNullable<ListEmployeesQueryDto['sortDirection']>>('asc');

  const params: ListEmployeesQueryDto = {
    page,
    limit,
    search: applied.search || undefined,
    status: applied.status || undefined,
    sortBy,
    sortDirection,
  };

  const query = useQuery({
    queryKey: [...employeesQueryKey, params],
    queryFn: () => listEmployees(params),
    placeholderData: keepPreviousData,
  });

  function applyFilters() {
    setApplied(draft);
    setPage(1);
  }

  function clearFilters() {
    setDraft(defaultEmployeesFilters);
    setApplied(defaultEmployeesFilters);
    setPage(1);
  }

  function changeSort(field: NonNullable<ListEmployeesQueryDto['sortBy']>) {
    if (sortBy === field) {
      setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'));
      return;
    }

    setSortBy(field);
    setSortDirection('asc');
  }

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
    sortBy,
    sortDirection,
    changeSort,
    applyFilters,
    clearFilters,
    hasActiveFilters: Boolean(applied.search) || Boolean(applied.status),
    query,
  };
}
