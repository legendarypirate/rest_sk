'use client';

import type { ComponentType, ReactNode } from 'react';

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@packages/ui/components/card';
import { cn } from '@packages/ui/lib/utils';

/** Neon-styled card surface — for table/section containers. */
export const mCardClass = cn(
  'rounded-xl border border-border bg-card text-card-foreground',
  'transition-shadow',
);

/** Alias used by tables/filters — slightly tighter radius. */
export const cardClass = 'rounded-md border border-border bg-card text-card-foreground';

export {
  Card as MCard,
  CardAction as MCardAction,
  CardContent as MCardContent,
  CardDescription as MCardDescription,
  CardFooter as MCardFooter,
  CardHeader as MCardHeader,
  CardTitle as MCardTitle,
};

export type MStatCardProps = {
  title: string;
  value: number | string;
  icon?: ComponentType<{ className?: string }>;
  isLoading?: boolean;
  description?: string;
  locale?: string;
  className?: string;
};

/** KPI / metric card — title + icon header, large numeric value. */
export function MStatCard({
  title,
  value,
  icon: Icon,
  isLoading = false,
  description,
  locale = 'mn-MN',
  className,
}: MStatCardProps) {
  const displayValue =
    typeof value === 'number' && !isLoading ? value.toLocaleString(locale) : value;

  return (
    <Card size="sm" className={cn('gap-2', className)}>
      <CardHeader className="pb-0">
        <CardTitle className="text-xs font-medium text-muted-foreground">{title}</CardTitle>
        {Icon ? (
          <CardAction>
            <Icon className="size-4 shrink-0 text-secondary" />
          </CardAction>
        ) : null}
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold tabular-nums text-foreground">
          {isLoading ? '—' : displayValue}
        </p>
        {description ? <p className="text-xs text-muted-foreground">{description}</p> : null}
      </CardContent>
    </Card>
  );
}

type MStatCardGridProps = {
  children: ReactNode;
  columns?: 2 | 3 | 4;
  className?: string;
};

/** Responsive grid for MStatCard rows. */
export function MStatCardGrid({ children, columns = 3, className }: MStatCardGridProps) {
  const colClass =
    columns === 2
      ? 'sm:grid-cols-2'
      : columns === 4
        ? 'sm:grid-cols-2 lg:grid-cols-4'
        : 'sm:grid-cols-3';

  return <div className={cn('grid gap-3', colClass, className)}>{children}</div>;
}

type MStatSectionProps = {
  label?: ReactNode;
  children: ReactNode;
  className?: string;
};

/** Optional caption + stat card grid (dashboard sections). */
export function MStatSection({ label, children, className }: MStatSectionProps) {
  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {label ? <div className="text-sm text-muted-foreground">{label}</div> : null}
      {children}
    </div>
  );
}
