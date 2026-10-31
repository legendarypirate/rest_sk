import type {
  MenuCategoryListItem,
  MenuItemListItem,
  MenuCategoryImageItem,
  MenuItemImageItem,
  Paginated,
} from '@packages/types';

import { api } from '@/lib/api';
import { toSearchParams } from '@/lib/search-params';
import type {
  ListMenuCategoriesQueryDto,
  ListMenuCategoryImagesQueryDto,
  ListMenuItemImagesQueryDto,
  ListMenuItemsQueryDto,
  MapMenuCategoryImagesDto,
  MapMenuItemImagesDto,
  UpsertMenuCategoryDto,
  UpsertMenuCategoryImageDto,
  UpsertMenuItemDto,
  UpsertMenuItemImageDto,
} from '@/types/menus/menu.dto';

export function listMenuCategories(params: ListMenuCategoriesQueryDto = {}) {
  return api<Paginated<MenuCategoryListItem>>(`menu-categories?${toSearchParams({ ...params })}`);
}

export function createMenuCategory(dto: UpsertMenuCategoryDto) {
  return api<MenuCategoryListItem>('menu-categories', {
    method: 'POST',
    body: JSON.stringify(dto),
  });
}

export function updateMenuCategory(id: string, dto: UpsertMenuCategoryDto) {
  return api<MenuCategoryListItem>(`menu-categories/${id}`, {
    method: 'PUT',
    body: JSON.stringify(dto),
  });
}

export function deleteMenuCategory(id: string) {
  return api<void>(`menu-categories/${id}`, { method: 'DELETE' });
}

export function listMenuItems(params: ListMenuItemsQueryDto = {}) {
  return api<Paginated<MenuItemListItem>>(`menu-items?${toSearchParams({ ...params })}`);
}

export function createMenuItem(dto: UpsertMenuItemDto) {
  return api<MenuItemListItem>('menu-items', { method: 'POST', body: JSON.stringify(dto) });
}

export function updateMenuItem(id: string, dto: UpsertMenuItemDto) {
  return api<MenuItemListItem>(`menu-items/${id}`, { method: 'PUT', body: JSON.stringify(dto) });
}

export function deleteMenuItem(id: string) {
  return api<void>(`menu-items/${id}`, { method: 'DELETE' });
}

export function listMenuCategoryImages(params: ListMenuCategoryImagesQueryDto = {}) {
  return api<Paginated<MenuCategoryImageItem>>(`menu-category-images?${toSearchParams({ ...params })}`);
}

export function createMenuCategoryImage(dto: UpsertMenuCategoryImageDto) {
  return api<MenuCategoryImageItem>('menu-category-images', { method: 'POST', body: JSON.stringify(dto) });
}

export function mapMenuCategoryImages(dto: MapMenuCategoryImagesDto) {
  return api<MenuCategoryImageItem[]>('menu-category-images/map', {
    method: 'POST',
    body: JSON.stringify(dto),
  });
}

export function updateMenuCategoryImage(id: string, dto: UpsertMenuCategoryImageDto) {
  return api<MenuCategoryImageItem>(`menu-category-images/${id}`, { method: 'PUT', body: JSON.stringify(dto) });
}

export function deleteMenuCategoryImage(id: string) {
  return api<void>(`menu-category-images/${id}`, { method: 'DELETE' });
}

export function listMenuItemImages(params: ListMenuItemImagesQueryDto = {}) {
  return api<Paginated<MenuItemImageItem>>(`menu-item-images?${toSearchParams({ ...params })}`);
}

export function createMenuItemImage(dto: UpsertMenuItemImageDto) {
  return api<MenuItemImageItem>('menu-item-images', { method: 'POST', body: JSON.stringify(dto) });
}

export function mapMenuItemImages(dto: MapMenuItemImagesDto) {
  return api<MenuItemImageItem[]>('menu-item-images/map', { method: 'POST', body: JSON.stringify(dto) });
}

export function updateMenuItemImage(id: string, dto: UpsertMenuItemImageDto) {
  return api<MenuItemImageItem>(`menu-item-images/${id}`, { method: 'PUT', body: JSON.stringify(dto) });
}

export function deleteMenuItemImage(id: string) {
  return api<void>(`menu-item-images/${id}`, { method: 'DELETE' });
}
