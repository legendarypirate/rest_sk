'use client';

import * as React from 'react';
import { ListFilter, Search, X } from 'lucide-react';

import { Button } from '@packages/ui/components/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@packages/ui/components/collapsible';
import { Label } from '@packages/ui/components/label';
import { cn } from '@packages/ui/lib/utils';
import type { MaskType } from '../utils/mask';
import { DateRangePicker } from './MDaterange';
import { DatePicker } from './MDatepicker';
import { MDatalist } from './MData.list';
import { MaskedInput, MCheckbox, MInput, MSwitch } from './MFields';

export interface FilterOption {
  label: string;
  value: string;
}

export interface DateRangeValue {
  from?: Date;
  to?: Date;
}

type FilterFieldBase = {
  key: string;
  label: string;
  placeholder?: string;
  className?: string;
};

export type FilterField =
  | (FilterFieldBase & { type: 'text' })
  | (FilterFieldBase & { type: 'masked'; mask: MaskType })
  | (FilterFieldBase & {
      type: 'select' | 'combobox';
      options: FilterOption[];
      searchPlaceholder?: string;
      emptyText?: string;
      /** Server-side search: control the query text and turn off client filtering. */
      searchValue?: string;
      onSearchChange?: (value: string) => void;
      shouldFilter?: boolean;
    })
  | (FilterFieldBase & { type: 'date' })
  | (FilterFieldBase & { type: 'daterange' })
  | (FilterFieldBase & { type: 'switch'; description?: string })
  | (FilterFieldBase & { type: 'checkbox'; description?: string });

export interface MFiltersProps {
  fields: FilterField[];
  values: Record<string, unknown>;
  onChange: (key: string, value: unknown) => void;
  onSearch: () => void;
  onClear: () => void;
  hasActiveFilters?: boolean;
  collapsibleThreshold?: number;
  title?: string;
  searchLabel?: string;
  clearLabel?: string;
  className?: string;
}

export function MFilters({
  fields,
  values,
  onChange,
  onSearch,
  onClear,
  hasActiveFilters = false,
  collapsibleThreshold = 4,
  title = 'Хайлт хийх',
  searchLabel = 'Хайх',
  clearLabel = 'Цэвэрлэх',
  className,
}: MFiltersProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const collapsible = fields.length > collapsibleThreshold;

  const grid = (
    <div className="gap-x-4 gap-y-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 grid grid-cols-1">
      {fields.map((field) => (
        <FilterFieldControl
          key={field.key}
          field={field}
          value={values[field.key]}
          onChange={onChange}
          onSearch={onSearch}
        />
      ))}
    </div>
  );

  const actions = (
    <div className="gap-2 flex shrink-0 items-center">
      <Button
        onClick={onSearch}
        size="sm"
        className="gap-2 flex cursor-pointer items-center bg-primary text-primary-foreground hover:bg-primary/80"
      >
        <Search className="size-4" />
        {searchLabel}
      </Button>
      {hasActiveFilters && (
        <Button
          variant="secondary"
          onClick={onClear}
          size="sm"
          className="gap-2 flex cursor-pointer items-center text-muted-foreground"
        >
          <X className="size-4" />
          {clearLabel}
        </Button>
      )}
    </div>
  );

  if (!collapsible) {
    return (
      <div
        className={cn(
          'gap-3 p-3 flex w-full flex-col rounded-lg border bg-muted/30',
          className,
        )}
      >
        <div className="gap-2 sm:flex-row sm:items-center sm:justify-between flex flex-col">
          <div className="gap-2 text-sm font-medium flex items-center text-muted-foreground">
            <ListFilter className="size-4" />
            <span>{title}</span>
          </div>
          {actions}
        </div>
        {grid}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'gap-4 p-3 flex w-full flex-col rounded-lg border bg-muted/30',
        className,
      )}
    >
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="gap-2 sm:flex-row sm:items-center sm:justify-between flex flex-col">
          <CollapsibleTrigger
            render={
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 p-2 sm:min-w-0 sm:flex-1 flex items-center justify-start"
              />
            }
          >
            <ListFilter className="size-4" />
            <span className="font-medium text-muted-foreground">{title}</span>
          </CollapsibleTrigger>
          {actions}
        </div>
        <CollapsibleContent className="pt-3">{grid}</CollapsibleContent>
      </Collapsible>
    </div>
  );
}

interface FilterFieldControlProps {
  field: FilterField;
  value: unknown;
  onChange: (key: string, value: unknown) => void;
  onSearch: () => void;
}

function FilterFieldControl({
  field,
  value,
  onChange,
  onSearch,
}: FilterFieldControlProps) {
  // Boolean filters carry their label beside the control instead of above it, so
  // they would otherwise sit at the top of a grid row whose height is set by the
  // labelled inputs next to them. Filling the row and centring keeps every
  // control on one optical line without hard-coding "label + input" heights.
  if (field.type === 'checkbox' || field.type === 'switch') {
    const controlId = `filter-${field.key}`;

    return (
      <div className={cn('min-h-14 flex h-full items-center', field.className)}>
        <div className="gap-1 flex flex-col">
          {field.type === 'checkbox' ? (
            <MCheckbox
              id={controlId}
              checked={Boolean(value)}
              onCheckedChange={(checked) => onChange(field.key, checked)}
              label={field.label}
            />
          ) : (
            <div className="gap-2.5 flex items-center">
              <MSwitch
                id={controlId}
                checked={Boolean(value)}
                onCheckedChange={(checked) => onChange(field.key, checked)}
              />
              <Label
                htmlFor={controlId}
                className="text-sm cursor-pointer leading-none"
              >
                {field.label}
              </Label>
            </div>
          )}
          {field.description ? (
            <span className="text-xs text-muted-foreground">
              {field.description}
            </span>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('gap-1.5 flex flex-col', field.className)}>
      <Label className="text-xs font-medium text-muted-foreground">
        {field.label}
      </Label>

      {field.type === 'text' && (
        <MInput
          placeholder={field.placeholder}
          value={(value as string | undefined) ?? ''}
          onChange={(e) => onChange(field.key, e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onSearch();
          }}
        />
      )}

      {field.type === 'masked' && (
        <MaskedInput
          mask={field.mask}
          placeholder={field.placeholder}
          value={(value as string | undefined) ?? ''}
          onValueChange={(next) => onChange(field.key, next)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onSearch();
          }}
        />
      )}

      {(field.type === 'select' || field.type === 'combobox') && (
        <MDatalist
          options={field.options}
          value={(value as string | undefined) ?? ''}
          onValueChange={(next) => onChange(field.key, next)}
          placeholder={field.placeholder}
          searchPlaceholder={field.searchPlaceholder}
          emptyText={field.emptyText}
          searchValue={field.searchValue}
          onSearchChange={field.onSearchChange}
          shouldFilter={field.shouldFilter}
        />
      )}

      {field.type === 'date' && (
        <DatePicker
          value={value as Date | undefined}
          onChange={(date) => onChange(field.key, date)}
          placeholder={field.placeholder}
        />
      )}

      {field.type === 'daterange' && (
        <DateRangePicker
          value={value as DateRangeValue | undefined}
          onChange={(range) => onChange(field.key, range)}
          placeholder={field.placeholder}
        />
      )}
    </div>
  );
}
