'use client';

import { MFilters } from '@packages/ui/main/MFilters';

import type { MatrixFilters } from '../lib/matrix';

type RoleResourcesFiltersProps = {
  values: MatrixFilters;
  groupOptions: { value: string; label: string }[];
  onChange: (key: string, value: unknown) => void;
  onSearch: () => void;
  onClear: () => void;
  hasActiveFilters: boolean;
};

export function RoleResourcesFilters({
  values,
  groupOptions,
  onChange,
  onSearch,
  onClear,
  hasActiveFilters,
}: RoleResourcesFiltersProps) {
  return (
    <MFilters
      title="Цэс хайх"
      values={values}
      onChange={onChange}
      onSearch={onSearch}
      onClear={onClear}
      hasActiveFilters={hasActiveFilters}
      collapsibleThreshold={4}
      fields={[
        {
          key: 'search',
          type: 'text',
          label: 'Хайх',
          placeholder: 'Цэс, слаг, зөвшөөрлийн түлхүүр',
        },
        {
          key: 'groupKey',
          type: 'combobox',
          label: 'Бүлэг',
          placeholder: 'Бүгд',
          searchPlaceholder: 'Бүлэг хайх…',
          emptyText: 'Бүлэг олдсонгүй',
          options: groupOptions,
        },
        {
          key: 'grantedOnly',
          type: 'checkbox',
          label: 'Зөвхөн олгосонг харуулах',
        },
      ]}
    />
  );
}
