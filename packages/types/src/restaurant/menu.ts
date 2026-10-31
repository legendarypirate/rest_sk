import type { RecordStatus } from './restaurant';

export const AVAILABILITY_STATUSES = ['AVAILABLE', 'UNAVAILABLE', 'OUT_OF_STOCK'] as const;
export type AvailabilityStatus = (typeof AVAILABILITY_STATUSES)[number];

export const FOOD_TYPES = ['E_FOOD', 'ORDERED'] as const;
export type FoodType = (typeof FOOD_TYPES)[number];

export type MenuCategoryListItem = {
  id: string;
  restaurantId: string;
  restaurantName: string;
  parentId: string | null;
  parentName: string | null;
  code: string;
  name: string;
  description: string | null;
  sortOrder: number;
  status: RecordStatus;
  availability: AvailabilityStatus;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

export type MenuCategoryDetail = MenuCategoryListItem;

export type MenuItemListItem = {
  id: string;
  publicId: string;
  categoryId: string;
  categoryName: string;
  sku: string;
  name: string;
  description: string | null;
  foodType: FoodType;
  currency: string;
  price: string;
  sortOrder: number;
  status: RecordStatus;
  availability: AvailabilityStatus;
  imageCount: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

export type MenuItemDetail = MenuItemListItem;

export type MenuImageLink = {
  id: string;
  mediaAssetId: string;
  storageUrl: string;
  thumbnailUrl: string | null;
  mimeType: string;
  originalFilename: string;
  sortOrder: number;
  isPrimary: boolean;
  altText: string | null;
  createdAt: string;
  updatedAt: string;
};

export type MenuCategoryImageItem = MenuImageLink & {
  menuCategoryId: string;
};

export type MenuItemImageItem = MenuImageLink & {
  menuItemId: string;
};
