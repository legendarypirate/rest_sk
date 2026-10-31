import { isPlatformSuperAdminRole, type RoleScope } from '@packages/types';

export const ROLE_SCOPE_LABELS: Record<RoleScope, string> = {
  PLATFORM: 'Платформ',
  ORGANIZATION: 'Байгууллага',
};

export const ROLE_SCOPE_OPTIONS = (
  Object.entries(ROLE_SCOPE_LABELS) as [RoleScope, string][]
).map(([value, label]) => ({ value, label }));

export const ROLE_SYSTEM_OPTIONS = [
  { value: 'true', label: 'Системийн' },
  { value: 'false', label: 'Энгийн' },
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

export function canMutateRole(role: {
  slug: string;
  deletedAt: string | null;
}) {
  return !role.deletedAt && !isPlatformSuperAdminRole(role.slug);
}

export function canAssignRolePermissions(role: {
  slug: string;
  isSystem: boolean;
  deletedAt: string | null;
}) {
  return (
    !role.deletedAt &&
    !role.isSystem &&
    !isPlatformSuperAdminRole(role.slug)
  );
}

export function canDeleteRole(role: {
  isSystem: boolean;
  deletedAt: string | null;
  userCount: number;
}) {
  return !role.isSystem && !role.deletedAt && role.userCount === 0;
}
