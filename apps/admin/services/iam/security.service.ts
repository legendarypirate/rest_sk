import type { SecurityPolicySnapshot } from '@packages/types';

import { api } from '@/lib/api';

export function getSecurityPolicies() {
  return api<SecurityPolicySnapshot>('security/policies');
}
