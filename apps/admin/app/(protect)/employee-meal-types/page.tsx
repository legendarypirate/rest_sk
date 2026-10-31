'use client';

import { PageWrapper } from '@/layouts/page.wrapper';
import { PlatformPermission } from '@/types/routes';

import { MealTypesScreen } from './components';

export default function EmployeeMealTypesPage() {
  return (
    <PageWrapper title="Хоолны төрөл" permission={PlatformPermission.EmployeeMealTypesRead}>
      <MealTypesScreen />
    </PageWrapper>
  );
}
