'use client';

import { PageWrapper } from '@/layouts/page.wrapper';
import { PlatformPermission } from '@/types/routes';

import { IntegrationsScreen } from './components';

export default function IntegrationsPage() {
  return (
    <PageWrapper title="Интеграци" permission={PlatformPermission.IntegrationsRead}>
      <IntegrationsScreen />
    </PageWrapper>
  );
}
