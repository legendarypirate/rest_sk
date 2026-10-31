'use client';

import { PageWrapper } from '@/layouts/page.wrapper';
import { PlatformPermission } from '@/types/routes';

import { RoleResourcesScreen } from '../../components/Role.resources.screen';

export default function RoleResourcesPage() {
  return (
    <PageWrapper
      title="Үүргийн зөвшөөрөл"
      permission={PlatformPermission.RolesManage}
    >
      <RoleResourcesScreen />
    </PageWrapper>
  );
}
