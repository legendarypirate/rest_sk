import type { AvailabilityStatus, FoodType, RecordStatus } from '@packages/types';

export type ListMenuCategoriesQueryDto = {
  page?: number;
  limit?: number | '*';
  search?: string;
  status?: RecordStatus;
  availability?: AvailabilityStatus;
};

export type ListMenuItemsQueryDto = {
  page?: number;
  limit?: number | '*';
  categoryId?: string;
  search?: string;
  status?: RecordStatus;
  availability?: AvailabilityStatus;
  foodType?: FoodType;
};

export type UpsertMenuItemDto = {
  categoryId: string;
  sku: string;
  name: string;
  description: string | null;
  foodType?: FoodType;
  currency?: string;
  price: string;
  sortOrder?: number;
  status?: RecordStatus;
  availability?: AvailabilityStatus;
};

export type ListMenuCategoryImagesQueryDto = {
  page?: number;
  limit?: number | '*';
  menuCategoryId?: string;
};

export type UpsertMenuCategoryImageDto = {
  menuCategoryId: string;
  mediaAssetId: string;
  sortOrder?: number;
  isPrimary?: boolean;
  altText: string | null;
};

export type MapMenuCategoryImagesDto = {
  menuCategoryId: string;
  mediaAssetIds: string[];
  sortOrder?: number;
  firstIsPrimary?: boolean;
  altText: string | null;
};

export type ListMenuItemImagesQueryDto = {
  page?: number;
  limit?: number | '*';
  menuItemId?: string;
};

export type UpsertMenuItemImageDto = {
  menuItemId: string;
  mediaAssetId: string;
  sortOrder?: number;
  isPrimary?: boolean;
  altText: string | null;
};

export type MapMenuItemImagesDto = {
  menuItemId: string;
  mediaAssetIds: string[];
  sortOrder?: number;
  firstIsPrimary?: boolean;
  altText: string | null;
};

export type UpsertMenuCategoryDto = {
  parentId: string | null;
  code: string;
  name: string;
  description: string | null;
  sortOrder?: number;
  status?: RecordStatus;
  availability?: AvailabilityStatus;
};
