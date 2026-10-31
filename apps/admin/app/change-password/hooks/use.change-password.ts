'use client';

import { toast } from '@packages/ui/components/sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

import {
  ADMIN_LOGIN_PATH,
  ADMIN_PASSWORD_CHANGED_PARAM,
} from '@/lib/routes';
import { changePassword, endSession } from '@/services/iam/auth.service';

import { getChangePasswordErrorMessage } from '../lib/get-change-password-error';

export const changePasswordMutationKey = ['auth', 'change-password'] as const;

export function useChangePassword() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: changePasswordMutationKey,
    mutationFn: changePassword,
    onSuccess: async () => {
      await endSession();
      queryClient.clear();
      router.replace(
        `${ADMIN_LOGIN_PATH}?${ADMIN_PASSWORD_CHANGED_PARAM}=1`,
      );
    },
    onError: (error) => {
      toast.error(getChangePasswordErrorMessage(error));
    },
  });
}
