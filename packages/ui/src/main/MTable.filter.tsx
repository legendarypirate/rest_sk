'use client';

import * as React from 'react';
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ChevronsUpDownIcon,
  FilterIcon,
  FilterXIcon,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

import { MCheckbox, MInput } from './MFields';
import { MTableHead } from './MTable';
import type { SortDirection } from './MTable.helper';

export interface ColumnFilterOption {
  value: string;
  label: string;
}

type FilterHeadCommonProps<TField extends string> = {
  label: string;
  className?: string;
  /** Sort field — omit (or omit `onSort`) to render a filter-only header. */
  field?: TField;
  sortBy?: TField;
  sortOrder?: SortDirection;
  onSort?: (field: TField) => void;
};

type TextFilterProps = {
  type: 'text';
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

type OptionsFilterProps = {
  type: 'options';
  value: string[];
  onChange: (value: string[]) => void;
  options: ColumnFilterOption[];
  searchPlaceholder?: string;
  emptyText?: string;
};

export type FilterHeadProps<TField extends string> = FilterHeadCommonProps<TField> &
  (TextFilterProps | OptionsFilterProps);

/**
 * Excel-style table header: label (optionally sortable) plus a funnel popover
 * holding either a "contains" text box or a multi-select value list.
 */
export function FilterHead<TField extends string>(props: FilterHeadProps<TField>) {
  const { label, className, field, sortBy, sortOrder, onSort } = props;
  const [open, setOpen] = React.useState(false);

  const isActive = props.type === 'text' ? props.value.trim() !== '' : props.value.length > 0;
  const sortable = Boolean(onSort && field);
  const sortActive = sortable && sortBy === field;
  const SortIcon = !sortActive
    ? ChevronsUpDownIcon
    : sortOrder === 'asc'
      ? ArrowUpIcon
      : ArrowDownIcon;

  return (
    <MTableHead className={className}>
      <div className="flex items-center gap-1">
        {sortable ? (
          <button
            type="button"
            onClick={() => onSort?.(field as TField)}
            className="inline-flex cursor-pointer items-center gap-1 uppercase tracking-wider transition-colors hover:text-foreground"
          >
            {label}
            <SortIcon className={cn('size-3', sortActive ? '' : 'opacity-50')} />
          </button>
        ) : (
          <span>{label}</span>
        )}

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger
            render={
              <button
                type="button"
                aria-label={`${label} шүүх`}
                className={cn(
                  'inline-flex cursor-pointer items-center rounded p-0.5 transition-colors',
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground/60 hover:text-foreground opacity-60',
                )}
              />
            }
          >
            <FilterIcon className={cn('size-3', isActive && 'fill-current')} />
          </PopoverTrigger>
          <PopoverContent align="start" className="w-60 gap-2 p-2">
            {props.type === 'text' ? (
              <TextFilterBody
                value={props.value}
                placeholder={props.placeholder}
                onApply={(next) => {
                  props.onChange(next);
                  setOpen(false);
                }}
              />
            ) : (
              <OptionsFilterBody
                value={props.value}
                options={props.options}
                onChange={props.onChange}
                searchPlaceholder={props.searchPlaceholder}
                emptyText={props.emptyText}
              />
            )}
          </PopoverContent>
        </Popover>
      </div>
    </MTableHead>
  );
}

function TextFilterBody({
  value,
  placeholder,
  onApply,
}: {
  value: string;
  placeholder?: string;
  onApply: (value: string) => void;
}) {
  const [draft, setDraft] = React.useState(value);

  return (
    <div className="flex flex-col gap-2 font-normal normal-case tracking-normal">
      <MInput
        autoFocus
        value={draft}
        placeholder={placeholder ?? 'Агуулсан…'}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') onApply(draft);
        }}
      />
      <div className="flex items-center justify-between gap-2">
        <Button
          size="sm"
          className="h-7 flex-1 bg-primary text-primary-foreground hover:bg-primary/80"
          onClick={() => onApply(draft)}
        >
          Шүүх
        </Button>
        <Button
          size="sm"
          variant="secondary"
          className="h-7 text-muted-foreground"
          disabled={draft === '' && value === ''}
          onClick={() => {
            setDraft('');
            onApply('');
          }}
        >
          <FilterXIcon className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}

function OptionsFilterBody({
  value,
  options,
  onChange,
  searchPlaceholder,
  emptyText,
}: {
  value: string[];
  options: ColumnFilterOption[];
  onChange: (value: string[]) => void;
  searchPlaceholder?: string;
  emptyText?: string;
}) {
  const allSelected = options.length > 0 && options.every((option) => value.includes(option.value));

  return (
    <div className="flex flex-col gap-1 font-normal normal-case tracking-normal">
      <Command className="p-0">
        <CommandInput placeholder={searchPlaceholder ?? 'Хайх...'} className="h-8" />
        <CommandList className="max-h-56">
          <CommandEmpty>{emptyText ?? 'Олдсонгүй'}</CommandEmpty>
          <CommandGroup className="p-0">
            <CommandItem
              value="__select_all__"
              keywords={['бүгд', 'all']}
              onSelect={() => onChange(allSelected ? [] : options.map((option) => option.value))}
              className="gap-2"
            >
              <MCheckbox checked={allSelected} className="pointer-events-none" />
              <span className="min-w-0 flex-1 truncate font-medium">(Бүгд)</span>
            </CommandItem>
            {options.map((option) => {
              const checked = value.includes(option.value);
              return (
                <CommandItem
                  key={option.value}
                  value={`${option.label} ${option.value}`}
                  keywords={[option.label]}
                  onSelect={() =>
                    onChange(
                      checked
                        ? value.filter((id) => id !== option.value)
                        : [...value, option.value],
                    )
                  }
                  className="gap-2"
                >
                  <MCheckbox checked={checked} className="pointer-events-none" />
                  <span className="min-w-0 flex-1 truncate">{option.label}</span>
                </CommandItem>
              );
            })}
          </CommandGroup>
        </CommandList>
      </Command>
      {value.length > 0 ? (
        <Button
          size="sm"
          variant="secondary"
          className="h-7 justify-start gap-2 text-muted-foreground"
          onClick={() => onChange([])}
        >
          <FilterXIcon className="size-3.5" />
          Шүүлтүүр цэвэрлэх
        </Button>
      ) : null}
    </div>
  );
}
