'use client';

import { Skeleton } from '@packages/ui/components/skeleton';
import { BackButton } from '@packages/ui/main/MButtons';
import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';

import { getApiErrorMessage } from '@/lib/api-error';

type DetailField = {
  label: string;
  value: ReactNode;
};

type DetailChromeProps = {
  title: string;
  subtitle?: string;
  backHref: string;
  status?: ReactNode;
  actions?: ReactNode;
  fields?: DetailField[];
  fieldsTitle?: string;
  loading?: boolean;
  error?: unknown;
  children?: ReactNode;
};

function DetailHeader({
  title,
  subtitle,
  status,
  actions,
  onBack,
}: {
  title: string;
  subtitle?: string;
  status?: ReactNode;
  actions?: ReactNode;
  onBack: () => void;
}) {
  return (
    <header className="sticky top-0 z-10 border-b bg-card/95 px-5 py-4 backdrop-blur-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <BackButton
            size="icon"
            text={false}
            tooltip
            onClick={onBack}
          />
          <div className="min-w-0 pt-0.5">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="truncate text-xl font-semibold tracking-tight">
                {title}
              </h1>
              {status}
            </div>
            {subtitle ? (
              <p className="mt-1 truncate font-mono text-xs text-muted-foreground">
                {subtitle}
              </p>
            ) : null}
          </div>
        </div>
        {actions ? (
          <div className="flex shrink-0 items-center gap-2">{actions}</div>
        ) : null}
      </div>
    </header>
  );
}

function DetailLoading() {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center gap-3 border-b px-5 py-4">
        <Skeleton className="size-9 rounded-md" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-3 w-32" />
        </div>
        <Skeleton className="h-9 w-24" />
      </div>
      <div className="grid grid-cols-1 gap-px bg-border sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 9 }, (_, index) => (
          <div key={index} className="bg-card px-5 py-3.5">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="mt-2 h-4 w-28" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function DetailChrome({
  title,
  subtitle,
  backHref,
  status,
  actions,
  fields,
  fieldsTitle = 'Ерөнхий',
  loading,
  error,
  children,
}: DetailChromeProps) {
  const router = useRouter();
  const goBack = () => router.push(backHref);

  if (loading) {
    return <DetailLoading />;
  }

  if (error) {
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        <DetailHeader title={title} onBack={goBack} />
        <div className="flex flex-1 flex-col items-center justify-center gap-2 px-5 py-16 text-center">
          <p className="text-sm font-medium">Мэдээлэл уншигдсангүй</p>
          <p className="max-w-md text-sm text-destructive">
            {getApiErrorMessage(error)}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-auto">
      <DetailHeader
        title={title}
        subtitle={subtitle}
        status={status}
        actions={actions}
        onBack={goBack}
      />

      {fields && fields.length > 0 ? (
        <section>
          <div className="border-b px-5 py-2.5">
            <h2 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              {fieldsTitle}
            </h2>
          </div>
          <dl className="grid grid-cols-1 gap-px bg-border sm:grid-cols-2 xl:grid-cols-3">
            {fields.map((field, index) => (
              <div key={`${field.label}-${index}`} className="bg-card px-5 py-3.5">
                <dt className="text-xs text-muted-foreground">{field.label}</dt>
                <dd className="mt-1 text-sm font-medium wrap-break-word">
                  {field.value ?? '—'}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}

      {children ? (
        <section className="border-t px-5 py-5">{children}</section>
      ) : null}
    </div>
  );
}
