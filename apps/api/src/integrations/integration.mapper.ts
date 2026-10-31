import type { Integration, IntegrationApi } from '@generated/prisma/client';
import {
  INTEGRATION_SCOPES,
  type IntegrationDetail,
  type IntegrationScope,
} from '@packages/types';

import { toIso } from '@/common/utils/date';

export type IntegrationRow = Integration & { apis: IntegrationApi[] };

export function toIntegration(row: IntegrationRow): IntegrationDetail {
  return {
    id: row.id,
    publicId: row.publicId,
    name: row.name,
    baseUrl: row.baseUrl,
    clientId: row.clientId,
    hasSecret: Boolean(row.secretCipher),
    isEnabled: row.isEnabled,
    scopes: [
      ...new Set(
        row.apis
          .filter((api) => api.isEnabled)
          .map((api) => api.scope)
          .filter(isScope),
      ),
    ],
    apis: row.apis.map((api) => ({
      id: api.id,
      scope: api.scope,
      method: api.method,
      path: api.path,
      isEnabled: api.isEnabled,
    })),
    lastSyncedAt: toIso(row.lastSyncedAt),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    deletedAt: toIso(row.deletedAt),
  };
}

function isScope(value: string): value is IntegrationScope {
  return (INTEGRATION_SCOPES as readonly string[]).includes(value);
}
