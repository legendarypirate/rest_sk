'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, type ReactNode } from 'react';

import { ADMIN_CHANGE_PASSWORD_PATH, ADMIN_LOGIN_PATH } from '@/lib/routes';
import {
  endSession,
  isMustChangePasswordError,
  isUnauthorized,
  me,
  refreshSession,
} from '@/services/iam/auth.service';

export const sessionQueryKey = ['auth', 'session'] as const;

export async function readSession() {
  try {
    return await me();
  } catch (error) {
    if (!isUnauthorized(error)) {
      throw error;
    }

    await refreshSession();
    return me();
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const endingSession = useRef(false);
  const session = useQuery({
    queryKey: sessionQueryKey,
    queryFn: readSession,
    retry: false,
    refetchOnWindowFocus: true,
    refetchInterval: 30_000,
  });

  useEffect(() => {
    if (session.data?.mustChangePassword) {
      router.replace(ADMIN_CHANGE_PASSWORD_PATH);
    }
  }, [router, session.data?.mustChangePassword]);

  useEffect(() => {
    if (session.isFetching || !session.isError || endingSession.current) {
      return;
    }

    if (isMustChangePasswordError(session.error)) {
      router.replace(ADMIN_CHANGE_PASSWORD_PATH);
      return;
    }

    endingSession.current = true;

    if (isUnauthorized(session.error)) {
      void endSession().finally(() => {
        router.replace(ADMIN_LOGIN_PATH);
      });
      return;
    }

    router.replace(ADMIN_LOGIN_PATH);
  }, [router, session.error, session.isError, session.isFetching]);

  if (session.isPending || session.isError || session.data?.mustChangePassword) {
    return null;
  }

  return children;
}
