'use client';

import {
  createContext,
  useContext,
  type ReactNode,
} from 'react';

import { useKioskOrder } from '../hooks/use.kiosk-order';
import { useKioskRealtime } from '../hooks/use.kiosk-realtime';

type KioskOrderValue = ReturnType<typeof useKioskOrder>;

const KioskOrderContext = createContext<KioskOrderValue | null>(null);

export function KioskOrderProvider({ children }: { children: ReactNode }) {
  const value = useKioskOrder();
  useKioskRealtime();

  return (
    <KioskOrderContext.Provider value={value}>
      {children}
    </KioskOrderContext.Provider>
  );
}

export function useKioskOrderContext() {
  const value = useContext(KioskOrderContext);

  if (!value) {
    throw new Error('useKioskOrderContext must be used inside KioskOrderProvider');
  }

  return value;
}
