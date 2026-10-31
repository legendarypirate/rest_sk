'use client';

import { MFilters } from '@packages/ui/main/MFilters';

import type { RestaurantFilters } from '../hooks';
import { RECORD_STATUS_OPTIONS } from '../lib/labels';

export function RestaurantsFilters({
  values,
  onChange,
  onSearch,
  onClear,
  hasActiveFilters,
}: {
  values: RestaurantFilters;
  onChange: (key: string, value: unknown) => void;
  onSearch: () => void;
  onClear: () => void;
  hasActiveFilters: boolean;
}) {
  return (
    <MFilters
      title="Ресторан хайх"
      values={values}
      onChange={onChange}
      onSearch={onSearch}
      onClear={onClear}
      hasActiveFilters={hasActiveFilters}
      fields={[
        { key: 'search', type: 'text', label: 'Хайх', placeholder: 'Нэр, код' },
        { key: 'status', type: 'select', label: 'Төлөв', placeholder: 'Бүгд', options: RECORD_STATUS_OPTIONS },
      ]}
    />
  );
}
