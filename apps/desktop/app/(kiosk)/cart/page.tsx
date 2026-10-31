'use client';

import { CartScreen } from '../components/Cart.screen';
import { KIOSK_ROUTES } from '../lib/routes';
import { useKioskOrderContext } from '../providers/kiosk.order.provider';

export default function CartPage() {
  const order = useKioskOrderContext();

  return (
    <CartScreen
      cart={order.cart}
      total={order.total}
      backHref={KIOSK_ROUTES.menu}
      continueHref={KIOSK_ROUTES.payment}
      onAdjust={order.adjust}
    />
  );
}
