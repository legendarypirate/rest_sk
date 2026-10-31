import type { IntegrationScope } from '@packages/types';

export const INTEGRATION_SCOPE_OPTIONS: Array<{
  value: IntegrationScope;
  label: string;
}> = [
  { value: 'employees:read', label: 'Ажилтан унших' },
  { value: 'vehicles:read', label: 'Тээврийн хэрэгсэл унших' },
  { value: 'employee-vehicles:read', label: 'Ажилтны тээвэр унших' },
];

export function formatDateTime(value: string | null) {
  if (!value) {
    return '—';
  }

  return new Date(value).toLocaleString('mn-MN', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
}
