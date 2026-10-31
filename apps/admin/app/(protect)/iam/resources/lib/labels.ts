import type { LucideIcon } from 'lucide-react';
import type { PermissionScope } from '@packages/types';

import { Icons } from '@/utils/icons';

export const RESOURCE_SCOPE_LABELS: Record<PermissionScope, string> = {
  PLATFORM: 'Платформ',
  ORGANIZATION: 'Байгууллага',
};

export const RESOURCE_SCOPE_OPTIONS = (
  Object.entries(RESOURCE_SCOPE_LABELS) as [PermissionScope, string][]
).map(([value, label]) => ({ value, label }));

export const RESOURCE_SYSTEM_OPTIONS = [
  { value: 'true', label: 'Системийн' },
  { value: 'false', label: 'Энгийн' },
];

export const RESOURCE_ICON_OPTIONS = (
  Object.entries(Icons) as [string, LucideIcon][]
).map(([value, icon]) => ({
  value,
  label: value,
  icon,
}));

export function formatDateTime(value: string | null) {
  if (!value) {
    return '—';
  }

  return new Date(value).toLocaleString('mn-MN', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
}

export function canMutateResource(resource: { deletedAt: string | null }) {
  return !resource.deletedAt;
}

export function canDeleteResource(resource: {
  isSystem: boolean;
  deletedAt: string | null;
}) {
  return !resource.isSystem && !resource.deletedAt;
}
