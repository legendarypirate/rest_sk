'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type { MediaUploadStatus } from '@packages/types';
import { useState } from 'react';

import { listMedia } from '@/services/media/media.service';
import type { ListMediaQueryDto } from '@/types/media/media.dto';

export const mediaQueryKey = ['media'] as const;

export type MediaFilters = {
  search: string;
  status: MediaUploadStatus | '';
  includeDeleted: boolean;
};

export const defaultMediaFilters: MediaFilters = {
  search: '',
  status: '',
  includeDeleted: false,
};

export function useMedia() {
  const [draft, setDraft] = useState<MediaFilters>(defaultMediaFilters);
  const [applied, setApplied] = useState<MediaFilters>(defaultMediaFilters);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(30);
  const [sortBy, setSortBy] =
    useState<NonNullable<ListMediaQueryDto['sortBy']>>('createdAt');
  const [sortDirection, setSortDirection] =
    useState<NonNullable<ListMediaQueryDto['sortDirection']>>('desc');

  const params: ListMediaQueryDto = {
    page,
    limit,
    search: applied.search || undefined,
    status: applied.status || undefined,
    includeDeleted: applied.includeDeleted || undefined,
    sortBy,
    sortDirection,
  };

  const query = useQuery({
    queryKey: [...mediaQueryKey, params],
    queryFn: () => listMedia(params),
    placeholderData: keepPreviousData,
  });

  function applyFilters() {
    setApplied(draft);
    setPage(1);
  }

  function clearFilters() {
    setDraft(defaultMediaFilters);
    setApplied(defaultMediaFilters);
    setPage(1);
  }

  function changeSort(field: NonNullable<ListMediaQueryDto['sortBy']>) {
    if (sortBy === field) {
      setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'));
      return;
    }

    setSortBy(field);
    setSortDirection(field === 'createdAt' ? 'desc' : 'asc');
  }

  const hasActiveFilters =
    Boolean(applied.search) || Boolean(applied.status) || applied.includeDeleted;

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
    hasActiveFilters,
    query,
  };
}
