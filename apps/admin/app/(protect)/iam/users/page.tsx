'use client';

import { PageWrapper } from '@/layouts/page.wrapper';
import { PlatformPermission } from '@/types/routes';

import { UsersScreen } from './components';

export default function UsersPage() {
  return (
    <PageWrapper title="Хэрэглэгчид" permission={PlatformPermission.UsersRead}>
      <UsersScreen />
    </PageWrapper>
  );
}
