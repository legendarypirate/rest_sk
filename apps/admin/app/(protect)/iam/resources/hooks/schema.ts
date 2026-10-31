import type { PermissionScope, ResourceDetail } from '@packages/types';
import { z } from 'zod';

import { DEFAULT_RESOURCE_ACTIONS } from '@/lib/resource-actions';

import type {
  CreateResourceDto,
  UpdateResourceDto,
} from '@/types/iam/resource.dto';

const slugPattern = /^[a-z][a-z0-9_]{1,62}$/;

export const resourceFormSchema = z.object({
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
  path: z.string(),
  icon: z.string(),
  groupKey: z.string(),
  groupLabel: z.string(),
  groupSortOrder: z.number().int().min(0).max(10_000),
  sortOrder: z.number().int().min(0).max(10_000),
  isMenu: z.boolean(),
  menuExact: z.boolean(),
  actions: z.array(
    z
      .string()
      .trim()
      .toLowerCase()
      .regex(/^[a-z][a-z0-9_]{1,31}$/, 'Үйлдэл жижиг латин үсэг, тоо, _.'),
  ),
});

export type ResourceFormData = z.infer<typeof resourceFormSchema>;

function optionalText(value: string) {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function getCreateResourceDefaults(): ResourceFormData {
  return {
    slug: '',
    name: '',
    description: '',
    scope: 'PLATFORM',
    path: '',
    icon: 'settings',
    groupKey: 'iam',
    groupLabel: 'Хандалт ба эрх',
    groupSortOrder: 20,
    sortOrder: 100,
    isMenu: true,
    menuExact: false,
    actions: [...DEFAULT_RESOURCE_ACTIONS],
  };
}

export function getUpdateResourceDefaults(
  resource?: ResourceDetail,
): ResourceFormData {
  if (!resource) {
    return getCreateResourceDefaults();
  }

  return {
    slug: resource.slug,
    name: resource.name,
    description: resource.description ?? '',
    scope: resource.scope,
    path: resource.path ?? '',
    icon: resource.icon ?? '',
    groupKey: resource.groupKey ?? '',
    groupLabel: resource.groupLabel ?? '',
    groupSortOrder: resource.groupSortOrder,
    sortOrder: resource.sortOrder,
    isMenu: resource.isMenu,
    menuExact: resource.menuExact,
    actions: resource.actions,
  };
}

export function toCreateResourceDto(values: ResourceFormData): CreateResourceDto {
  return {
    slug: values.slug.trim().toLowerCase(),
    name: values.name.trim(),
    description: optionalText(values.description),
    scope: values.scope as PermissionScope,
    path: optionalText(values.path),
    icon: optionalText(values.icon),
    groupKey: optionalText(values.groupKey),
    groupLabel: optionalText(values.groupLabel),
    groupSortOrder: values.groupSortOrder,
    sortOrder: values.sortOrder,
    isMenu: values.isMenu,
    menuExact: values.menuExact,
    actions: values.actions.map((action) => ({ action })),
  };
}

export function toUpdateResourceDto(
  values: ResourceFormData,
  isSystem: boolean,
): UpdateResourceDto {
  return {
    name: values.name.trim(),
    description: optionalText(values.description) ?? null,
    path: optionalText(values.path) ?? null,
    icon: optionalText(values.icon) ?? null,
    groupKey: optionalText(values.groupKey) ?? null,
    groupLabel: optionalText(values.groupLabel) ?? null,
    groupSortOrder: values.groupSortOrder,
    sortOrder: values.sortOrder,
    isMenu: values.isMenu,
    menuExact: values.menuExact,
    actions: values.actions.map((action) => ({ action })),
    ...(isSystem
      ? {}
      : {
          slug: values.slug.trim().toLowerCase(),
          scope: values.scope as PermissionScope,
        }),
  };
}
