'use client';

import { toast } from '@packages/ui/components/sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { getApiErrorMessage } from '@/lib/api-error';
import {
  createResource,
  deleteResource,
  updateResource,
} from '@/services/iam/resources.service';
import type {
  CreateResourceDto,
  UpdateResourceDto,
} from '@/types/iam/resource.dto';

import { resourceMenuQueryKey } from '@/layouts/use.resource-menu';

import { resourcesQueryKey } from './use.resources';

export function useResourceMutate() {
  const queryClient = useQueryClient();

  function invalidate() {
    void queryClient.invalidateQueries({ queryKey: resourcesQueryKey });
    void queryClient.invalidateQueries({ queryKey: resourceMenuQueryKey });
  }

  const create = useMutation({
    mutationFn: (dto: CreateResourceDto) => createResource(dto),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateResourceDto }) =>
      updateResource(id, dto),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteResource(id),
    onSuccess: invalidate,
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });

  return { create, update, remove };
}
