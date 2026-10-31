'use client';

import { PageWrapper } from '@/layouts/page.wrapper';

import { KioskAppScreen } from './KioskApp.screen';

export default function KioskAppPage() {
  return (
    <PageWrapper title="Киоск програм">
      <KioskAppScreen />
    </PageWrapper>
  );
}
