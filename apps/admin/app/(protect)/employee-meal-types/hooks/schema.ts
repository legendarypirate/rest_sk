import { EMPLOYEE_MEAL_KINDS, type EmployeeMealTypeItem } from '@packages/types';
import { z } from 'zod';

export const mealTypeSchema = z.object({
  kind: z.enum(EMPLOYEE_MEAL_KINDS),
  code: z.string().trim().min(1, 'Код оруулна уу').max(32),
  name: z.string().trim().min(1, 'Нэр оруулна уу').max(100),
  sortOrder: z.number().int().min(0),
  isEnabled: z.boolean(),
});

export type MealTypeFormData = z.infer<typeof mealTypeSchema>;

export function getMealTypeDefaults(item?: EmployeeMealTypeItem): MealTypeFormData {
  return {
    kind: item?.kind ?? 'LUNCH',
    code: item?.code ?? '',
    name: item?.name ?? '',
    sortOrder: item?.sortOrder ?? 0,
    isEnabled: item?.isEnabled ?? true,
  };
}
