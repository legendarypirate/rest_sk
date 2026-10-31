'use client';

import { toast } from '@packages/ui/components/sonner';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import {
  ADMIN_LOGIN_PATH,
  ADMIN_PASSWORD_CHANGED_MESSAGE,
} from '@/lib/routes';

export function PasswordChangedNotice({ show }: { show: boolean }) {
  const router = useRouter();

  useEffect(() => {
    if (!show) {
      return;
    }

    toast.success(ADMIN_PASSWORD_CHANGED_MESSAGE, {
      id: 'password-changed',
    });
    router.replace(ADMIN_LOGIN_PATH);
  }, [router, show]);

  return null;
}
