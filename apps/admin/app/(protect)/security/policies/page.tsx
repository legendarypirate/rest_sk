'use client';

import { PageWrapper } from '@/layouts/page.wrapper';
import { PlatformPermission } from '@/types/routes';

import { PoliciesScreen } from './components';

export default function SecurityPoliciesPage() {
  return (
    <PageWrapper
      title="Хамгаалалтын бодлого"
      permission={[
        PlatformPermission.SecurityRead,
        PlatformPermission.SecurityManage,
      ]}
      match="any"
    >
      <PoliciesScreen />
    </PageWrapper>
  );
}
