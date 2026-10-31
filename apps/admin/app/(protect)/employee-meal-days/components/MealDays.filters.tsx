'use client';

import { MFilters } from '@packages/ui/main/MFilters';

import type { MealDayFilters } from '../hooks';

export function MealDaysFilters({
  values,
  onChange,
  onSearch,
  onClear,
  hasActiveFilters,
}: {
  values: MealDayFilters;
  onChange: (key: string, value: unknown) => void;
  onSearch: () => void;
  onClear: () => void;
  hasActiveFilters: boolean;
}) {
  return (
    <MFilters
      title="Өдрийн хоол хайх"
      values={values}
      onChange={onChange}
      onSearch={onSearch}
      onClear={onClear}
      hasActiveFilters={hasActiveFilters}
      fields={[
        {
          key: 'serviceDate',
          type: 'daterange',
          label: 'Огноо',
          placeholder: 'Эхлэх — дуусах',
        },
      ]}
    />
  );
}
