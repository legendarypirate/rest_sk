'use client';

import { toast } from '@packages/ui/components/sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { getApiErrorMessage } from '@/lib/api-error';
import {
  deleteMenuCategoryImage,
  mapMenuCategoryImages,
  updateMenuCategoryImage,
} from '@/services/menus/menus.service';
import type { MapMenuCategoryImagesDto, UpsertMenuCategoryImageDto } from '@/types/menus/menu.dto';

import { menuCategoryImagesQueryKey } from './use.menu-category-images';

export function useMenuCategoryImageMutate() {
  const queryClient = useQueryClient();
  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: menuCategoryImagesQueryKey });
  };
  const create = useMutation({
    mutationFn: (dto: MapMenuCategoryImagesDto) => mapMenuCategoryImages(dto),
    onSuccess: invalidate,
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });
  const update = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpsertMenuCategoryImageDto }) =>
      updateMenuCategoryImage(id, dto),
    onSuccess: invalidate,
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });
  const remove = useMutation({
    mutationFn: (id: string) => deleteMenuCategoryImage(id),
    onSuccess: invalidate,
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });
  return { create, update, remove };
}
