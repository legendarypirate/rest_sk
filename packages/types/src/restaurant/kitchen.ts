export const KITCHEN_STATION_TYPES = ['GRILL', 'FRY', 'COLD', 'DRINKS', 'EXPO', 'OTHER'] as const;
export type KitchenStationType = (typeof KITCHEN_STATION_TYPES)[number];

export type KitchenItem = {
  id: string;
  publicId: string;
  code: string;
  name: string;
  isActive: boolean;
  stationCount: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

export const KITCHEN_ORDER_STATUSES = ['QUEUED', 'RECEIVED', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED'] as const;
export type KitchenOrderStatus = (typeof KITCHEN_ORDER_STATUSES)[number];

export type KitchenOrderRecord = {
  id: string;
  kitchenId: string;
  kitchenName: string;
  orderId: string;
  orderNumber: string;
  status: KitchenOrderStatus;
  priority: number;
  receivedAt: string | null;
  startedAt: string | null;
  readyAt: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type KitchenOrderLineItem = {
  id: string;
  kitchenOrderId: string;
  orderItemId: string;
  stationId: string;
  stationName: string;
  status: KitchenOrderStatus;
  quantity: string;
  startedAt: string | null;
  readyAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type KitchenTicketItem = {
  id: string;
  kitchenOrderId: string;
  stationId: string;
  stationName: string;
  ticketNumber: string;
  status: KitchenOrderStatus;
  priority: number;
  printedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type KitchenStationItem = {
  id: string;
  kitchenId: string;
  kitchenName: string;
  code: string;
  name: string;
  stationType: KitchenStationType;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};
