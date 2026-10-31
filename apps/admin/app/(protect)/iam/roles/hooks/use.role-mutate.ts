'use client';

import { toast } from '@packages/ui/components/sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { getApiErrorMessage } from '@/lib/api-error';
import {
  createRole,
  deleteRole,
  replaceRolePermissions,
  updateRole,
} from '@/services/iam/roles.service';
import type { CreateRoleDto, UpdateRoleDto } from '@/types/iam/role.dto';

import { rolesQueryKey } from './use.roles';

export function useRoleMutate() {
  const queryClient = useQueryClient();

  function invalidate() {
    void queryClient.invalidateQueries({ queryKey: rolesQueryKey });
  }

  const create = useMutation({
    mutationFn: (dto: CreateRoleDto) => createRole(dto),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateRoleDto }) =>
      updateRole(id, dto),
    onSuccess: invalidate,
  });

  const replacePermissions = useMutation({
    mutationFn: ({
      id,
      permissionIds,
    }: {
      id: string;
      permissionIds: string[];
    }) => replaceRolePermissions(id, { permissionIds }),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteRole(id),
    onSuccess: invalidate,
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });

  return { create, update, replacePermissions, remove };
}
