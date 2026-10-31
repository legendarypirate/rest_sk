'use client';

import { PageWrapper } from '@/layouts/page.wrapper';
import { PlatformPermission } from '@/types/routes';

import { MealOrdersScreen } from './components';

export default function EmployeeMealOrdersPage() {
  return (
    <PageWrapper title="Хоолны захиалга" permission={PlatformPermission.EmployeeMealOrdersRead}>
      <MealOrdersScreen />
    </PageWrapper>
  );
}
