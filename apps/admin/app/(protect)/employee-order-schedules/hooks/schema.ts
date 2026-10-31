import type { EmployeeOrderScheduleItem } from '@packages/types';
import { z } from 'zod';

export const scheduleSchema = z.object({
  mealTypeId: z.string().min(1, 'Төрөл сонгоно уу'),
  name: z.string().trim().min(1, 'Нэр оруулна уу').max(120),
  weekdays: z.array(z.number()).min(1, 'Өдөр сонгоно уу'),
  opensAt: z.string().regex(/^\d{2}:\d{2}$/, 'Хоолны цаг сонгоно уу'),
  closesAt: z.string().regex(/^\d{2}:\d{2}$/, 'Дуусах цаг сонгоно уу'),
  isEnabled: z.boolean(),
});

export type ScheduleFormData = z.infer<typeof scheduleSchema>;

export function getScheduleDefaults(item?: EmployeeOrderScheduleItem): ScheduleFormData {
  return {
    mealTypeId: item?.mealTypeId ?? '',
    name: item?.name ?? '',
    weekdays: item?.weekdays ?? [1, 2, 3, 4, 5],
    opensAt: item?.opensAt ?? '08:00',
    closesAt: item?.closesAt ?? '10:30',
    isEnabled: item?.isEnabled ?? true,
  };
}
