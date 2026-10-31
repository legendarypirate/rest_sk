'use client';

import { MFilters } from '@packages/ui/main/MFilters';

import type { MediaFilters as MediaFilterValues } from '../hooks';
import { MEDIA_STATUS_OPTIONS } from '../lib/labels';

type MediaFiltersProps = {
  values: MediaFilterValues;
  onChange: (key: string, value: unknown) => void;
  onSearch: () => void;
  onClear: () => void;
  hasActiveFilters: boolean;
};

export function MediaFilters({
  values,
  onChange,
  onSearch,
  onClear,
  hasActiveFilters,
}: MediaFiltersProps) {
  return (
    <MFilters
      title="Медиа хайх"
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
          placeholder: 'Файлын нэр, тайлбар',
        },
        {
          key: 'status',
          type: 'combobox',
          label: 'Төлөв',
          placeholder: 'Бүгд',
          searchPlaceholder: 'Төлөв хайх…',
          emptyText: 'Төлөв олдсонгүй',
          options: MEDIA_STATUS_OPTIONS,
        },
        {
          key: 'includeDeleted',
          type: 'checkbox',
          label: 'Устгасныг харуулах',
        },
      ]}
    />
  );
}
