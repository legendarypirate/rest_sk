'use client';

import { useQuery } from '@tanstack/react-query';

import { listKioskCatalog } from '@/services/kiosk/catalog.service';

export const kioskCatalogQueryKey = ['kiosk', 'catalog'] as const;

export function useKioskCatalog() {
  return useQuery({
    queryKey: kioskCatalogQueryKey,
    queryFn: listKioskCatalog,
    staleTime: 60_000,
  });
}
