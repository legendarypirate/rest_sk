import {
  AVAILABILITY_STATUSES,
  FOOD_TYPES,
  RECORD_STATUSES,
  type MenuItemListItem,
} from '@packages/types';
import { z } from 'zod';

const MONEY = /^\d{1,12}(\.\d{1,2})?$/;

export const menuItemSchema = z.object({
  categoryId: z.string().min(1, 'Ангилал сонгоно уу'),
  sku: z.string().trim().min(1, 'Код оруулна уу').max(64),
  name: z.string().trim().min(1, 'Нэр оруулна уу').max(200),
  description: z.string().trim().max(4000),
  foodType: z.enum(FOOD_TYPES),
  price: z
    .string()
    .trim()
    .regex(MONEY, 'Үнэ буруу байна'),
  sortOrder: z.number().int().min(0),
  status: z.enum(RECORD_STATUSES),
  availability: z.enum(AVAILABILITY_STATUSES),
});

export type MenuItemFormData = z.infer<typeof menuItemSchema>;

export function getMenuItemDefaults(item?: MenuItemListItem): MenuItemFormData {
  return {
    categoryId: item?.categoryId ?? '',
    sku: item?.sku ?? '',
    name: item?.name ?? '',
    description: item?.description ?? '',
    foodType: item?.foodType ?? 'ORDERED',
    price: item?.price ?? '0.00',
    sortOrder: item?.sortOrder ?? 0,
    status: item?.status ?? 'ACTIVE',
    availability: item?.availability ?? 'AVAILABLE',
  };
}

export function toMenuItemDto(values: MenuItemFormData) {
  return {
    categoryId: values.categoryId,
    sku: values.sku,
    name: values.name,
    description: values.description || null,
    foodType: values.foodType,
    currency: 'MNT',
    price: values.price,
    sortOrder: values.sortOrder,
    status: values.status,
    availability: values.availability,
  };
}
