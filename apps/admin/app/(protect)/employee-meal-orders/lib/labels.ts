import type { EmployeeMealOrderStatus } from '@packages/types';

export const MEAL_ORDER_STATUS_LABELS: Record<EmployeeMealOrderStatus, string> = {
  ORDERED: 'Захиалсан',
  CANCELLED: 'Цуцалсан',
  CONSUMED: 'Идсэн',
};

export { formatEmployeeMealFulfillment as formatFulfillmentType } from '@packages/types';
