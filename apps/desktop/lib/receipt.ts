import type { ReceiptData } from '@/electron/types/config.types';
import type { KioskCartLine, KioskServiceType, ReceiptType } from '@/types';

function toOrderType(serviceType: KioskServiceType): ReceiptData['orderType'] {
  return serviceType === 'TAKEAWAY' ? 'takeaway' : 'dine-in';
}

export function toReceiptData(input: {
  orderNo: number;
  cart: KioskCartLine[];
  receiptType: ReceiptType;
  tin: string;
  serviceType: KioskServiceType;
}): ReceiptData {
  const lines = input.cart.map((line) => ({
    name: line.name,
    qty: line.quantity,
    unitPrice: line.price,
    lineTotal: line.price * line.quantity,
  }));
  const subtotal = lines.reduce((sum, line) => sum + line.lineTotal, 0);

  return {
    orderId: `K-${String(input.orderNo).padStart(4, '0')}`,
    orderType: toOrderType(input.serviceType),
    lines,
    subtotal,
    tax: 0,
    total: subtotal,
    kioskName: 'KHONGOR',
    createdAt: new Date().toISOString(),
    ebarimt: {
      receiptType: input.receiptType,
      consumerTin: input.tin || undefined,
    },
  };
}
