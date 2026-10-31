import type { CheckoutResult, ReceiptData } from '../types/config.types';
import { buildEbarimtPreviewFromReceipt, submitEbarimtReceipt } from './ebarimt.cjs';
import { chargeCard } from './pos.cjs';
import { printReceipt } from './printer.cjs';

/**
 * Order path, same sequence as smart_kitchen_kiosk:
 * 1. POS charge
 * 2. receipt print
 * 3. e-barimt submit
 */
export async function completeCheckout(receipt: ReceiptData): Promise<CheckoutResult> {
  const orderId = receipt.orderId || `K-${Date.now()}`;
  const pos = await chargeCard(receipt.total);
  if (!pos.success) {
    return {
      success: false,
      orderId,
      message: pos.message,
      pos,
    };
  }

  const print = await printReceipt(receipt);
  if (!print.success) {
    return {
      success: false,
      orderId,
      message: print.message,
      pos,
      print,
    };
  }

  const ebarimtPreview = buildEbarimtPreviewFromReceipt(receipt, {
    receiptType: receipt.ebarimt?.receiptType ?? 'individual',
    consumerTin: receipt.ebarimt?.consumerTin,
  });
  const ebarimtResult = await submitEbarimtReceipt(ebarimtPreview);

  if (!ebarimtResult.success) {
    return {
      success: false,
      orderId,
      message: ebarimtResult.message,
      pos,
      print,
      ebarimt: ebarimtResult,
    };
  }

  return {
    success: true,
    orderId,
    message: 'Захиалга амжилттай!',
    pos,
    print,
    ebarimt: {
      success: true,
      message: ebarimtResult.message,
      billId: ebarimtResult.billId,
      lottery: ebarimtResult.lottery,
      qrData: ebarimtResult.qrData,
      preview: ebarimtPreview,
    },
  };
}
