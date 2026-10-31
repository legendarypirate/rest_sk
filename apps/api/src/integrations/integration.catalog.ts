export const INTEGRATION_APIS = [
  {
    scope: 'employees:read',
    method: 'GET',
    path: '/integration/employees',
  },
  {
    scope: 'employees:read',
    method: 'GET',
    path: '/integration/employees/:id',
  },
  {
    scope: 'employee-vehicles:read',
    method: 'GET',
    path: '/integration/employees/:id/vehicles',
  },
  {
    scope: 'vehicles:read',
    method: 'GET',
    path: '/integration/vehicles',
  },
  {
    scope: 'vehicles:read',
    method: 'GET',
    path: '/integration/vehicles/:id',
  },
] as const;

export type { IntegrationScope } from '@packages/types';
export { INTEGRATION_SCOPES } from '@packages/types';
