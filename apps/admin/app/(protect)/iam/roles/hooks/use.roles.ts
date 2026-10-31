'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type { RoleScope } from '@packages/types';
import { useState } from 'react';

import { listRoles } from '@/services/iam/roles.service';
import type { ListRolesQueryDto } from '@/types/iam/role.dto';

export const rolesQueryKey = ['iam', 'roles'] as const;

export type RolesFilters = {
  search: string;
  scope: RoleScope | '';
  isSystem: '' | 'true' | 'false';
  includeDeleted: boolean;
};

export const defaultRolesFilters: RolesFilters = {
  search: '',
  scope: '',
  isSystem: '',
  includeDeleted: false,
};

export function useRoles() {
  const [draft, setDraft] = useState<RolesFilters>(defaultRolesFilters);
  const [applied, setApplied] = useState<RolesFilters>(defaultRolesFilters);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(30);
  const [sortBy, setSortBy] =
    useState<NonNullable<ListRolesQueryDto['sortBy']>>('priority');
  const [sortDirection, setSortDirection] =
    useState<NonNullable<ListRolesQueryDto['sortDirection']>>('asc');

  const params: ListRolesQueryDto = {
    page,
    limit,
    search: applied.search || undefined,
    scope: applied.scope || undefined,
    isSystem: applied.isSystem === '' ? undefined : applied.isSystem === 'true',
    includeDeleted: applied.includeDeleted || undefined,
    sortBy,
    sortDirection,
  };

  const query = useQuery({
    queryKey: [...rolesQueryKey, params],
    queryFn: () => listRoles(params),
    placeholderData: keepPreviousData,
  });

  function applyFilters() {
    setApplied(draft);
    setPage(1);
  }

  function clearFilters() {
    setDraft(defaultRolesFilters);
    setApplied(defaultRolesFilters);
    setPage(1);
  }

  function changeSort(field: NonNullable<ListRolesQueryDto['sortBy']>) {
    if (sortBy === field) {
      setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'));
      return;
    }

    setSortBy(field);
    setSortDirection('asc');
  }

  const hasActiveFilters =
    Boolean(applied.search) ||
    Boolean(applied.scope) ||
    Boolean(applied.isSystem) ||
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
