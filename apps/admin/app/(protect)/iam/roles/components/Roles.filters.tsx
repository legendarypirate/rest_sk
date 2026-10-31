'use client';

import { MFilters } from '@packages/ui/main/MFilters';

import type { RolesFilters as RolesFilterValues } from '../hooks';
import { ROLE_SCOPE_OPTIONS, ROLE_SYSTEM_OPTIONS } from '../lib/labels';

type RolesFiltersProps = {
  values: RolesFilterValues;
  onChange: (key: string, value: unknown) => void;
  onSearch: () => void;
  onClear: () => void;
  hasActiveFilters: boolean;
};

export function RolesFilters({
  values,
  onChange,
  onSearch,
  onClear,
  hasActiveFilters,
}: RolesFiltersProps) {
  return (
    <MFilters
      title="Системийн эрх хайх"
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
          placeholder: 'Нэр, слаг',
        },
        {
          key: 'scope',
          type: 'combobox',
          label: 'Хүрээ',
          placeholder: 'Бүгд',
          searchPlaceholder: 'Хүрээ хайх…',
          emptyText: 'Хүрээ олдсонгүй',
          options: ROLE_SCOPE_OPTIONS,
        },
        {
          key: 'isSystem',
          type: 'combobox',
          label: 'Төрөл',
          placeholder: 'Бүгд',
          searchPlaceholder: 'Төрөл хайх…',
          emptyText: 'Төрөл олдсонгүй',
          options: ROLE_SYSTEM_OPTIONS,
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
