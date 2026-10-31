'use client';

import { toast } from '@packages/ui/components/sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import type { UserStatus } from '@packages/types';

import { getApiErrorMessage } from '@/lib/api-error';
import { statusPatch } from '@/lib/change-status';
import {
  createUser,
  deleteUser,
  getUser,
  replaceUserRoles,
  updateUser,
} from '@/services/iam/users.service';
import type { CreateUserDto, UpdateUserDto } from '@/types/iam/user.dto';

import { usersQueryKey } from './use.users';

export function useUserMutate() {
  const queryClient = useQueryClient();

  function invalidate() {
    void queryClient.invalidateQueries({ queryKey: usersQueryKey });
  }

  const create = useMutation({
    mutationFn: (input: CreateUserDto) => createUser(input),
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({
      id,
      input,
      roleIds,
    }: {
      id: string;
      input: UpdateUserDto;
      roleIds?: string[];
    }) =>
      updateUser(id, input).then((user) =>
        roleIds ? replaceUserRoles(id, { roleIds }) : user,
      ),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteUser(id),
    onSuccess: invalidate,
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });

  const changeStatus = useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string;
      status: UserStatus;
    }) => {
      const detail = await getUser(id);
      return updateUser(id, statusPatch(status, detail.rowVersion) as UpdateUserDto);
    },
    onSuccess: invalidate,
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });

  return { create, update, remove, changeStatus };
}
