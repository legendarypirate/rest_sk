import type { ActorType, AuditAction, AuditActorSummary } from '@packages/types';

export const AUDIT_ACTION_LABELS: Record<AuditAction, string> = {
  CREATE: 'Үүсгэсэн',
  READ: 'Уншсан',
  UPDATE: 'Шинэчилсэн',
  DELETE: 'Устгасан',
  LOGIN: 'Нэвтэрсэн',
  LOGOUT: 'Гарсан',
  EXPORT: 'Экспорт',
  INVITE: 'Урьсан',
  REVOKE: 'Цуцалсан',
  IMPERSONATE: 'Төлөөлөн нэвтэрсэн',
  PERMISSION_GRANT: 'Эрх олгосон',
  PERMISSION_REVOKE: 'Эрх хассан',
};

export const AUDIT_ACTION_OPTIONS = (
  Object.entries(AUDIT_ACTION_LABELS) as [AuditAction, string][]
).map(([value, label]) => ({ value, label }));

export const ACTOR_TYPE_LABELS: Record<ActorType, string> = {
  USER: 'Хэрэглэгч',
  SYSTEM: 'Систем',
  API_KEY: 'API түлхүүр',
  SERVICE_ACCOUNT: 'Системийн хэрэглэгч',
  IMPERSONATOR: 'Төлөөлөгч',
  ANONYMOUS: 'Зочин',
};

export function formatDateTime(value: string | null) {
  if (!value) {
    return '—';
  }

  return new Date(value).toLocaleString('mn-MN', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
}

export function actorLabel(actor: AuditActorSummary, fallback?: string) {
  if (!actor) {
    return fallback ?? '—';
  }

  return actor.displayName || actor.email || actor.username || fallback || '—';
}
