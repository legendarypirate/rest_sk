'use client';

import * as React from 'react';
import { Check, ChevronsUpDown, type LucideIcon } from 'lucide-react';

import { Button } from '@packages/ui/components/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@packages/ui/components/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@packages/ui/components/popover';
import { Checkbox } from '@packages/ui/components/checkbox';
import { cn } from '@packages/ui/lib/utils';

export interface DataListItem {
  value: string;
  label: string;
  /** Indent level for tree rows (0 = root). */
  depth?: number;
  /** When false, row is a non-selectable parent/group label. Default true. */
  selectable?: boolean;
  /** Optional thumbnail shown in the dropdown (e.g. media library). */
  image?: string;
  /** Optional Lucide icon shown in the trigger and dropdown. */
  icon?: LucideIcon;
  /** Extra search text (code, latex, …). */
  description?: string;
  /** Rendered under the label (formula preview, etc.). */
  detail?: React.ReactNode;
}

interface MDatalistBaseProps {
  /** Accepts either a plain value→label map or an array of options. */
  options: Record<string, string> | DataListItem[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  className?: string;
  disabled?: boolean;
  id?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  /** When false, options are not filtered client-side (use with server search). Default true. */
  shouldFilter?: boolean;
  /** Allow typing a value that is not in `options` and adding it. */
  allowCreate?: boolean;
  /**
   * `slug` keeps IAM-style lowercase codes.
   * `literal` keeps the typed text (Greek, m/s, N).
   */
  createMode?: 'slug' | 'literal';
  'aria-invalid'?: boolean;
}

const selectClass = cn(
  'h-8 border border-black/15 bg-white',
  'hover:border-ring/50',
  'focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30',
  'data-popup-open:border-ring data-popup-open:ring-3 data-popup-open:ring-ring/30',
  'aria-invalid:border-destructive aria-invalid:ring-destructive/20',
  'dark:border-white/20 dark:bg-black/25 dark:hover:border-ring/50',
);

interface MDatalistSingleProps extends MDatalistBaseProps {
  multiple?: false;
  value?: string;
  onValueChange?: (value: string) => void;
}

interface MDatalistMultiProps extends MDatalistBaseProps {
  multiple: true;
  value?: string[];
  onValueChange?: (value: string[]) => void;
}

export type MDatalistProps = MDatalistSingleProps | MDatalistMultiProps;

function toOptionsArray(
  options: MDatalistBaseProps['options'],
): DataListItem[] {
  return Array.isArray(options)
    ? options
    : Object.entries(options).map(([optionValue, label]) => ({
        value: optionValue,
        label,
      }));
}

function toggleValue(selected: string[], next: string): string[] {
  return selected.includes(next)
    ? selected.filter((id) => id !== next)
    : [...selected, next];
}

export function MDatalist(props: MDatalistProps) {
  const {
    options,
    placeholder = 'Сонгоно уу...',
    searchPlaceholder = 'Хайх...',
    emptyText = 'Олдсонгүй',
    className,
    disabled = false,
    id,
    searchValue,
    onSearchChange,
    shouldFilter = true,
    allowCreate = false,
    createMode = 'slug',
    'aria-invalid': ariaInvalid,
  } = props;

  const multiple = props.multiple === true;
  const [open, setOpen] = React.useState(false);
  const [internalSearch, setInternalSearch] = React.useState('');
  const query = searchValue ?? internalSearch;

  const selectedValues = React.useMemo(() => {
    if (multiple) {
      return Array.isArray(props.value) ? props.value : [];
    }
    return props.value ? [props.value] : [];
  }, [multiple, props.value]);

  const optionsArray = React.useMemo(() => {
    const list = toOptionsArray(options);
    const known = new Set(list.map((option) => option.value));
    const extras: DataListItem[] = selectedValues
      .filter((value) => value && !known.has(value))
      .map((value) => ({ value, label: value }));
    return extras.length > 0 ? [...list, ...extras] : list;
  }, [options, selectedValues]);

  const selectedOptions = React.useMemo(
    () =>
      optionsArray.filter(
        (option) =>
          option.selectable !== false && selectedValues.includes(option.value),
      ),
    [optionsArray, selectedValues],
  );

  const triggerLabel = (() => {
    if (selectedOptions.length === 0) return placeholder;
    if (!multiple) return selectedOptions[0]?.label.trim() ?? placeholder;
    if (selectedOptions.length === 1) return selectedOptions[0].label.trim();
    return `${selectedOptions.length} сонгосон`;
  })();

  const TriggerIcon =
    !multiple && selectedOptions[0]?.icon ? selectedOptions[0].icon : null;

  const handleSelect = (optionValue: string) => {
    if (multiple) {
      props.onValueChange?.(toggleValue(selectedValues, optionValue));
      return;
    }
    props.onValueChange?.(optionValue);
    setOpen(false);
  };

  const createdValue = React.useMemo(() => {
    if (!allowCreate) {
      return '';
    }

    const raw = query.trim();
    if (!raw) {
      return '';
    }

    const candidate =
      createMode === 'literal'
        ? raw.slice(0, 32)
        : raw.toLowerCase().replace(/\s+/g, '_');

    if (createMode !== 'literal' && !/^[a-z][a-z0-9_]{1,31}$/.test(candidate)) {
      return '';
    }

    const exists = optionsArray.some(
      (option) =>
        option.selectable !== false &&
        (option.value === candidate ||
          option.label.trim().toLowerCase() === raw.toLowerCase()),
    );

    if (exists || selectedValues.includes(candidate)) {
      return '';
    }

    return candidate;
  }, [allowCreate, createMode, optionsArray, query, selectedValues]);

  const handleSearchChange = (next: string) => {
    if (searchValue === undefined) {
      setInternalSearch(next);
    }
    onSearchChange?.(next);
  };

  const handleCreate = () => {
    if (!createdValue) {
      return;
    }
    handleSelect(createdValue);
    handleSearchChange('');
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            id={id}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              'h-8 px-2.5 py-1 font-normal w-full cursor-pointer justify-between text-foreground',
              selectedOptions.length === 0 && 'text-muted-foreground',
              selectClass,
              !multiple &&
                selectedOptions[0]?.detail &&
                '!h-auto min-h-8 !items-start !whitespace-normal py-2 overflow-visible',
              className,
            )}
            disabled={disabled}
            aria-invalid={ariaInvalid}
          />
        }
      >
        <span className="flex min-w-0 flex-1 items-center gap-2">
          {TriggerIcon ? (
            <TriggerIcon className="size-4 shrink-0" aria-hidden />
          ) : null}
          {!multiple && selectedOptions[0]?.image ? (
            <img
              src={selectedOptions[0].image}
              alt=""
              className="size-6 shrink-0 rounded-md object-cover"
            />
          ) : null}
          {!multiple && selectedOptions[0]?.detail ? (
            <span className="flex min-w-0 flex-1 flex-col items-stretch gap-1 overflow-visible text-left whitespace-normal">
              <span className="block w-full overflow-x-auto overflow-y-visible text-foreground [&_.katex]:text-base [&_.katex-display]:my-1 [&_.katex-display]:overflow-x-auto">
                {selectedOptions[0].detail}
              </span>
              <span className="truncate text-xs text-muted-foreground">
                {selectedOptions[0].label}
              </span>
            </span>
          ) : (
            <span className="truncate">{triggerLabel}</span>
          )}
        </span>
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </PopoverTrigger>
      <PopoverContent className="p-0 w-(--anchor-width)" align="start">
        <Command
          shouldFilter={shouldFilter}
          className="font-normal w-full text-foreground"
        >
          <CommandInput
            placeholder={searchPlaceholder}
            className="h-9"
            value={query}
            onValueChange={handleSearchChange}
          />
          <CommandList>
            <CommandEmpty>
              {createdValue ? (
                <button
                  type="button"
                  className="w-full px-2 py-1.5 text-left text-sm"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={handleCreate}
                >
                  «{createdValue}» нэмэх
                </button>
              ) : (
                emptyText
              )}
            </CommandEmpty>
            <CommandGroup className="font-normal w-full text-foreground">
              {createdValue ? (
                <CommandItem
                  value={`create ${createdValue}`}
                  keywords={[createdValue, 'нэмэх']}
                  onSelect={handleCreate}
                >
                  «{createdValue}» нэмэх
                </CommandItem>
              ) : null}
              {optionsArray.map((option) => {
                const depth = option.depth ?? 0;
                const selectable = option.selectable !== false;
                const checked = selectedValues.includes(option.value);
                const OptionIcon = option.icon;

                if (!selectable) {
                  return (
                    <div
                      key={`group-${option.value || option.label}-${depth}`}
                      className="px-2 py-1.5 text-xs font-semibold text-muted-foreground"
                      style={{ paddingLeft: `${8 + depth * 12}px` }}
                    >
                      {option.label}
                    </div>
                  );
                }

                return (
                  <CommandItem
                    key={option.value || `opt-${option.label}-${depth}`}
                    value={`${option.label} ${option.value} ${option.description ?? ''}`}
                    keywords={[
                      option.label,
                      option.value,
                      option.description ?? '',
                    ]}
                    onSelect={() => handleSelect(option.value)}
                    style={{ paddingLeft: `${8 + depth * 12}px` }}
                    className={cn(
                      'items-start gap-2 overflow-visible',
                      (option.image || option.detail) && 'py-2',
                    )}
                  >
                    {multiple ? (
                      <Checkbox
                        checked={checked}
                        className="size-4 pointer-events-none"
                      />
                    ) : null}
                    {OptionIcon ? (
                      <OptionIcon className="size-4 shrink-0" aria-hidden />
                    ) : null}
                    {option.image ? (
                      <img
                        src={option.image}
                        alt=""
                        className="size-8 shrink-0 rounded-md object-cover"
                      />
                    ) : null}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate">{option.label}</span>
                      {option.detail ? (
                        <span className="mt-1 block overflow-x-auto overflow-y-visible text-foreground [&_.katex]:text-base [&_.katex-display]:my-1">
                          {option.detail}
                        </span>
                      ) : option.description ? (
                        <span className="block truncate text-xs text-muted-foreground">
                          {option.description}
                        </span>
                      ) : null}
                    </span>
                    {!multiple && (
                      <Check
                        className={cn(
                          'h-4 w-4 ml-auto shrink-0',
                          checked ? 'opacity-100' : 'opacity-0',
                        )}
                      />
                    )}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
