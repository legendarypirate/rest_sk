'use client';

import { PageWrapper } from '@/layouts/page.wrapper';
import { PlatformPermission } from '@/types/routes';

import { SchedulesScreen } from './components';

export default function EmployeeOrderSchedulesPage() {
  return (
    <PageWrapper title="Захиалгын цаг" permission={PlatformPermission.EmployeeOrderSchedulesRead}>
      <SchedulesScreen />
    </PageWrapper>
  );
}
