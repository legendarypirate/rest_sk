import { RECORD_STATUSES, type RecordStatus } from '@packages/types';

export const RECORD_STATUS_LABELS: Record<RecordStatus, string> = {
  DRAFT: 'Ноорог',
  ACTIVE: 'Идэвхтэй',
  INACTIVE: 'Идэвхгүй',
  ARCHIVED: 'Архив',
};

export const RECORD_STATUS_CLASS: Record<RecordStatus, string> = {
  DRAFT: 'bg-muted text-muted-foreground',
  ACTIVE: 'bg-primary/10 text-primary',
  INACTIVE: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
  ARCHIVED: 'bg-muted text-muted-foreground',
};

export const RECORD_STATUS_OPTIONS = RECORD_STATUSES.map((value) => ({
  value,
  label: RECORD_STATUS_LABELS[value],
}));
