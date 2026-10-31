import type { MenuCategoryListItem } from '@packages/types';

import { toIso } from '@/common/utils/date';

export function toCategory(row: {
  id: string;
  restaurantId: string;
  parentId: string | null;
  code: string;
  name: string;
  description: string | null;
  sortOrder: number;
  status: MenuCategoryListItem['status'];
  availability: MenuCategoryListItem['availability'];
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  restaurant: { name: string };
  parent: { name: string } | null;
}): MenuCategoryListItem {
  return {
    id: row.id,
    restaurantId: row.restaurantId,
    restaurantName: row.restaurant.name,
    parentId: row.parentId,
    parentName: row.parent?.name ?? null,
    code: row.code,
    name: row.name,
    description: row.description,
    sortOrder: row.sortOrder,
    status: row.status,
    availability: row.availability,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    deletedAt: toIso(row.deletedAt),
  };
}
