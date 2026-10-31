'use client';

import { PageWrapper } from '@/layouts/page.wrapper';
import { PlatformPermission } from '@/types/routes';

import { ResourcesScreen } from './components';

export default function ResourcesPage() {
  return (
    <PageWrapper title="Цэс" permission={PlatformPermission.ResourcesRead}>
      <ResourcesScreen />
    </PageWrapper>
  );
}
