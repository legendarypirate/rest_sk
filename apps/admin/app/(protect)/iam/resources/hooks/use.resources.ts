'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type { PermissionScope } from '@packages/types';
import { useState } from 'react';

import { listResources } from '@/services/iam/resources.service';
import type { ListResourcesQueryDto } from '@/types/iam/resource.dto';

export const resourcesQueryKey = ['iam', 'resources'] as const;

export type ResourcesFilters = {
  search: string;
  scope: PermissionScope | '';
  isSystem: '' | 'true' | 'false';
  includeDeleted: boolean;
};

export const defaultResourcesFilters: ResourcesFilters = {
  search: '',
  scope: '',
  isSystem: '',
  includeDeleted: false,
};

export function useResources() {
  const [draft, setDraft] = useState<ResourcesFilters>(defaultResourcesFilters);
  const [applied, setApplied] = useState<ResourcesFilters>(defaultResourcesFilters);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(30);
  const [sortBy, setSortBy] =
    useState<NonNullable<ListResourcesQueryDto['sortBy']>>('groupSortOrder');
  const [sortDirection, setSortDirection] =
    useState<NonNullable<ListResourcesQueryDto['sortDirection']>>('asc');

  const params: ListResourcesQueryDto = {
    page,
    limit,
    search: applied.search || undefined,
    scope: applied.scope || undefined,
    isSystem:
      applied.isSystem === '' ? undefined : applied.isSystem === 'true',
    includeDeleted: applied.includeDeleted || undefined,
    sortBy,
    sortDirection,
  };

  const query = useQuery({
    queryKey: [...resourcesQueryKey, params],
    queryFn: () => listResources(params),
    placeholderData: keepPreviousData,
  });

  function applyFilters() {
    setApplied(draft);
    setPage(1);
  }

  function clearFilters() {
    setDraft(defaultResourcesFilters);
    setApplied(defaultResourcesFilters);
    setPage(1);
  }

  function changeSort(field: NonNullable<ListResourcesQueryDto['sortBy']>) {
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
