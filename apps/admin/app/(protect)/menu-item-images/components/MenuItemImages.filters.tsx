'use client';

import { useQuery } from '@tanstack/react-query';
import { MFilters } from '@packages/ui/main/MFilters';

import { listMenuItems } from '@/services/menus/menus.service';

import type { MenuItemImageFilters } from '../hooks';

export function MenuItemImagesFilters({
  values,
  onChange,
  onSearch,
  onClear,
  hasActiveFilters,
}: {
  values: MenuItemImageFilters;
  onChange: (key: string, value: unknown) => void;
  onSearch: () => void;
  onClear: () => void;
  hasActiveFilters: boolean;
}) {
  const items = useQuery({
    queryKey: ['menu-items', 'options'],
    queryFn: () => listMenuItems({ page: 1, limit: '*' }),
  });
  return (
    <MFilters
      title="Хоолны зураг хайх"
      values={values}
      onChange={onChange}
      onSearch={onSearch}
      onClear={onClear}
      hasActiveFilters={hasActiveFilters}
      fields={[
        {
          key: 'menuItemId',
          type: 'select',
          label: 'Хоол',
          placeholder: 'Бүгд',
          options: (items.data?.items ?? []).map((row) => ({ value: row.id, label: row.name })),
        },
      ]}
    />
  );
}
