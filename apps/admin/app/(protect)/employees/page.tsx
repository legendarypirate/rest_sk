'use client';

import { PageWrapper } from '@/layouts/page.wrapper';
import { PlatformPermission } from '@/types/routes';

import { EmployeesScreen } from './components';

export default function EmployeesPage() {
  return (
    <PageWrapper title="Ажилтнууд" permission={PlatformPermission.EmployeesRead}>
      <EmployeesScreen />
    </PageWrapper>
  );
}
