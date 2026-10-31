'use client';

import { PageWrapper } from '@/layouts/page.wrapper';
import { PlatformPermission } from '@/types/routes';

import { AuditScreen } from './components';

export default function AuditPage() {
  return (
    <PageWrapper
      title="Аудитын бүртгэл"
      permission={PlatformPermission.AuditRead}
    >
      <AuditScreen />
    </PageWrapper>
  );
}
