import type { EmployeeMealKind } from '@packages/types';

export const MEAL_KIND_LABELS: Record<EmployeeMealKind, string> = {
  LUNCH: 'Өдрийн хоол',
  DINNER: 'Оройн хоол',
};

export const MEAL_KIND_OPTIONS = [
  { value: 'LUNCH', label: MEAL_KIND_LABELS.LUNCH },
  { value: 'DINNER', label: MEAL_KIND_LABELS.DINNER },
] as const;
