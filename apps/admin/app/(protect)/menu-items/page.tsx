'use client';

import { PageWrapper } from '@/layouts/page.wrapper';
import { PlatformPermission } from '@/types/routes';

import { MenuItemsScreen } from './components';

export default function MenuItemsPage() {
  return (
    <PageWrapper title="Хоолны жагсаалт" permission={PlatformPermission.MenuItemsRead}>
      <MenuItemsScreen />
    </PageWrapper>
  );
}
