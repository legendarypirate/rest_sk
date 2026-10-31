'use client';

import { PageWrapper } from '@/layouts/page.wrapper';
import { PlatformPermission } from '@/types/routes';

import { RolesScreen } from './components';

export default function RolesPage() {
  return (
    <PageWrapper
      title="Системийн эрх"
      permission={PlatformPermission.RolesRead}
    >
      <RolesScreen />
    </PageWrapper>
  );
}
