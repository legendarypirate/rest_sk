'use client';

import { PageWrapper } from '@/layouts/page.wrapper';
import { PlatformPermission } from '@/types/routes';

import { MenuCategoriesScreen } from './components';

export default function MenuCategoriesPage() {
  return (
    <PageWrapper title="Цэсний ангилал" permission={PlatformPermission.MenuCategoriesRead}>
      <MenuCategoriesScreen />
    </PageWrapper>
  );
}
