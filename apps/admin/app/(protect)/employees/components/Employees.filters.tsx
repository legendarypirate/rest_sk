'use client';

import { MFilters } from '@packages/ui/main/MFilters';

import type { EmployeesFilters as EmployeesFilterValues } from '../hooks';
import { EMPLOYEE_STATUS_OPTIONS } from '../lib/labels';

type EmployeesFiltersProps = {
  values: EmployeesFilterValues;
  onChange: (key: string, value: unknown) => void;
  onSearch: () => void;
  onClear: () => void;
  hasActiveFilters: boolean;
};

export function EmployeesFilters({
  values,
  onChange,
  onSearch,
  onClear,
  hasActiveFilters,
}: EmployeesFiltersProps) {
  return (
    <MFilters
      title="Ажилтан хайх"
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
          placeholder: 'Код, нэр, алба, албан тушаал',
        },
        {
          key: 'status',
          type: 'combobox',
          label: 'Төлөв',
          placeholder: 'Бүгд',
          searchPlaceholder: 'Төлөв хайх…',
          emptyText: 'Төлөв олдсонгүй',
          options: EMPLOYEE_STATUS_OPTIONS,
        },
      ]}
    />
  );
}
