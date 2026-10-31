'use client';

import { KioskFrame } from './components/Kiosk.frame';
import { KioskOrderProvider } from './providers/kiosk.order.provider';

export default function KioskLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <KioskOrderProvider>
      <KioskFrame>{children}</KioskFrame>
    </KioskOrderProvider>
  );
}
