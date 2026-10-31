'use client';

import { PageWrapper } from '@/layouts/page.wrapper';
import { PlatformPermission } from '@/types/routes';

import { MenuCategoryImagesScreen } from './components';

export default function MenuCategoryImagesPage() {
  return (
    <PageWrapper title="Ангиллын зураг" permission={PlatformPermission.MenuCategoryImagesRead}>
      <MenuCategoryImagesScreen />
    </PageWrapper>
  );
}
