'use client';

import { MFilters } from '@packages/ui/main/MFilters';

import { AUDIT_ACTION_OPTIONS } from '../lib/labels';
import type { AuditFilters as AuditFilterValues } from '../hooks';

type AuditFiltersProps = {
  values: AuditFilterValues;
  onChange: (key: string, value: unknown) => void;
  onSearch: () => void;
  onClear: () => void;
  hasActiveFilters: boolean;
};

export function AuditFilters({
  values,
  onChange,
  onSearch,
  onClear,
  hasActiveFilters,
}: AuditFiltersProps) {
  return (
    <MFilters
      title="Бүртгэл хайх"
      values={values}
      onChange={onChange}
      onSearch={onSearch}
      onClear={onClear}
      hasActiveFilters={hasActiveFilters}
      collapsibleThreshold={3}
      fields={[
        {
          key: 'action',
          type: 'combobox',
          label: 'Үйлдэл',
          placeholder: 'Бүгд',
          searchPlaceholder: 'Үйлдэл хайх…',
          emptyText: 'Үйлдэл олдсонгүй',
          options: AUDIT_ACTION_OPTIONS,
        },
        {
          key: 'resourceType',
          type: 'text',
          label: 'Нөөцийн төрөл',
          placeholder: 'user, role, session',
        },
        {
          key: 'resourceId',
          type: 'text',
          label: 'Нөөцийн ID',
          placeholder: 'Бичлэгийн дугаар',
        },
        {
          key: 'requestId',
          type: 'text',
          label: 'Хүсэлтийн ID',
          placeholder: 'requestId',
        },
        {
          key: 'createdAt',
          type: 'daterange',
          label: 'Огноо',
          placeholder: 'Эхлэх — дуусах',
        },
      ]}
    />
  );
}
