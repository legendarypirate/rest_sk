import type { EmployeeStatus } from '@packages/types';

export const EMPLOYEE_STATUS_LABELS: Record<EmployeeStatus, string> = {
  ACTIVE: 'Идэвхтэй',
  SUSPENDED: 'Түдгэлзүүлсэн',
  INACTIVE: 'Идэвхгүй',
};

export const EMPLOYEE_STATUS_CLASS: Record<EmployeeStatus, string> = {
  ACTIVE: 'bg-primary/10 text-primary',
  SUSPENDED: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
  INACTIVE: 'bg-muted text-muted-foreground',
};

export const EMPLOYEE_STATUS_OPTIONS: Array<{
  value: EmployeeStatus;
  label: string;
}> = [
  { value: 'ACTIVE', label: EMPLOYEE_STATUS_LABELS.ACTIVE },
  { value: 'SUSPENDED', label: EMPLOYEE_STATUS_LABELS.SUSPENDED },
  { value: 'INACTIVE', label: EMPLOYEE_STATUS_LABELS.INACTIVE },
];

export function formatDateTime(value: string | null) {
  if (!value) {
    return '—';
  }

  return new Date(value).toLocaleString('mn-MN', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
}
