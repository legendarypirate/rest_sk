export const PAYMENT_METHOD_KINDS = [
  'CASH',
  'CARD',
  'QPAY',
  'EMPLOYEE_BALANCE',
  'COMPANY_SUBSIDY',
] as const;
export type PaymentMethodKind = (typeof PAYMENT_METHOD_KINDS)[number];

export const REFUND_STATUSES = ['PENDING', 'SUCCEEDED', 'FAILED', 'CANCELLED'] as const;
export type RefundStatus = (typeof REFUND_STATUSES)[number];

export type RefundItem = {
  id: string;
  publicId: string;
  orderId: string;
  transactionId: string;
  createdByUserId: string | null;
  status: RefundStatus;
  currency: string;
  amount: string;
  reason: string | null;
  idempotencyKey: string;
  providerRefundId: string | null;
  refundedAt: string | null;
  createdAt: string;
  updatedAt: string;
};
