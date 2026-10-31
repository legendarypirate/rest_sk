import type { UserStatus } from '@packages/types';

export const USER_STATUS_LABELS: Record<UserStatus, string> = {
  PENDING: 'Хүлээгдэж буй',
  ACTIVE: 'Идэвхтэй',
  SUSPENDED: 'Түдгэлзүүлсэн',
  LOCKED: 'Түгжигдсэн',
  DEACTIVATED: 'Идэвхгүй',
  DELETED: 'Устгасан',
};

export const USER_STATUS_OPTIONS = (
  Object.entries(USER_STATUS_LABELS) as [UserStatus, string][]
).map(([value, label]) => ({ value, label }));

export const CREATE_STATUS_OPTIONS = USER_STATUS_OPTIONS.filter(
  (option) => option.value !== 'DELETED',
);

export function formatDateTime(value: string | null) {
  if (!value) {
    return '—';
  }

  return new Date(value).toLocaleString('mn-MN', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
}

export function displayName(user: {
  displayName: string | null;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  username: string | null;
}) {
  const joined = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
  return user.displayName || joined || user.email || user.username || '—';
}

export const USER_STATUS_CLASS: Record<UserStatus, string> = {
  PENDING: 'bg-amber-500/10 text-amber-700 dark:text-amber-400',
  ACTIVE: 'bg-primary/10 text-primary',
  SUSPENDED: 'bg-orange-500/10 text-orange-700 dark:text-orange-400',
  LOCKED: 'bg-orange-500/10 text-orange-700 dark:text-orange-400',
  DEACTIVATED: 'bg-muted text-muted-foreground',
  DELETED: 'bg-destructive/10 text-destructive',
};

export function canMutateUser(user: {
  isSystemUser: boolean;
  status: UserStatus;
  deletedAt: string | null;
}) {
  return !user.isSystemUser && user.status !== 'DELETED' && !user.deletedAt;
}
