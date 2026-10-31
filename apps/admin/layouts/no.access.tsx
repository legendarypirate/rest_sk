'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

import { Button } from '@packages/ui/components/button';

import { useLogout } from '@/hooks/use.logout';
import { ADMIN_PATHS } from '@/layouts/routes';
import { Icons } from '@/utils/icons';

const COUNTDOWN_SECONDS = 10;
const NoAccessIcon = Icons.security;

type NoAccessProps = {
  description?: string;
};

export function NoAccess({
  description = 'Танд энэ хуудас эсвэл цэс рүү хандах эрх байхгүй байна.',
}: NoAccessProps) {
  const router = useRouter();
  const logout = useLogout();
  const [seconds, setSeconds] = useState(COUNTDOWN_SECONDS);
  const leftRef = useRef(false);

  const goHome = useCallback(() => {
    if (leftRef.current) {
      return;
    }
    leftRef.current = true;
    router.replace(ADMIN_PATHS.analyze);
  }, [router]);

  const signOut = useCallback(() => {
    if (leftRef.current) {
      return;
    }
    leftRef.current = true;
    logout.mutate();
  }, [logout]);

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (seconds === 0) {
      goHome();
    }
  }, [goHome, seconds]);

  return (
    <div className="flex min-h-0 w-full flex-1 items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border bg-card p-8 text-center shadow-sm">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <NoAccessIcon className="size-7" />
        </div>

        <h1 className="mt-4 text-xl font-bold text-foreground">Хандах эрхгүй</h1>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        <p className="mt-4 text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{seconds}</span>{' '}
          секундын дараа хяналтын самбар руу буцна.
        </p>

        <div className="mt-6 flex flex-col gap-2">
          <Button type="button" className="w-full" onClick={goHome}>
            Хяналтын самбар руу буцах
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            disabled={logout.isPending}
            onClick={signOut}
          >
            Гарах
          </Button>
        </div>
      </div>
    </div>
  );
}
