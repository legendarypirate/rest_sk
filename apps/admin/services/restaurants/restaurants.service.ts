import type { Paginated, RestaurantDetail, RestaurantListItem } from '@packages/types';

import { api } from '@/lib/api';
import { toSearchParams } from '@/lib/search-params';
import type {
  ListRestaurantsQueryDto,
  UpdateRestaurantSettingDto,
  UpsertRestaurantDto,
} from '@/types/restaurants/restaurant.dto';

export function listRestaurants(params: ListRestaurantsQueryDto = {}) {
  return api<Paginated<RestaurantListItem>>(`restaurants?${toSearchParams({ ...params })}`);
}

export function getRestaurant(id: string) {
  return api<RestaurantDetail>(`restaurants/${id}`);
}

export function createRestaurant(dto: UpsertRestaurantDto) {
  return api<RestaurantDetail>('restaurants', { method: 'POST', body: JSON.stringify(dto) });
}

export function updateRestaurant(id: string, dto: UpsertRestaurantDto) {
  return api<RestaurantDetail>(`restaurants/${id}`, { method: 'PUT', body: JSON.stringify(dto) });
}

export function updateRestaurantSetting(id: string, dto: UpdateRestaurantSettingDto) {
  return api<RestaurantDetail>(`restaurants/${id}/setting`, { method: 'PUT', body: JSON.stringify(dto) });
}

export function deleteRestaurant(id: string) {
  return api<void>(`restaurants/${id}`, { method: 'DELETE' });
}
