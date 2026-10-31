import type { MenuItemImageItem } from '@packages/types';
import { z } from 'zod';

export const menuItemImageSchema = z.object({
  menuItemId: z.string().min(1, 'Хоол сонгоно уу'),
  mediaAssetId: z.string().min(1, 'Зураг сонгоно уу'),
  sortOrder: z.number().int().min(0),
  isPrimary: z.boolean(),
  altText: z.string().trim().max(300),
});

export type MenuItemImageFormData = z.infer<typeof menuItemImageSchema>;

export function getMenuItemImageDefaults(item?: MenuItemImageItem): MenuItemImageFormData {
  return {
    menuItemId: item?.menuItemId ?? '',
    mediaAssetId: item?.mediaAssetId ?? '',
    sortOrder: item?.sortOrder ?? 0,
    isPrimary: item?.isPrimary ?? false,
    altText: item?.altText ?? '',
  };
}
