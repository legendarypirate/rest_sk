'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type { UserStatus } from '@packages/types';
import { useState } from 'react';

import { listUsers } from '@/services/iam/users.service';
import type { ListUsersQueryDto } from '@/types/iam/user.dto';

export const usersQueryKey = ['iam', 'users'] as const;

export type UsersFilters = {
  search: string;
  status: UserStatus | '';
  includeDeleted: boolean;
};

export const defaultUsersFilters: UsersFilters = {
  search: '',
  status: '',
  includeDeleted: false,
};

export function useUsers() {
  const [draft, setDraft] = useState<UsersFilters>(defaultUsersFilters);
  const [applied, setApplied] = useState<UsersFilters>(defaultUsersFilters);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(30);
  const [sortBy, setSortBy] =
    useState<NonNullable<ListUsersQueryDto['sortBy']>>('createdAt');
  const [sortDirection, setSortDirection] =
    useState<NonNullable<ListUsersQueryDto['sortDirection']>>('desc');

  const params: ListUsersQueryDto = {
    page,
    limit,
    search: applied.search || undefined,
    status: applied.status || undefined,
    includeDeleted: applied.includeDeleted || undefined,
    sortBy,
    sortDirection,
  };

  const query = useQuery({
    queryKey: [...usersQueryKey, params],
    queryFn: () => listUsers(params),
    placeholderData: keepPreviousData,
  });

  function applyFilters() {
    setApplied(draft);
    setPage(1);
  }

  function clearFilters() {
    setDraft(defaultUsersFilters);
    setApplied(defaultUsersFilters);
    setPage(1);
  }

  function changeSort(field: NonNullable<ListUsersQueryDto['sortBy']>) {
    if (sortBy === field) {
      setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'));
      return;
    }

    setSortBy(field);
    setSortDirection('desc');
  }

  const hasActiveFilters =
    Boolean(applied.search) ||
    Boolean(applied.status) ||
    applied.includeDeleted;

  return {
    draft,
    setDraft,
    applied,
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
    hasActiveFilters,
    query,
  };
}
