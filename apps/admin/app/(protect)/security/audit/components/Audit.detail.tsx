'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { toast } from '@packages/ui/components/sonner';
import { CancelButton } from '@packages/ui/main/MButtons';
import { DialogForm } from '@packages/ui/main/MDialog';
import { useDialog } from '@packages/ui/main/MDialog.context';
import { Button } from '@packages/ui/components/button';
import { cn } from '@packages/ui/lib/utils';
import type { AuditVerifyResult } from '@packages/types';

import type { ReactNode } from 'react';

import { getApiErrorMessage } from '@/lib/api-error';
import { getAudit, verifyAudit } from '@/services/iam/audit.service';

import {
  ACTOR_TYPE_LABELS,
  AUDIT_ACTION_LABELS,
  actorLabel,
  formatDateTime,
} from '../lib/labels';

type AuditDetailProps = {
  id: string;
};

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="grid grid-cols-[140px_1fr] gap-3 py-2">
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd className="min-w-0 break-all text-sm">{value || '—'}</dd>
    </div>
  );
}

function JsonBlock({ value }: { value: unknown }) {
  if (value === null || value === undefined || value === '') {
    return <span className="text-muted-foreground">—</span>;
  }

  return (
    <pre className="max-h-48 overflow-auto rounded-md border bg-muted/40 p-3 text-xs">
      {JSON.stringify(value, null, 2)}
    </pre>
  );
}

function VerifyBadge({ result }: { result: AuditVerifyResult }) {
  return (
    <span
      className={cn(
        'rounded-full px-2 py-0.5 text-xs font-medium',
        result.valid
          ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
          : 'bg-red-500/15 text-red-700 dark:text-red-300',
      )}
    >
      {result.valid ? 'Хэш зөв' : 'Хэш таарахгүй'}
    </span>
  );
}

export function AuditDetail({ id }: AuditDetailProps) {
  const { hideDialog } = useDialog();
  const detail = useQuery({
    queryKey: ['security', 'audit', id],
    queryFn: () => getAudit(id),
  });
  const verify = useMutation({
    mutationFn: () => verifyAudit(id),
    onSuccess: (result) => {
      if (result.valid) {
        toast.success('Бүртгэлийн хэш баталгаажлаа.');
        return;
      }

      toast.error('Бүртгэлийн хэш таарахгүй байна.');
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });

  const item = detail.data;

  if (detail.isPending) {
    return (
      <div className="py-10 text-center text-sm text-muted-foreground">
        Уншиж байна…
      </div>
    );
  }

  if (detail.isError || !item) {
    return (
      <div className="py-10 text-center text-sm text-destructive">
        {detail.error
          ? getApiErrorMessage(detail.error)
          : 'Бүртгэл олдсонгүй.'}
      </div>
    );
  }

  return (
    <DialogForm
      onSubmit={(event) => event.preventDefault()}
      actions={
        <>
          <Button
            type="button"
            variant="outline"
            disabled={verify.isPending}
            onClick={() => verify.mutate()}
          >
            {verify.isPending ? 'Шалгаж байна…' : 'Хэш шалгах'}
          </Button>
          <CancelButton type="button" tooltip={false} onClick={hideDialog} />
        </>
      }
    >
      <dl className="divide-y">
        <DetailRow label="Огноо" value={formatDateTime(item.createdAt)} />
        <DetailRow
          label="Үйлдэл"
          value={AUDIT_ACTION_LABELS[item.action] ?? item.action}
        />
        <DetailRow label="Нөөцийн төрөл" value={item.resourceType} />
        <DetailRow label="Нөөцийн ID" value={item.resourceId} />
        <DetailRow
          label="Гүйцэтгэсэн"
          value={actorLabel(item.actor, ACTOR_TYPE_LABELS[item.actorType])}
        />
        <DetailRow
          label="Төрөл"
          value={ACTOR_TYPE_LABELS[item.actorType] ?? item.actorType}
        />
        <DetailRow label="Хэнд" value={actorLabel(item.target)} />
        <DetailRow label="IP" value={item.ipAddress} />
        <DetailRow label="Хөтөч" value={item.userAgent} />
        <DetailRow label="Хүсэлтийн ID" value={item.requestId} />
        <DetailRow label="Холбоос ID" value={item.correlationId} />
        <DetailRow
          label="Хэш"
          value={
            <div className="flex flex-col gap-1">
              <span className="font-mono text-xs">{item.recordHash}</span>
              {verify.data ? <VerifyBadge result={verify.data} /> : null}
            </div>
          }
        />
        <DetailRow
          label="Өмнөх хэш"
          value={
            <span className="font-mono text-xs">
              {item.previousHash ?? '—'}
            </span>
          }
        />
      </dl>

      <div className="mt-4 space-y-3">
        <div>
          <p className="mb-1 text-xs font-medium text-muted-foreground">
            Өмнөх утга
          </p>
          <JsonBlock value={item.before} />
        </div>
        <div>
          <p className="mb-1 text-xs font-medium text-muted-foreground">
            Дараах утга
          </p>
          <JsonBlock value={item.after} />
        </div>
        <div>
          <p className="mb-1 text-xs font-medium text-muted-foreground">
            Нэмэлт мэдээлэл
          </p>
          <JsonBlock value={item.metadata} />
        </div>
      </div>
    </DialogForm>
  );
}
