'use client';

import { DocumentTitle } from '@/layouts/document.title';
import { NoAccess } from '@/layouts/no.access';
import { usePermission } from '@/hooks/use.permission';

type PageWrapperProps = {
  children: React.ReactNode;
  title?: string;
  permission?: string | readonly string[];
  match?: 'all' | 'any';
};

function CenteredMessage({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-0 flex-1 items-center justify-center text-sm text-muted-foreground">
      {children}
    </div>
  );
}

export function PageWrapper({
  children,
  title,
  permission,
  match,
}: PageWrapperProps) {
  const { isLoading, user, canAccess } = usePermission();

  let body: React.ReactNode;

  if (isLoading) {
    body = <CenteredMessage>Уншиж байна…</CenteredMessage>;
  } else if (!user) {
    body = null;
  } else if (!canAccess({ permission, match })) {
    body = <NoAccess />;
  } else {
    body = (
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-md border bg-card">
        {children}
      </div>
    );
  }

  return (
    <>
      {title ? <DocumentTitle title={title} /> : null}
      {body}
    </>
  );
}
