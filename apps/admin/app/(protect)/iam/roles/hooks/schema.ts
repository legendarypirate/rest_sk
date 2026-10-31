import type { RoleDetail, RoleScope } from '@packages/types';
import { z } from 'zod';

import type { CreateRoleDto, UpdateRoleDto } from '@/types/iam/role.dto';

const slugPattern = /^[a-z][a-z0-9_]{1,62}$/;

export const roleFormSchema = z.object({
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(
      slugPattern,
      'Холбоос жижиг латин үсэг, тоо, доогуур зураасаар бичигдэнэ.',
    ),
  name: z.string().trim().min(2, 'Нэр дор хаяж 2 тэмдэгт байна.').max(100),
  description: z.string().max(2000, 'Тайлбар хэт урт байна.'),
  scope: z.enum(['PLATFORM', 'ORGANIZATION']),
  isDefault: z.boolean(),
  priority: z.number().int().min(0).max(10_000),
});

export type RoleFormData = z.infer<typeof roleFormSchema>;

function optionalText(value: string) {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function getCreateRoleDefaults(): RoleFormData {
  return {
    slug: '',
    name: '',
    description: '',
    scope: 'PLATFORM',
    isDefault: false,
    priority: 0,
  };
}

export function getUpdateRoleDefaults(role?: RoleDetail): RoleFormData {
  if (!role) {
    return getCreateRoleDefaults();
  }

  return {
    slug: role.slug,
    name: role.name,
    description: role.description ?? '',
    scope: role.scope,
    isDefault: role.isDefault,
    priority: role.priority,
  };
}

export function toCreateRoleDto(values: RoleFormData): CreateRoleDto {
  return {
    slug: values.slug.trim().toLowerCase(),
    name: values.name.trim(),
    description: optionalText(values.description),
    scope: values.scope as RoleScope,
    isDefault: values.isDefault,
    priority: values.priority,
  };
}

export function toUpdateRoleDto(
  values: RoleFormData,
  isSystem: boolean,
): UpdateRoleDto {
  return {
    name: values.name.trim(),
    description: optionalText(values.description) ?? null,
    isDefault: values.isDefault,
    priority: values.priority,
    ...(isSystem
      ? {}
      : {
          slug: values.slug.trim().toLowerCase(),
          scope: values.scope as RoleScope,
        }),
  };
}

export function permissionsChanged(current: string[], next: string[]) {
  return (
    current.length !== next.length || next.some((id) => !current.includes(id))
  );
}
