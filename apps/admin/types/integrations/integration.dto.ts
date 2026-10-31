import type { IntegrationScope, SortDirection } from '@packages/types';

export type ListIntegrationsQueryDto = {
  page?: number;
  limit?: number;
  search?: string;
  sortDirection?: SortDirection;
};

export type UpsertIntegrationDto = {
  name: string;
  baseUrl: string;
  clientId: string;
  clientSecret?: string;
  isEnabled?: boolean;
  scopes: IntegrationScope[];
};
