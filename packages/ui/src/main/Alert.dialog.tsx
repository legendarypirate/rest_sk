'use client';

import { TriangleAlert } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@packages/ui/components/dialog';

import { CancelButton, DeleteButton } from './MButtons';

type Props = {
  title: string;
  description: string;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export function AlertDialog({ description, isOpen, title, onClose, onConfirm }: Props) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex justify-center items-center w-full">
            <TriangleAlert className="h-16 w-16 text-red-400" />
          </DialogTitle>
          <DialogTitle className="text-center">{title}</DialogTitle>
          <DialogDescription className="text-center">{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <div className="flex justify-center w-full items-center gap-x-3 mt-5">
            <CancelButton text="Үгүй" tooltip={false} onClick={onClose} />
            <DeleteButton text="Устгах" tooltip={false} onClick={onConfirm} />
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
