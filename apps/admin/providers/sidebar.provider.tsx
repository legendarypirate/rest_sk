'use client';

import { SidebarProvider } from '@packages/ui/components/sidebar';
import type { ReactNode } from 'react';

export function SidebarAppProvider({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider className="h-svh overflow-hidden">{children}</SidebarProvider>
  );
}
