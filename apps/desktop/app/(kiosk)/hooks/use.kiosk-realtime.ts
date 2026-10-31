'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { REALTIME_EVENTS } from '@/lib/realtime/events';
import { socketService } from '@/lib/realtime/realtime';

import { kioskCatalogQueryKey } from './use.kiosk-catalog';

export function useKioskRealtime() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const socket = socketService.connect();
    if (!socket) {
      return;
    }

    function invalidateCatalog() {
      void queryClient.invalidateQueries({ queryKey: kioskCatalogQueryKey });
    }

    socket.on(REALTIME_EVENTS.orgDailyMenuUpdated, invalidateCatalog);

    return () => {
      socket.off(REALTIME_EVENTS.orgDailyMenuUpdated, invalidateCatalog);
    };
  }, [queryClient]);
}
