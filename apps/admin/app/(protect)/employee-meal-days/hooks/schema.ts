import { EMPLOYEE_MEAL_DAY_STATUSES, type EmployeeMealDayItem } from '@packages/types';
import { z } from 'zod';

export const mealDaySchema = z.object({
  mealTypeId: z.string().min(1, 'Төрөл сонгоно уу'),
  serviceDate: z.string().min(1, 'Огноо оруулна уу'),
  menuItemId: z.string().min(1, 'Хоол сонгоно уу'),
  status: z.enum(EMPLOYEE_MEAL_DAY_STATUSES),
});

export type MealDayFormData = z.infer<typeof mealDaySchema>;

export function getMealDayDefaults(item?: EmployeeMealDayItem): MealDayFormData {
  return {
    mealTypeId: item?.mealTypeId ?? '',
    serviceDate: item?.serviceDate ?? new Date().toISOString().slice(0, 10),
    menuItemId: item?.menuItemId ?? '',
    status: item?.status ?? 'SCHEDULED',
  };
}
