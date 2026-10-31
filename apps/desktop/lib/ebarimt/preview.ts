import type { EbarimtOptions, EbarimtPreview } from '@packages/types';
import type { ReceiptData } from '@/electron/types/config.types';

import { MERCHANT_NAME, MERCHANT_TIN } from './layout';

function randomLottery(): string {
  return String(Math.floor(10000000 + Math.random() * 90000000));
}

function buildBillId(orderId: string): string {
  return `EB-${orderId.replace(/^K-/, '')}`;
}

export function buildEbarimtPreview(
  receipt: ReceiptData,
  options: EbarimtOptions,
  fixed?: { billId?: string; lottery?: string; qrData?: string },
): EbarimtPreview {
  const billId = fixed?.billId ?? buildBillId(receipt.orderId);
  const lottery = fixed?.lottery ?? randomLottery();
  const qrData = fixed?.qrData ?? `https://ebarimt.mn/?bill=${billId}&lottery=${lottery}`;

  const vatRate = receipt.subtotal > 0 ? receipt.tax / receipt.subtotal : 0;

  return {
    billId,
    lottery,
    qrData,
    merchantName: MERCHANT_NAME,
    merchantTin: MERCHANT_TIN,
    date: receipt.createdAt,
    receiptType: options.receiptType,
    consumerTin: options.receiptType === 'company' ? options.consumerTin : undefined,
    subtotal: receipt.subtotal,
    vat: receipt.tax,
    total: receipt.total,
    items: receipt.lines.map((line) => ({
      name: line.name,
      qty: line.qty,
      unitPrice: line.unitPrice,
      total: line.lineTotal,
      vat: Math.round(line.lineTotal * vatRate),
    })),
    simulate: true,
  };
}

export function validateEbarimtOptions(options: EbarimtOptions): string | null {
  if (options.receiptType === 'company') {
    const tin = options.consumerTin?.trim() ?? '';
    if (!/^\d{7,10}$/.test(tin)) {
      return 'Байгууллагын ТТД 7–10 оронтой тоо байх ёстой';
    }
  }
  return null;
}
