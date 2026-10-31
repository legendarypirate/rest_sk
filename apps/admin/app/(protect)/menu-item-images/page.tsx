'use client';

import { PageWrapper } from '@/layouts/page.wrapper';
import { PlatformPermission } from '@/types/routes';

import { MenuItemImagesScreen } from './components';

export default function MenuItemImagesPage() {
  return (
    <PageWrapper title="Хоолны зураг" permission={PlatformPermission.MenuItemImagesRead}>
      <MenuItemImagesScreen />
    </PageWrapper>
  );
}
