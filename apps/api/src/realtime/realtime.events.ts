export const REALTIME_NAMESPACE = '/realtime';

export const REALTIME_EVENT_VERSION = 1;

export const CLIENT_EVENTS = {
  ping: 'ping',
} as const;

export const SERVER_EVENTS = {
  connected: 'connected',
  error: 'error',
  notification: 'notification',
  orgDailyMenuUpdated: 'org-daily-menu:updated',
  orgMealOrderUpdated: 'org-meal-order:updated',
  pong: 'pong',
} as const;

export const Rooms = {
  user: (userId: string) => `user:${userId}`,
  role: (role: string) => `role:${role}`,
  org: (organizationId: string) => `org:${organizationId}`,
  kitchen: () => 'kitchen',
  staff: () => 'staff',
  employeeMealOrders: () => 'employee-meal-orders',
} as const;

const KITCHEN_ROLES = ['CHEF', 'CASHIER'] as const;
const STAFF_ROLES = ['ADMIN', 'CHEF', 'CASHIER'] as const;

export function isKitchenRole(role: string): boolean {
  return (KITCHEN_ROLES as readonly string[]).includes(role);
}

export function isStaffRole(role: string): boolean {
  return (STAFF_ROLES as readonly string[]).includes(role);
}

export type WsErrorPayload = {
  event?: string;
  code: string;
  message: string;
};

export type WsAck<T = unknown> =
  { success: true; data: T } | { success: false; error: WsErrorPayload };

export type RealtimeEnvelope<T> = {
  v: number;
  eventId: string;
  at: string;
  data: T;
};

export type RealtimeConnectedPayload = {
  userId: string;
  role: string;
  rooms: string[];
  serverTime: string;
};

export type NotificationData = {
  id: string;
  title: string;
  body?: string;
  level: 'info' | 'success' | 'warning' | 'error';
  type?: string;
  meta?: Record<string, string>;
};

export type OrgDailyMenuUpdateAction = 'created' | 'updated' | 'deleted';

export type OrgDailyMenuUpdateData = {
  menuId: string;
  action: OrgDailyMenuUpdateAction;
};

export type OrgMealOrderUpdateAction = 'created' | 'updated' | 'deleted';

export type OrgMealOrderUpdateData = {
  orderId: string;
  action: OrgMealOrderUpdateAction;
  employeeCode: string;
  employeeId?: string;
  menuId?: string | null;
};
