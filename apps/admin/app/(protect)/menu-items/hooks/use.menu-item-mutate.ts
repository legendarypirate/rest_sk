'use client';

import { toast } from '@packages/ui/components/sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { getApiErrorMessage } from '@/lib/api-error';
import { createMenuItem, deleteMenuItem, updateMenuItem } from '@/services/menus/menus.service';
import type { UpsertMenuItemDto } from '@/types/menus/menu.dto';

import { menuItemsQueryKey } from './use.menu-items';

export function useMenuItemMutate() {
  const queryClient = useQueryClient();
  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: menuItemsQueryKey });
  };
  const create = useMutation({
    mutationFn: (dto: UpsertMenuItemDto) => createMenuItem(dto),
    onSuccess: invalidate,
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });
  const update = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpsertMenuItemDto }) => updateMenuItem(id, dto),
    onSuccess: invalidate,
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });
  const remove = useMutation({
    mutationFn: (id: string) => deleteMenuItem(id),
    onSuccess: invalidate,
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });
  return { create, update, remove };
}
