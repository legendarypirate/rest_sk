import type { MenuCategoryImageItem, MenuItemImageItem, MenuItemListItem } from '@packages/types';

import { toIso } from '@/common/utils/date';

function money(value: { toFixed: (digits: number) => string }) {
  return value.toFixed(2);
}

type AssetRow = {
  storageUrl: string;
  thumbnailUrl: string | null;
  mimeType: string;
  originalFilename: string;
};

function toImageLink(row: {
  id: string;
  mediaAssetId: string;
  sortOrder: number;
  isPrimary: boolean;
  altText: string | null;
  createdAt: Date;
  updatedAt: Date;
  mediaAsset: AssetRow;
}) {
  return {
    id: row.id,
    mediaAssetId: row.mediaAssetId,
    storageUrl: row.mediaAsset.storageUrl,
    thumbnailUrl: row.mediaAsset.thumbnailUrl,
    mimeType: row.mediaAsset.mimeType,
    originalFilename: row.mediaAsset.originalFilename,
    sortOrder: row.sortOrder,
    isPrimary: row.isPrimary,
    altText: row.altText,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function toMenuItem(row: {
  id: string;
  publicId: string;
  categoryId: string;
  sku: string;
  name: string;
  description: string | null;
  foodType: MenuItemListItem['foodType'];
  currency: string;
  price: { toFixed: (digits: number) => string };
  sortOrder: number;
  status: MenuItemListItem['status'];
  availability: MenuItemListItem['availability'];
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  category: { name: string };
  _count: { images: number };
}): MenuItemListItem {
  return {
    id: row.id,
    publicId: row.publicId,
    categoryId: row.categoryId,
    categoryName: row.category.name,
    sku: row.sku,
    name: row.name,
    description: row.description,
    foodType: row.foodType,
    currency: row.currency,
    price: money(row.price),
    sortOrder: row.sortOrder,
    status: row.status,
    availability: row.availability,
    imageCount: row._count.images,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    deletedAt: toIso(row.deletedAt),
  };
}

export function toCategoryImage(row: {
  id: string;
  menuCategoryId: string;
  mediaAssetId: string;
  sortOrder: number;
  isPrimary: boolean;
  altText: string | null;
  createdAt: Date;
  updatedAt: Date;
  mediaAsset: AssetRow;
}): MenuCategoryImageItem {
  return { ...toImageLink(row), menuCategoryId: row.menuCategoryId };
}

export function toItemImage(row: {
  id: string;
  menuItemId: string;
  mediaAssetId: string;
  sortOrder: number;
  isPrimary: boolean;
  altText: string | null;
  createdAt: Date;
  updatedAt: Date;
  mediaAsset: AssetRow;
}): MenuItemImageItem {
  return { ...toImageLink(row), menuItemId: row.menuItemId };
}
