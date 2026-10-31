import type { CheckoutResult, ReceiptData } from '@/electron/types/config.types';

function hasDesktopShell(): boolean {
  return typeof window !== 'undefined' && !!window.desktopShell;
}

function browserCheckout(receipt: ReceiptData): CheckoutResult {
  const orderId = receipt.orderId || `K-${Date.now()}`;
  return {
    success: true,
    orderId,
    message: 'Хөтөч дээр туршилтын төлбөр.',
    pos: { success: true, message: 'POS simulate', transactionId: `sim-${orderId}` },
    print: { success: true, message: 'Printer simulate' },
    ebarimt: {
      success: true,
      message: 'eBarimt simulate',
      billId: `SIM-${orderId}`,
      lottery: '00000000',
      qrData: `ebarimt:simulate:${orderId}`,
    },
  };
}

export async function completeCheckout(receipt: ReceiptData): Promise<CheckoutResult> {
  if (!hasDesktopShell()) {
    return browserCheckout(receipt);
  }
  return window.desktopShell!.completeCheckout(receipt);
}

export async function chargeCard(amount: number) {
  if (!hasDesktopShell()) {
    return browserCheckout({
      orderId: `K-${Date.now()}`,
      orderType: 'dine-in',
      lines: [],
      subtotal: amount,
      tax: 0,
      total: amount,
      createdAt: new Date().toISOString(),
    }).pos;
  }
  return window.desktopShell!.chargeCard(amount);
}

export async function printReceipt(receipt: ReceiptData) {
  if (!hasDesktopShell()) {
    return browserCheckout(receipt).print;
  }
  return window.desktopShell!.printReceipt(receipt);
}

export async function submitEbarimtReceipt(payload: Parameters<NonNullable<Window['desktopShell']>['submitEbarimtReceipt']>[0]) {
  if (!hasDesktopShell()) {
    return browserCheckout({
      orderId: payload.billId,
      orderType: 'dine-in',
      lines: [],
      subtotal: payload.subtotal,
      tax: payload.vat,
      total: payload.total,
      createdAt: payload.date,
    }).ebarimt;
  }
  return window.desktopShell!.submitEbarimtReceipt(payload);
}
