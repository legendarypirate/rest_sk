import { INTEGRATION_SCOPES, type IntegrationDetail } from '@packages/types';
import { z } from 'zod';

export const integrationSchema = z.object({
  name: z.string().trim().min(1, 'Нэр оруулна уу').max(120),
  baseUrl: z.string().trim().url('Хаяг буруу байна').max(300),
  clientId: z.string().trim().min(1, 'Client ID оруулна уу').max(200),
  clientSecret: z.string().trim().max(500),
  isEnabled: z.boolean(),
  scopes: z.array(z.enum(INTEGRATION_SCOPES)).min(1, 'Дор хаяж нэг эрх сонгоно уу'),
});

export type IntegrationFormData = z.infer<typeof integrationSchema>;

export function getIntegrationDefaults(item?: IntegrationDetail): IntegrationFormData {
  return {
    name: item?.name ?? 'MLOS',
    baseUrl: item?.baseUrl ?? 'http://localhost:5050/api/v1',
    clientId: item?.clientId ?? '',
    clientSecret: '',
    isEnabled: item?.isEnabled ?? true,
    scopes: item?.scopes.length ? item.scopes.filter(isScope) : ['employees:read'],
  };
}

function isScope(value: string): value is IntegrationFormData['scopes'][number] {
  return (INTEGRATION_SCOPES as readonly string[]).includes(value);
}
