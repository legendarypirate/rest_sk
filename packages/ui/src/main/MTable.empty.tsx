'use client';

import type { LucideIcon } from 'lucide-react';
import { InboxIcon } from 'lucide-react';

import { cn } from '@packages/ui/lib/utils';

type MTableEmptyProps = {
  icon?: LucideIcon;
  text: string;
  className?: string;
};

export function MTableEmpty({
  icon: Icon = InboxIcon,
  text,
  className,
}: MTableEmptyProps) {
  return (
    <div
      className={cn(
        'flex min-h-48 flex-col items-center justify-center gap-3 text-muted-foreground',
        className,
      )}
    >
      <Icon className="size-10 stroke-[1.25]" aria-hidden />
      <p className="text-sm">{text}</p>
    </div>
  );
}
