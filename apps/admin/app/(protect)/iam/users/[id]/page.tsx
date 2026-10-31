'use client';

import { PageWrapper } from '@/layouts/page.wrapper';
import { PlatformPermission } from '@/types/routes';

import { UserDetail } from '../components/User.detail';

export default function UserDetailPage() {
  return (
    <PageWrapper title="Хэрэглэгчид" permission={PlatformPermission.UsersRead}>
      <UserDetail />
    </PageWrapper>
  );
}
