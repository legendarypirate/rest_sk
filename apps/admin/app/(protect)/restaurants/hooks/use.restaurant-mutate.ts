'use client';

import { toast } from '@packages/ui/components/sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { getApiErrorMessage } from '@/lib/api-error';
import {
  createRestaurant,
  deleteRestaurant,
  updateRestaurant,
  updateRestaurantSetting,
} from '@/services/restaurants/restaurants.service';
import type { UpdateRestaurantSettingDto, UpsertRestaurantDto } from '@/types/restaurants/restaurant.dto';

import { restaurantsQueryKey } from './use.restaurants';

export function useRestaurantMutate() {
  const queryClient = useQueryClient();
  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: restaurantsQueryKey });
  };
  const create = useMutation({
    mutationFn: (dto: UpsertRestaurantDto) => createRestaurant(dto),
    onSuccess: invalidate,
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });
  const update = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpsertRestaurantDto }) => updateRestaurant(id, dto),
    onSuccess: invalidate,
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });
  const updateSetting = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateRestaurantSettingDto }) => updateRestaurantSetting(id, dto),
    onSuccess: invalidate,
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });
  const remove = useMutation({
    mutationFn: (id: string) => deleteRestaurant(id),
    onSuccess: invalidate,
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });
  return { create, update, updateSetting, remove };
}
