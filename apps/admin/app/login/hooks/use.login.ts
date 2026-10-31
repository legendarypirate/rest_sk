'use client';

import { toast } from '@packages/ui/components/sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

import { ADMIN_APP_HOME, ADMIN_CHANGE_PASSWORD_PATH } from '@/lib/routes';
import { sessionQueryKey } from '@/providers';
import { login } from '@/services/iam/auth.service';

import { getLoginErrorMessage } from '../lib/get-login-error';

export const loginMutationKey = ['auth', 'login'] as const;

export function useLogin() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: loginMutationKey,
    mutationFn: login,
    onSuccess: (result) => {
      if (result.mfaRequired) {
        toast('Нэмэлт баталгаажуулалт шаардлагатай.');
        return;
      }

      queryClient.removeQueries({ queryKey: sessionQueryKey });

      if (result.user.mustChangePassword) {
        router.replace(ADMIN_CHANGE_PASSWORD_PATH);
        return;
      }

      toast('Амжилттай нэвтэрлээ.');
      router.replace(ADMIN_APP_HOME);
    },
    onError: (error) => {
      toast.error(getLoginErrorMessage(error));
    },
  });
}
