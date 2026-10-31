'use client';

import { MFilters } from '@packages/ui/main/MFilters';

export function MealTypesFilters({
  search,
  onSearchChange,
  onSearch,
  onClear,
  hasActiveFilters,
}: {
  search: string;
  onSearchChange: (value: string) => void;
  onSearch: () => void;
  onClear: () => void;
  hasActiveFilters: boolean;
}) {
  return (
    <MFilters
      title="Төрөл хайх"
      values={{ search }}
      onChange={(_key, value) => onSearchChange(String(value ?? ''))}
      onSearch={onSearch}
      onClear={onClear}
      hasActiveFilters={hasActiveFilters}
      fields={[{ key: 'search', type: 'text', label: 'Хайх', placeholder: 'Нэр, код' }]}
    />
  );
}
