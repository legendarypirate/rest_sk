export const REALTIME_EVENTS = {
  connected: 'connected',
  orgDailyMenuUpdated: 'org-daily-menu:updated',
  orgMealOrderUpdated: 'org-meal-order:updated',
} as const;

export type RealtimeEvent =
  (typeof REALTIME_EVENTS)[keyof typeof REALTIME_EVENTS];
