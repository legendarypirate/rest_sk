'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { buttonVariants } from '@packages/ui/components/button';
import { cn } from '@packages/ui/lib/utils';

type KioskLinkProps = {
  href: string;
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'outline' | 'link' | 'secondary';
  onClick?: () => void;
};

export function KioskLink({
  href,
  children,
  className,
  variant = 'default',
  onClick,
}: KioskLinkProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(buttonVariants({ variant }), className)}
    >
      {children}
    </Link>
  );
}

export function KioskBackLink({
  href,
  children,
}: {
  href: string;
  children: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        buttonVariants({ variant: 'outline' }),
        'h-14 gap-2 px-5 text-lg text-slate-600',
      )}
    >
      <ArrowLeft className="size-5" />
      {children}
    </Link>
  );
}
