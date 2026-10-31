'use client';

import { useMemo } from 'react';

import { buildEbarimtPreview } from '@/lib/ebarimt/preview';
import { toReceiptData } from '@/lib/receipt';

import { QrScreen } from '../components/Qr.screen';
import { KIOSK_ROUTES } from '../lib/routes';
import { useKioskOrderContext } from '../providers/kiosk.order.provider';

export default function QrPage() {
  const order = useKioskOrderContext();
  const serviceType = order.serviceType ?? 'DINE_IN';

  const receipt = useMemo(
    () =>
      toReceiptData({
        orderNo: order.orderNo,
        cart: order.cart,
        receiptType: order.receiptType,
        tin: order.tin,
        serviceType,
      }),
    [order.orderNo, order.cart, order.receiptType, order.tin, serviceType],
  );

  const fallback = useMemo(
    () =>
      buildEbarimtPreview(receipt, {
        receiptType: order.receiptType,
        consumerTin: order.tin || undefined,
      }),
    [receipt, order.receiptType, order.tin],
  );

  const preview = order.checkoutResult?.ebarimt?.preview ?? fallback;

  return (
    <QrScreen
      preview={{
        ...preview,
        receiptType: order.receiptType,
        consumerTin: order.receiptType === 'company' ? order.tin : preview.consumerTin,
      }}
      orderType={receipt.orderType}
      continueHref={KIOSK_ROUTES.done}
    />
  );
}
