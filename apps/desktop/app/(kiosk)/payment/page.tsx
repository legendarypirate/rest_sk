'use client';

import { PaymentScreen } from '../components/Payment.screen';
import { KIOSK_ROUTES } from '../lib/routes';
import { useKioskOrderContext } from '../providers/kiosk.order.provider';

export default function PaymentPage() {
  const order = useKioskOrderContext();

  return (
    <PaymentScreen
      total={order.total}
      orderNo={order.orderNo}
      receiptType={order.receiptType}
      tin={order.tin}
      submitting={order.submitting}
      backHref={KIOSK_ROUTES.menu}
      onReceiptTypeChange={order.setReceiptType}
      onTinChange={order.setTin}
      onConfirm={() => order.submitCheckout()}
    />
  );
}
