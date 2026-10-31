'use client';

import { MFilters } from '@packages/ui/main/MFilters';

import type { IntegrationsFilters as IntegrationsFilterValues } from '../hooks';

type IntegrationsFiltersProps = {
  values: IntegrationsFilterValues;
  onChange: (key: string, value: unknown) => void;
  onSearch: () => void;
  onClear: () => void;
  hasActiveFilters: boolean;
};

export function IntegrationsFilters({
  values,
  onChange,
  onSearch,
  onClear,
  hasActiveFilters,
}: IntegrationsFiltersProps) {
  return (
    <MFilters
      title="Интеграци хайх"
      values={values}
      onChange={onChange}
      onSearch={onSearch}
      onClear={onClear}
      hasActiveFilters={hasActiveFilters}
      fields={[
        {
          key: 'search',
          type: 'text',
          label: 'Хайх',
          placeholder: 'Нэр, хаяг, client ID',
        },
      ]}
    />
  );
}
