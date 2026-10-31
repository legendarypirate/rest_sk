import type { EbarimtPreview } from '@packages/types';

import type { ReceiptData } from '../types/config.types';

const MERCHANT_NAME = 'KHONGOR';
const MERCHANT_TIN = '0000000';

function randomLottery(): string {
  return String(Math.floor(10000000 + Math.random() * 90000000));
}

export function buildEbarimtPreviewFromReceipt(
  receipt: ReceiptData,
  options: { receiptType: 'individual' | 'company'; consumerTin?: string },
): EbarimtPreview {
  const billId = `EB-${receipt.orderId.replace(/^K-/, '')}`;
  const lottery = randomLottery();

  const vatRate = receipt.subtotal > 0 ? receipt.tax / receipt.subtotal : 0;

  return {
    billId,
    lottery,
    qrData: `https://ebarimt.mn/?bill=${billId}&lottery=${lottery}`,
    merchantName: MERCHANT_NAME,
    merchantTin: MERCHANT_TIN,
    date: receipt.createdAt,
    receiptType: options.receiptType,
    consumerTin: options.consumerTin,
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

export async function submitEbarimtReceipt(preview: EbarimtPreview) {
  await new Promise((resolve) => setTimeout(resolve, 600));

  return {
    success: true,
    message: '[SIMULATE] e-barimt бүртгэгдлээ',
    billId: preview.billId,
    lottery: preview.lottery,
    qrData: preview.qrData,
    preview,
  };
}
