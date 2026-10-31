'use client';

import { MFilters } from '@packages/ui/main/MFilters';

import type { MenuCategoryFilters } from '../hooks';
import { AVAILABILITY_OPTIONS, RECORD_STATUS_OPTIONS } from '../lib/labels';

export function MenuCategoriesFilters({
  values,
  onChange,
  onSearch,
  onClear,
  hasActiveFilters,
}: {
  values: MenuCategoryFilters;
  onChange: (key: string, value: unknown) => void;
  onSearch: () => void;
  onClear: () => void;
  hasActiveFilters: boolean;
}) {
  return (
    <MFilters
      title="Ангилал хайх"
      values={values}
      onChange={onChange}
      onSearch={onSearch}
      onClear={onClear}
      hasActiveFilters={hasActiveFilters}
      fields={[
        { key: 'search', type: 'text', label: 'Хайх', placeholder: 'Нэр, код' },
        {
          key: 'status',
          type: 'select',
          label: 'Төлөв',
          placeholder: 'Бүгд',
          options: RECORD_STATUS_OPTIONS,
        },
        {
          key: 'availability',
          type: 'select',
          label: 'Бэлэн байдал',
          placeholder: 'Бүгд',
          options: AVAILABILITY_OPTIONS,
        },
      ]}
    />
  );
}
