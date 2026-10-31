'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@packages/ui/components/dialog';
import { CancelButton, RestoreButton } from '@packages/ui/main/MButtons';

export function isRestorable(item: {
  deletedAt?: string | null;
  status?: string | null;
}) {
  return Boolean(item.deletedAt) || item.status === 'ARCHIVED';
}

type RestoreDialogProps = {
  open: boolean;
  title: string;
  description: string;
  pending?: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export function RestoreDialog({
  open,
  title,
  description,
  pending,
  onClose,
  onConfirm,
}: RestoreDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && !pending && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-center">{title}</DialogTitle>
          <DialogDescription className="text-center">
            {description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <div className="mt-5 flex w-full items-center justify-center gap-x-3">
            <CancelButton
              text="Үгүй"
              tooltip={false}
              disabled={pending}
              onClick={onClose}
            />
            <RestoreButton
              text="Сэргээх"
              tooltip={false}
              disabled={pending}
              onClick={onConfirm}
            />
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
