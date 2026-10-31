'use client';

import { PageWrapper } from '@/layouts/page.wrapper';

export default function AnalyzePage() {
  return (
    <PageWrapper title="Хяналтын самбар">
      <div className="flex flex-1 flex-col gap-4 p-6">
        <h1 className="text-2xl font-semibold">Хяналтын самбар</h1>
        <p className="text-muted-foreground text-sm">
          Protected admin workspace
        </p>
      </div>
    </PageWrapper>
  );
}
