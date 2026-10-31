'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@packages/ui/components/dialog';
import {
  CancelButton,
  DeleteButton,
  EditButton,
  type ActionButtonProps,
} from '@packages/ui/main/MButtons';
import { useState } from 'react';

type ActionReason = {
  title: string;
  reason: string;
};

export function ActionReasonDialog({
  open,
  title,
  reason,
  onClose,
}: {
  open: boolean;
  title: string;
  reason: string;
  onClose: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className="text-sm leading-relaxed">
            {reason}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <CancelButton text="Хаах" tooltip={false} onClick={onClose} />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function useActionReason() {
  const [state, setState] = useState<ActionReason | null>(null);

  function guard(
    reason: string | undefined,
    title: string,
    action: () => void,
  ) {
    if (reason) {
      setState({ title, reason });
      return;
    }

    action();
  }

  return {
    guard,
    dialog: (
      <ActionReasonDialog
        open={Boolean(state)}
        title={state?.title ?? ''}
        reason={state?.reason ?? ''}
        onClose={() => setState(null)}
      />
    ),
  };
}

export function editBlockedReason(
  deletedAt?: string | null,
  hint?: string,
) {
  if (deletedAt) {
    return 'Архивласан бүртгэлийг засахгүй.';
  }

  return hint;
}

export function deleteBlockedReason(
  deletedAt: string | null | undefined,
  hint?: string,
) {
  if (deletedAt) {
    return 'Архивласан бүртгэлийг дахин устгахгүй.';
  }

  if (!hint) {
    return undefined;
  }

  if (
    hint.endsWith('.') ||
    hint.includes('тул') ||
    hint.startsWith('Зөвхөн') ||
    hint.startsWith('Холбоотой')
  ) {
    return hint;
  }

  return `Холбоотой бүртгэлтэй: ${hint}. Эхлээд холбоосыг салгана.`;
}

type GuardedButtonProps = Omit<ActionButtonProps, 'onClick'> & {
  reason?: string;
  reasonTitle: string;
  onAllow: () => void;
};

function GuardedButton({
  reason,
  reasonTitle,
  onAllow,
  Button,
  ...props
}: GuardedButtonProps & {
  Button: typeof EditButton | typeof DeleteButton;
}) {
  const { guard, dialog } = useActionReason();

  return (
    <>
      <Button
        {...props}
        onClick={() => guard(reason, reasonTitle, onAllow)}
      />
      {dialog}
    </>
  );
}

export function GuardedEditButton(props: Omit<GuardedButtonProps, 'reasonTitle'> & {
  reasonTitle?: string;
}) {
  const { reasonTitle = 'Засах боломжгүй', ...rest } = props;
  return <GuardedButton Button={EditButton} reasonTitle={reasonTitle} {...rest} />;
}

export function GuardedDeleteButton(props: Omit<GuardedButtonProps, 'reasonTitle'> & {
  reasonTitle?: string;
}) {
  const { reasonTitle = 'Устгах боломжгүй', ...rest } = props;
  return (
    <GuardedButton Button={DeleteButton} reasonTitle={reasonTitle} {...rest} />
  );
}
