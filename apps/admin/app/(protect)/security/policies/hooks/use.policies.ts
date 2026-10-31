'use client';

import { useQuery } from '@tanstack/react-query';

import { getSecurityPolicies } from '@/services/iam/security.service';

export const securityPoliciesQueryKey = ['security', 'policies'] as const;

export function useSecurityPolicies() {
  return useQuery({
    queryKey: securityPoliciesQueryKey,
    queryFn: getSecurityPolicies,
  });
}
