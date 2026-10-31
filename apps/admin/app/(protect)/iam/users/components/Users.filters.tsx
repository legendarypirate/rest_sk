'use client';

import { MFilters } from '@packages/ui/main/MFilters';

import { USER_STATUS_OPTIONS } from '../lib/labels';
import type { UsersFilters as UsersFilterValues } from '../hooks';

type UsersFiltersProps = {
  values: UsersFilterValues;
  onChange: (key: string, value: unknown) => void;
  onSearch: () => void;
  onClear: () => void;
  hasActiveFilters: boolean;
};

export function UsersFilters({
  values,
  onChange,
  onSearch,
  onClear,
  hasActiveFilters,
}: UsersFiltersProps) {
  return (
    <MFilters
      title="Хэрэглэгч хайх"
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
          placeholder: 'Имэйл, нэр, нэвтрэх нэр',
        },
        {
          key: 'status',
          type: 'combobox',
          label: 'Төлөв',
          placeholder: 'Бүгд',
          searchPlaceholder: 'Төлөв хайх…',
          emptyText: 'Төлөв олдсонгүй',
          options: USER_STATUS_OPTIONS,
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
