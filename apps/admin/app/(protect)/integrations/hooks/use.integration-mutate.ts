'use client';

import { toast } from '@packages/ui/components/sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { getApiErrorMessage } from '@/lib/api-error';
import type { UpsertIntegrationDto } from '@/types/integrations/integration.dto';
import {
  createIntegration,
  deleteIntegration,
  syncIntegrationEmployees,
  updateIntegration,
} from '@/services/integrations/integrations.service';

import { integrationsQueryKey } from './use.integrations';

export function useIntegrationMutate() {
  const queryClient = useQueryClient();

  function invalidate() {
    void queryClient.invalidateQueries({ queryKey: integrationsQueryKey });
    void queryClient.invalidateQueries({ queryKey: ['employees'] });
  }

  const create = useMutation({
    mutationFn: (dto: UpsertIntegrationDto) => createIntegration(dto),
    onSuccess: invalidate,
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const update = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpsertIntegrationDto }) =>
      updateIntegration(id, dto),
    onSuccess: invalidate,
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteIntegration(id),
    onSuccess: invalidate,
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const sync = useMutation({
    mutationFn: (id: string) => syncIntegrationEmployees(id),
    onSuccess: invalidate,
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  return { create, update, remove, sync };
}
