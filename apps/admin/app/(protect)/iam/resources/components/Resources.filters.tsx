'use client';

import { MFilters } from '@packages/ui/main/MFilters';

import type { ResourcesFilters as ResourcesFilterValues } from '../hooks';
import {
  RESOURCE_SCOPE_OPTIONS,
  RESOURCE_SYSTEM_OPTIONS,
} from '../lib/labels';

type ResourcesFiltersProps = {
  values: ResourcesFilterValues;
  onChange: (key: string, value: unknown) => void;
  onSearch: () => void;
  onClear: () => void;
  hasActiveFilters: boolean;
};

export function ResourcesFilters({
  values,
  onChange,
  onSearch,
  onClear,
  hasActiveFilters,
}: ResourcesFiltersProps) {
  return (
    <MFilters
      title="Цэс хайх"
      values={values}
      onChange={onChange}
      onSearch={onSearch}
      onClear={onClear}
      hasActiveFilters={hasActiveFilters}
      collapsibleThreshold={3}
      fields={[
        {
          key: 'search',
          type: 'text',
          label: 'Хайх',
          placeholder: 'Нэр, слаг, зам',
        },
        {
          key: 'scope',
          type: 'combobox',
          label: 'Хүрээ',
          placeholder: 'Бүгд',
          searchPlaceholder: 'Хүрээ хайх…',
          emptyText: 'Хүрээ олдсонгүй',
          options: RESOURCE_SCOPE_OPTIONS,
        },
        {
          key: 'isSystem',
          type: 'combobox',
          label: 'Төрөл',
          placeholder: 'Бүгд',
          searchPlaceholder: 'Төрөл хайх…',
          emptyText: 'Төрөл олдсонгүй',
          options: RESOURCE_SYSTEM_OPTIONS,
        },
        {
          key: 'includeDeleted',
          type: 'checkbox',
          label: 'Архивласныг харуулах',
        },
      ]}
    />
  );
}
