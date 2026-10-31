'use client';

import { toast } from '@packages/ui/components/sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { getApiErrorMessage } from '@/lib/api-error';
import {
  deleteMenuItemImage,
  mapMenuItemImages,
  updateMenuItemImage,
} from '@/services/menus/menus.service';
import type { MapMenuItemImagesDto, UpsertMenuItemImageDto } from '@/types/menus/menu.dto';

import { menuItemImagesQueryKey } from './use.menu-item-images';

export function useMenuItemImageMutate() {
  const queryClient = useQueryClient();
  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: menuItemImagesQueryKey });
  };
  const create = useMutation({
    mutationFn: (dto: MapMenuItemImagesDto) => mapMenuItemImages(dto),
    onSuccess: invalidate,
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });
  const update = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpsertMenuItemImageDto }) => updateMenuItemImage(id, dto),
    onSuccess: invalidate,
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });
  const remove = useMutation({
    mutationFn: (id: string) => deleteMenuItemImage(id),
    onSuccess: invalidate,
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });
  return { create, update, remove };
}
