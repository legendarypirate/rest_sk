'use client';

import { ChevronDownIcon } from 'lucide-react';

import { Button } from '@packages/ui/components/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@packages/ui/components/dropdown-menu';
import { cn } from '@packages/ui/lib/utils';

export type StatusOption<T extends string> = {
  value: T;
  label: string;
};

type StatusCellProps<T extends string> = {
  value: T;
  labels: Record<T, string>;
  classMap: Record<T, string>;
  options: StatusOption<T>[];
  disabled?: boolean;
  pending?: boolean;
  onChange?: (next: T) => void;
};

export function StatusCell<T extends string>({
  value,
  labels,
  classMap,
  options,
  disabled = false,
  pending = false,
  onChange,
}: StatusCellProps<T>) {
  const label = labels[value];
  const badgeClass = classMap[value];
  const choices = options.filter((option) => option.value !== value);
  const interactive = Boolean(onChange) && !disabled && choices.length > 0;

  const badge = (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
        badgeClass,
        interactive && 'cursor-pointer hover:opacity-80',
        pending && 'opacity-60',
      )}
    >
      {label}
      {interactive ? <ChevronDownIcon className="size-3" /> : null}
    </span>
  );

  if (!interactive) {
    return badge;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        disabled={pending}
        render={
          <Button
            type="button"
            variant="ghost"
            size="xs"
            className="h-auto rounded-full p-0 hover:bg-transparent"
            onClick={(event) => event.stopPropagation()}
          />
        }
      >
        {badge}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-40">
        {choices.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={(event) => {
              event.stopPropagation();
              onChange?.(option.value);
            }}
          >
            <span
              className={cn(
                'inline-flex rounded-full px-2 py-0.5 text-xs font-medium',
                classMap[option.value],
              )}
            >
              {option.label}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
