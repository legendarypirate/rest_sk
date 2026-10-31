'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import { listIntegrations } from '@/services/integrations/integrations.service';

export const integrationsQueryKey = ['integrations'] as const;

export type IntegrationsFilters = {
  search: string;
};

export const defaultIntegrationsFilters: IntegrationsFilters = {
  search: '',
};

export function useIntegrations() {
  const [draft, setDraft] = useState<IntegrationsFilters>(defaultIntegrationsFilters);
  const [applied, setApplied] = useState<IntegrationsFilters>(defaultIntegrationsFilters);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(30);

  const params = {
    page,
    limit,
    search: applied.search || undefined,
  };

  const query = useQuery({
    queryKey: [...integrationsQueryKey, params],
    queryFn: () => listIntegrations(params),
    placeholderData: keepPreviousData,
  });

  function applyFilters() {
    setApplied(draft);
    setPage(1);
  }

  function clearFilters() {
    setDraft(defaultIntegrationsFilters);
    setApplied(defaultIntegrationsFilters);
    setPage(1);
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
    applyFilters,
    clearFilters,
    hasActiveFilters: Boolean(applied.search),
    query,
  };
}
