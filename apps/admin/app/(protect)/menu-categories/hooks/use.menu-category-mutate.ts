'use client';

import { toast } from '@packages/ui/components/sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { getApiErrorMessage } from '@/lib/api-error';
import {
  createMenuCategory,
  deleteMenuCategory,
  updateMenuCategory,
} from '@/services/menus/menus.service';
import type { UpsertMenuCategoryDto } from '@/types/menus/menu.dto';

import { menuCategoriesQueryKey } from './use.menu-categories';

export function useMenuCategoryMutate() {
  const queryClient = useQueryClient();
  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: menuCategoriesQueryKey });
  };
  const create = useMutation({
    mutationFn: (dto: UpsertMenuCategoryDto) => createMenuCategory(dto),
    onSuccess: invalidate,
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });
  const update = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpsertMenuCategoryDto }) =>
      updateMenuCategory(id, dto),
    onSuccess: invalidate,
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });
  const remove = useMutation({
    mutationFn: (id: string) => deleteMenuCategory(id),
    onSuccess: invalidate,
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });
  return { create, update, remove };
}
