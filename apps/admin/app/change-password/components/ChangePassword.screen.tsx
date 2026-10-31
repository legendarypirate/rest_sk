'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { ADMIN_APP_HOME, ADMIN_LOGIN_PATH } from '@/lib/routes';
import { readSession, sessionQueryKey } from '@/providers';

import { ChangePasswordForm } from './ChangePassword.form';

export function ChangePasswordScreen() {
  const router = useRouter();
  const session = useQuery({
    queryKey: sessionQueryKey,
    queryFn: readSession,
    retry: false,
  });

  useEffect(() => {
    if (session.isFetching) {
      return;
    }

    if (session.isError) {
      router.replace(ADMIN_LOGIN_PATH);
      return;
    }

    if (session.data && !session.data.mustChangePassword) {
      router.replace(ADMIN_APP_HOME);
    }
  }, [router, session.data, session.isError, session.isFetching]);

  if (session.isPending || session.isFetching || session.isError || !session.data?.mustChangePassword) {
    return null;
  }

  return <ChangePasswordForm email={session.data.email} />;
}
