'use client';

import { PageWrapper } from '@/layouts/page.wrapper';
import { PlatformPermission } from '@/types/routes';

import { RestaurantsScreen } from './components';

export default function RestaurantsPage() {
  return (
    <PageWrapper title="Ресторан" permission={PlatformPermission.RestaurantsRead}>
      <RestaurantsScreen />
    </PageWrapper>
  );
}
