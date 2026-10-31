import type { MediaUploadStatus } from '@packages/types';

export function formatDateTime(value: string | null) {
  if (!value) {
    return '—';
  }

  return new Date(value).toLocaleString('mn-MN', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
}

export const MEDIA_STATUS_LABELS: Record<MediaUploadStatus, string> = {
  PENDING: 'Хүлээгдэж буй',
  STORED: 'Хадгалсан',
  FAILED: 'Амжилтгүй',
};

export const MEDIA_STATUS_CLASS: Record<MediaUploadStatus, string> = {
  PENDING: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
  STORED: 'bg-primary/10 text-primary',
  FAILED: 'bg-destructive/10 text-destructive',
};

export const MEDIA_STATUS_OPTIONS: Array<{
  value: MediaUploadStatus;
  label: string;
}> = [
  { value: 'PENDING', label: MEDIA_STATUS_LABELS.PENDING },
  { value: 'STORED', label: MEDIA_STATUS_LABELS.STORED },
  { value: 'FAILED', label: MEDIA_STATUS_LABELS.FAILED },
];

export function formatBytes(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
