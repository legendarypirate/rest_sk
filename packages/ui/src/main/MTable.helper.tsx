'use client';

import { ArrowDownIcon, ArrowUpIcon, ChevronsUpDownIcon } from 'lucide-react';

import { cn } from '@packages/ui/lib/utils';

import { MTableHead } from './MTable';

export type SortDirection = 'asc' | 'desc';

type SortHeadProps<TField extends string> = {
  field: TField;
  label: string;
  sortBy?: TField;
  sortOrder?: SortDirection;
  onSort?: (field: TField) => void;
  className?: string;
};

/** Sortable table header cell. Renders a plain header when `onSort` is omitted. */
export function SortHead<TField extends string>({
  field,
  label,
  sortBy,
  sortOrder,
  onSort,
  className,
}: SortHeadProps<TField>) {
  if (!onSort) {
    return <MTableHead className={className}>{label}</MTableHead>;
  }

  const active = sortBy === field;
  const Icon = !active ? ChevronsUpDownIcon : sortOrder === 'asc' ? ArrowUpIcon : ArrowDownIcon;

  return (
    <MTableHead className={className}>
      <button
        type="button"
        onClick={() => onSort(field)}
        className="inline-flex cursor-pointer items-center gap-1 uppercase tracking-wider transition-colors hover:text-foreground"
      >
        {label}
        <Icon className={cn('size-3', active ? '' : 'opacity-50')} />
      </button>
    </MTableHead>
  );
}

type StatusBadgeProps = {
  active: boolean;
  activeLabel?: string;
  inactiveLabel?: string;
};

/** Status pill for boolean state columns. */
export function StatusBadge({
  active,
  activeLabel = 'Идэвхитэй',
  inactiveLabel = 'Идэвхгүй',
}: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'rounded-full px-2 py-0.5 text-xs font-medium',
        'dark:text-primary-foreground dark:bg-primary',
        active ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground',
      )}
    >
      {active ? activeLabel : inactiveLabel}
    </span>
  );
}

/** @deprecated Import from `@/components/custom/MCard` — re-exported for compatibility. */
export { cardClass } from './MCard';
