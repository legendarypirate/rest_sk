import {
  AVAILABILITY_STATUSES,
  RECORD_STATUSES,
  type MenuCategoryListItem,
} from '@packages/types';
import { z } from 'zod';

export const menuCategorySchema = z.object({
  parentId: z.string(),
  code: z.string().trim().min(1, 'Код оруулна уу').max(32),
  name: z.string().trim().min(1, 'Нэр оруулна уу').max(200),
  description: z.string().trim().max(4000),
  sortOrder: z.number().int().min(0),
  status: z.enum(RECORD_STATUSES),
  availability: z.enum(AVAILABILITY_STATUSES),
});

export type MenuCategoryFormData = z.infer<typeof menuCategorySchema>;

export function getMenuCategoryDefaults(item?: MenuCategoryListItem): MenuCategoryFormData {
  return {
    parentId: item?.parentId ?? '',
    code: item?.code ?? '',
    name: item?.name ?? '',
    description: item?.description ?? '',
    sortOrder: item?.sortOrder ?? 0,
    status: item?.status ?? 'DRAFT',
    availability: item?.availability ?? 'AVAILABLE',
  };
}

export function toMenuCategoryDto(values: MenuCategoryFormData) {
  return {
    parentId: values.parentId || null,
    code: values.code,
    name: values.name,
    description: values.description || null,
    sortOrder: values.sortOrder,
    status: values.status,
    availability: values.availability,
  };
}
