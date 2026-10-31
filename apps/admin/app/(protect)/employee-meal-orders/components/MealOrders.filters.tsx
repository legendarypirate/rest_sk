'use client';

import { MFilters } from '@packages/ui/main/MFilters';

import type { MealOrderFilters } from '../hooks';

export function MealOrdersFilters({
  values,
  onChange,
  onSearch,
  onClear,
  hasActiveFilters,
}: {
  values: MealOrderFilters;
  onChange: (key: string, value: unknown) => void;
  onSearch: () => void;
  onClear: () => void;
  hasActiveFilters: boolean;
}) {
  return (
    <MFilters
      title="Захиалга хайх"
      values={values}
      onChange={onChange}
      onSearch={onSearch}
      onClear={onClear}
      hasActiveFilters={hasActiveFilters}
      fields={
        [
          { key: 'search', type: 'text', label: 'Хайх', placeholder: 'Ажилтны нэр, код' }, 
          { key: 'serviceDate', type: 'daterange', label: 'Огноо', placeholder: 'Огнооны интервал' }]}
    />
  );
}
