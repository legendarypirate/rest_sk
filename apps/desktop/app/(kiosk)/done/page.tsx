'use client';

import { DoneScreen } from '../components/Done.screen';
import { useKioskOrderContext } from '../providers/kiosk.order.provider';

export default function DonePage() {
  const order = useKioskOrderContext();

  return (
    <DoneScreen
      orderNo={order.orderNo}
      total={order.total}
      onReset={order.reset}
    />
  );
}
