'use client';

import { PageWrapper } from '@/layouts/page.wrapper';
import { PlatformPermission } from '@/types/routes';

import { MediaScreen } from './components';

export default function MediaPage() {
  return (
    <PageWrapper title="Медиа сан" permission={PlatformPermission.MediaRead}>
      <MediaScreen />
    </PageWrapper>
  );
}
