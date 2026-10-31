'use client';

import { useQuery } from '@tanstack/react-query';
import { MFilters } from '@packages/ui/main/MFilters';

import { listMenuCategories } from '@/services/menus/menus.service';

import type { MenuItemFilters } from '../hooks';
import { AVAILABILITY_OPTIONS, FOOD_TYPE_OPTIONS, RECORD_STATUS_OPTIONS } from '../lib/labels';

export function MenuItemsFilters({
  values,
  onChange,
  onSearch,
  onClear,
  hasActiveFilters,
}: {
  values: MenuItemFilters;
  onChange: (key: string, value: unknown) => void;
  onSearch: () => void;
  onClear: () => void;
  hasActiveFilters: boolean;
}) {
  const categories = useQuery({
    queryKey: ['menu-categories', 'options'],
    queryFn: () => listMenuCategories({ page: 1, limit: '*' }),
  });
  return (
    <MFilters
      title="Хоол хайх"
      values={values}
      onChange={onChange}
      onSearch={onSearch}
      onClear={onClear}
      hasActiveFilters={hasActiveFilters}
      fields={[
        { key: 'search', type: 'text', label: 'Хайх', placeholder: 'Нэр, код' },
        {
          key: 'foodType',
          type: 'select',
          label: 'Төрөл',
          placeholder: 'Бүгд',
          options: FOOD_TYPE_OPTIONS,
        },
        {
          key: 'categoryId',
          type: 'select',
          label: 'Ангилал',
          placeholder: 'Бүгд',
          options: (categories.data?.items ?? []).map((row) => ({ value: row.id, label: row.name })),
        },
        { key: 'status', type: 'select', label: 'Төлөв', placeholder: 'Бүгд', options: RECORD_STATUS_OPTIONS },
        { key: 'availability', type: 'select', label: 'Бэлэн байдал', placeholder: 'Бүгд', options: AVAILABILITY_OPTIONS },
      ]}
    />
  );
}
