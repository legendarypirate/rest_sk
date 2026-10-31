'use client';

import * as React from 'react';
import { Check, ChevronsUpDown, Pipette, X } from 'lucide-react';

import { Button } from '@packages/ui/components/button';
import { Label } from '@packages/ui/components/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@packages/ui/components/popover';
import { cn } from '@packages/ui/lib/utils';

export interface ColorSwatch {
  value: string;
  label: string;
}

/// Tailwind 500-weight hues: they hold contrast against both the light and dark
/// surfaces this app ships, which a freely typed hex does not.
export const DEFAULT_COLOR_SWATCHES: ColorSwatch[] = [
  { value: '#ef4444', label: 'Улаан' },
  { value: '#f97316', label: 'Хүрэн шар' },
  { value: '#f59e0b', label: 'Хув' },
  { value: '#eab308', label: 'Шар' },
  { value: '#84cc16', label: 'Цайвар ногоон' },
  { value: '#22c55e', label: 'Ногоон' },
  { value: '#10b981', label: 'Маргад' },
  { value: '#14b8a6', label: 'Хөх ногоон' },
  { value: '#06b6d4', label: 'Циан' },
  { value: '#0ea5e9', label: 'Тэнгэрийн цэнхэр' },
  { value: '#3b82f6', label: 'Цэнхэр' },
  { value: '#6366f1', label: 'Индиго' },
  { value: '#8b5cf6', label: 'Виолет' },
  { value: '#a855f7', label: 'Нил' },
  { value: '#d946ef', label: 'Фукси' },
  { value: '#ec4899', label: 'Ягаан' },
  { value: '#f43f5e', label: 'Роз' },
  { value: '#78716c', label: 'Бор' },
  { value: '#64748b', label: 'Хөх саарал' },
  { value: '#6b7280', label: 'Саарал' },
];

export interface MColorPickerProps {
  value?: string;
  onValueChange?: (value: string) => void;
  swatches?: ColorSwatch[];
  placeholder?: string;
  clearLabel?: string;
  customLabel?: string;
  disabled?: boolean;
  id?: string;
  className?: string;
  /** Hide the native picker that covers hues outside the palette. */
  allowCustom?: boolean;
  'aria-invalid'?: boolean;
}

const triggerClass = cn(
  'h-10 border border-black/15 bg-white',
  'hover:border-ring/50',
  'focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30',
  'data-popup-open:border-ring data-popup-open:ring-3 data-popup-open:ring-ring/30',
  'aria-invalid:border-destructive aria-invalid:ring-destructive/20',
  'dark:border-white/20 dark:bg-black/25 dark:hover:border-ring/50',
);

function normalize(value?: string) {
  return value?.trim().toLowerCase() ?? '';
}

export function MColorPicker({
  value,
  onValueChange,
  swatches = DEFAULT_COLOR_SWATCHES,
  placeholder = 'Өнгө сонгох',
  clearLabel = 'Өнгө хасах',
  customLabel = 'Бусад өнгө',
  disabled = false,
  id,
  className,
  allowCustom = true,
  'aria-invalid': ariaInvalid,
}: MColorPickerProps) {
  const [open, setOpen] = React.useState(false);
  const selected = normalize(value);
  const match = swatches.find((swatch) => normalize(swatch.value) === selected);

  function select(next: string) {
    onValueChange?.(next);
    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            id={id}
            type="button"
            variant="outline"
            aria-expanded={open}
            className={cn(
              'h-10 px-2.5 py-1 font-normal w-full cursor-pointer justify-between text-foreground',
              !selected && 'text-muted-foreground',
              triggerClass,
              className,
            )}
            disabled={disabled}
            aria-invalid={ariaInvalid}
          />
        }
      >
        <span className="gap-2 flex min-w-0 flex-1 items-center">
          {selected ? (
            <span
              aria-hidden
              className="size-5 shrink-0 rounded-md border"
              style={{ backgroundColor: selected }}
            />
          ) : null}
          <span className="truncate">
            {match ? match.label : selected || placeholder}
          </span>
          {match ? (
            <span className="font-mono text-xs text-muted-foreground">
              {match.value}
            </span>
          ) : null}
        </span>
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3" align="start">
        <div className="gap-2 grid grid-cols-5">
          {swatches.map((swatch) => {
            const isActive = normalize(swatch.value) === selected;

            return (
              <button
                key={swatch.value}
                type="button"
                title={`${swatch.label} · ${swatch.value}`}
                aria-label={swatch.label}
                aria-pressed={isActive}
                onClick={() => select(swatch.value)}
                className={cn(
                  'size-9 flex cursor-pointer items-center justify-center rounded-md border transition',
                  'hover:scale-105 focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none',
                  isActive && 'ring-2 ring-ring ring-offset-1',
                )}
                style={{ backgroundColor: swatch.value }}
              >
                {isActive ? (
                  <Check className="size-4 text-white drop-shadow" />
                ) : null}
              </button>
            );
          })}
        </div>

        {allowCustom ? (
          <div className="mt-3 gap-2 flex items-center border-t pt-3">
            <Pipette className="size-4 shrink-0 text-muted-foreground" />
            <Label
              htmlFor={`${id ?? 'color'}-custom`}
              className="text-xs cursor-pointer text-muted-foreground"
            >
              {customLabel}
            </Label>
            <input
              id={`${id ?? 'color'}-custom`}
              type="color"
              value={selected || '#3b82f6'}
              onChange={(event) => onValueChange?.(event.target.value)}
              className="ml-auto size-8 cursor-pointer rounded-md border bg-transparent p-0.5"
            />
          </div>
        ) : null}

        {selected ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => select('')}
            className="mt-2 gap-2 w-full cursor-pointer justify-start text-muted-foreground"
          >
            <X className="size-4" />
            {clearLabel}
          </Button>
        ) : null}
      </PopoverContent>
    </Popover>
  );
}
