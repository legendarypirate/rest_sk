import type { PaymentMethodKind } from './payment';

export const ORDER_CHANNELS = ['KIOSK', 'POS', 'ADMIN'] as const;
export type OrderChannel = (typeof ORDER_CHANNELS)[number];

export const SERVICE_TYPES = ['DINE_IN', 'TAKEAWAY'] as const;
export type ServiceType = (typeof SERVICE_TYPES)[number];

export const ORDER_STATUSES = [
  'DRAFT',
  'CREATED',
  'CONFIRMED',
  'KITCHEN_RECEIVED',
  'PREPARING',
  'READY',
  'COMPLETED',
  'CANCELLED',
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const PAYER_ROLES = ['CUSTOMER', 'EMPLOYEE', 'COMPANY'] as const;
export type PayerRole = (typeof PAYER_ROLES)[number];

export const PAYMENT_STATUSES = [
  'PENDING',
  'AUTHORIZED',
  'CAPTURED',
  'FAILED',
  'CANCELLED',
  'PARTIALLY_REFUNDED',
  'REFUNDED',
] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const PAYMENT_EVENT_STATUSES = ['RECEIVED', 'PROCESSED', 'IGNORED', 'FAILED'] as const;
export type PaymentEventStatus = (typeof PAYMENT_EVENT_STATUSES)[number];

export type OrderItem = {
  id: string;
  publicId: string;
  orderNumber: string;
  channel: OrderChannel;
  serviceType: ServiceType;
  status: OrderStatus;
  currency: string;
  employeeId: string | null;
  kioskDeviceId: string | null;
  kioskSessionId: string | null;
  subtotal: string;
  discountTotal: string;
  subsidyTotal: string;
  grandTotal: string;
  note: string | null;
  openedAt: string;
  confirmedAt: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type OrderLineItem = {
  id: string;
  orderId: string;
  menuItemId: string | null;
  lineNumber: number;
  nameSnapshot: string;
  skuSnapshot: string;
  variantSnapshot: string | null;
  quantity: string;
  currency: string;
  unitPrice: string;
  discountAmount: string;
  subsidyAmount: string;
  lineTotal: string;
  note: string | null;
  createdAt: string;
  updatedAt: string;
};

export type OrderStatusHistoryItem = {
  id: string;
  orderId: string;
  fromStatus: OrderStatus | null;
  toStatus: OrderStatus;
  reason: string | null;
  changedByUserId: string | null;
  createdAt: string;
};

export type PaymentTransactionItem = {
  id: string;
  publicId: string;
  orderId: string;
  method: PaymentMethodKind;
  payerRole: PayerRole;
  status: PaymentStatus;
  currency: string;
  amount: string;
  idempotencyKey: string;
  providerTransactionId: string | null;
  failureCode: string | null;
  failureMessage: string | null;
  authorizedAt: string | null;
  capturedAt: string | null;
  failedAt: string | null;
  cancelledAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PaymentEventItem = {
  id: string;
  transactionId: string;
  source: string;
  providerEventId: string;
  eventType: string;
  status: PaymentEventStatus;
  processedAt: string | null;
  createdAt: string;
};
