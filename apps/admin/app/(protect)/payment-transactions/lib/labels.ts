import {
  PAYMENT_METHOD_KINDS,
  PAYMENT_STATUSES,
  type PaymentMethodKind,
  type PaymentStatus,
} from '@packages/types';

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  PENDING: 'Төлөөгүй',
  AUTHORIZED: 'Зөвшөөрсөн',
  CAPTURED: 'Төлсөн',
  FAILED: 'Амжилтгүй',
  CANCELLED: 'Цуцалсан',
  PARTIALLY_REFUNDED: 'Хэсэг буцаасан',
  REFUNDED: 'Буцаасан',
};

export const PAYMENT_STATUS_CLASS: Record<PaymentStatus, string> = {
  PENDING: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
  AUTHORIZED: 'bg-sky-500/10 text-sky-700 dark:text-sky-400',
  CAPTURED: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
  FAILED: 'bg-destructive/10 text-destructive',
  CANCELLED: 'bg-muted text-muted-foreground',
  PARTIALLY_REFUNDED: 'bg-orange-500/10 text-orange-700 dark:text-orange-400',
  REFUNDED: 'bg-violet-500/10 text-violet-700 dark:text-violet-400',
};

export const PAYMENT_STATUS_OPTIONS = PAYMENT_STATUSES.map((value) => ({
  value,
  label: PAYMENT_STATUS_LABELS[value],
}));

export const PAYMENT_METHOD_LABELS: Record<PaymentMethodKind, string> = {
  CASH: 'Бэлэн',
  CARD: 'Карт',
  QPAY: 'QPay',
  EMPLOYEE_BALANCE: 'Ажилтны үлдэгдэл',
  COMPANY_SUBSIDY: 'Компани',
};

export const PAYMENT_METHOD_OPTIONS = PAYMENT_METHOD_KINDS.map((value) => ({
  value,
  label: PAYMENT_METHOD_LABELS[value],
}));

export function formatAmount(amount: string, currency = 'MNT') {
  const value = Number(amount);
  if (Number.isNaN(value)) return amount;
  return `${new Intl.NumberFormat('mn-MN').format(value)} ${currency}`;
}

export function formatDateTime(value: string | null) {
  if (!value) return '—';
  return new Date(value).toLocaleString('mn-MN', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
}
