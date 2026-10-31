'use client';

import { usePathname } from 'next/navigation';

import { SERVICE_TYPE_LABELS } from '../lib/labels';
import { KioskShell } from './Kiosk.shell';
import { KioskStage } from './Kiosk.stage';
import { useKioskOrderContext } from '../providers/kiosk.order.provider';

type KioskFrameProps = {
  children: React.ReactNode;
};

export function KioskFrame({ children }: KioskFrameProps) {
  const pathname = usePathname();
  const { serviceType } = useKioskOrderContext();
  const attract = pathname === '/' || pathname === '';

  return (
    <KioskStage>
      <KioskShell
        attract={attract}
        serviceLabel={
          serviceType ? SERVICE_TYPE_LABELS[serviceType] : undefined
        }
      >
        {children}
      </KioskShell>
    </KioskStage>
  );
}
