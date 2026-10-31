import type { EbarimtPreview } from '@packages/types';
import type { ReceiptData } from '@/electron/types/config.types';

export const MERCHANT_NAME = 'KHONGOR';
export const MERCHANT_TIN = '0000000';
export const MERCHANT_ADDRESS = 'Улаанбаатар хот';

const THERMAL_WIDTH_CHARS = 48;

export function dashLine(char = '-'): string {
  return char.repeat(THERMAL_WIDTH_CHARS);
}

export function centerText(text: string, width = THERMAL_WIDTH_CHARS): string {
  if (text.length >= width) {
    return text.slice(0, width);
  }
  const pad = Math.floor((width - text.length) / 2);
  return ' '.repeat(pad) + text;
}

export function padLine(left: string, right: string, width = THERMAL_WIDTH_CHARS): string {
  const gap = width - left.length - right.length;
  if (gap < 1) {
    return `${left.slice(0, width - right.length - 1)} ${right}`;
  }
  return left + ' '.repeat(gap) + right;
}

export function formatMoney(value: number): string {
  return `${value.toLocaleString('mn-MN')}₮`;
}

export function receiptTypeLabel(type: EbarimtPreview['receiptType']): string {
  return type === 'company' ? 'Байгууллага' : 'Хувь хүн';
}

export function orderTypeLabel(type?: ReceiptData['orderType']): string {
  return type === 'takeaway' ? 'Авч явах' : 'Энд идэх';
}

export function formatEbarimtDate(iso: string): string {
  return new Date(iso).toLocaleString('mn-MN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export function buildEbarimtReceiptLines(
  preview: EbarimtPreview,
  orderType?: ReceiptData['orderType'],
): string[] {
  const lines: string[] = [
    dashLine('='),
    centerText('И-БАРИМТ'),
    centerText('e-barimt'),
    dashLine('='),
    centerText(preview.merchantName),
    centerText(MERCHANT_ADDRESS),
    centerText(`ТТД: ${preview.merchantTin}`),
    dashLine(),
    `Баримтын төрөл: ${receiptTypeLabel(preview.receiptType)}`,
  ];

  if (preview.receiptType === 'company' && preview.consumerTin) {
    lines.push(`Худалдан авагч ТТД: ${preview.consumerTin}`);
  }

  lines.push(
    `Огноо: ${formatEbarimtDate(preview.date)}`,
    `ДДТД: ${preview.billId}`,
    orderType ? `Захиалга: ${orderTypeLabel(orderType)}` : '',
    dashLine(),
  );

  for (const item of preview.items) {
    lines.push(item.name);
    lines.push(padLine(`  ${item.qty} x ${formatMoney(item.unitPrice)}`, formatMoney(item.total)));
    lines.push(padLine('  НХАТ:', formatMoney(item.vat)));
  }

  lines.push(
    dashLine(),
    padLine('Бүтээгдэхүүн:', formatMoney(preview.subtotal)),
    padLine('НХАТ (10%):', formatMoney(preview.vat)),
    padLine('НИЙТ ДҮН:', formatMoney(preview.total)),
    dashLine('='),
    centerText('[ QR КОД ]'),
    centerText(`Сугалаа: ${preview.lottery}`),
    dashLine(),
    centerText('ebarimt.mn'),
    centerText('Баярлалаа!'),
    dashLine('='),
  );

  return lines.filter((line) => line !== '');
}
