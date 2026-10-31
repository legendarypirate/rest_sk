'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type { AuditAction } from '@packages/types';
import type { DateRangeValue } from '@packages/ui/main/MFilters';
import { useState } from 'react';

import { listAudit } from '@/services/iam/audit.service';
import type { ListAuditQueryDto } from '@/types/iam/audit.dto';

export const auditQueryKey = ['security', 'audit'] as const;

export type AuditFilters = {
  action: AuditAction | '';
  resourceType: string;
  resourceId: string;
  requestId: string;
  createdAt: DateRangeValue | undefined;
};

export const defaultAuditFilters: AuditFilters = {
  action: '',
  resourceType: '',
  resourceId: '',
  requestId: '',
  createdAt: undefined,
};

function toIsoStart(date?: Date) {
  if (!date) {
    return undefined;
  }

  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy.toISOString();
}

function toIsoEnd(date?: Date) {
  if (!date) {
    return undefined;
  }

  const copy = new Date(date);
  copy.setHours(23, 59, 59, 999);
  return copy.toISOString();
}

export function useAudit() {
  const [draft, setDraft] = useState<AuditFilters>(defaultAuditFilters);
  const [applied, setApplied] = useState<AuditFilters>(defaultAuditFilters);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(30);
  const [sortDirection, setSortDirection] =
    useState<NonNullable<ListAuditQueryDto['sortDirection']>>('desc');

  const params: ListAuditQueryDto = {
    page,
    limit,
    action: applied.action || undefined,
    resourceType: applied.resourceType || undefined,
    resourceId: applied.resourceId || undefined,
    requestId: applied.requestId || undefined,
    from: toIsoStart(applied.createdAt?.from),
    to: toIsoEnd(applied.createdAt?.to ?? applied.createdAt?.from),
    sortDirection,
  };

  const query = useQuery({
    queryKey: [...auditQueryKey, params],
    queryFn: () => listAudit(params),
    placeholderData: keepPreviousData,
  });

  function applyFilters() {
    setApplied(draft);
    setPage(1);
  }

  function clearFilters() {
    setDraft(defaultAuditFilters);
    setApplied(defaultAuditFilters);
    setPage(1);
  }

  function changeSort() {
    setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'));
  }

  const hasActiveFilters =
    Boolean(applied.action) ||
    Boolean(applied.resourceType) ||
    Boolean(applied.resourceId) ||
    Boolean(applied.requestId) ||
    Boolean(applied.createdAt?.from || applied.createdAt?.to);

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
    sortBy: 'createdAt' as const,
    sortDirection,
    changeSort,
    applyFilters,
    clearFilters,
    hasActiveFilters,
    query,
  };
}
