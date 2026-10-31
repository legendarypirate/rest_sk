'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

import { disconnectRealtimeSocket } from '@/lib/realtime/realtime';
import { ADMIN_LOGIN_PATH } from '@/lib/routes';
import { endSession } from '@/services/iam/auth.service';

export const logoutMutationKey = ['auth', 'logout'] as const;

export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: logoutMutationKey,
    mutationFn: endSession,
    onSettled: async () => {
      disconnectRealtimeSocket();
      queryClient.clear();
      router.replace(ADMIN_LOGIN_PATH);
    },
  });
}
