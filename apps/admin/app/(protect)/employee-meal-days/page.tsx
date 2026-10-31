'use client';

import { PageWrapper } from '@/layouts/page.wrapper';
import { PlatformPermission } from '@/types/routes';

import { MealDaysScreen } from './components';

export default function EmployeeMealDaysPage() {
  return (
    <PageWrapper title="Өдрийн хоол" permission={PlatformPermission.EmployeeMealDaysRead}>
      <MealDaysScreen />
    </PageWrapper>
  );
}
