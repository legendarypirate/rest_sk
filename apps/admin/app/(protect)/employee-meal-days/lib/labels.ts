import type { EmployeeMealDayStatus } from '@packages/types';

export const MEAL_DAY_STATUS_LABELS: Record<EmployeeMealDayStatus, string> = {
  SCHEDULED: 'Нээлттэй',
  CLOSED: 'Хаалттай',
  CANCELLED: 'Цуцлагдсан',
};
