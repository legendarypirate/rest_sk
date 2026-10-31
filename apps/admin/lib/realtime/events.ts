export const REALTIME_EVENTS = {
  employeeMealOrderUpdated: 'org-meal-order:updated',
} as const;

export type RealtimeEvent = (typeof REALTIME_EVENTS)[keyof typeof REALTIME_EVENTS];
