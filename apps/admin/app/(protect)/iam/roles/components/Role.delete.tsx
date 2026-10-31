'use client';

import { AlertDialog } from '@packages/ui/main/Alert.dialog';
import { toast } from '@packages/ui/components/sonner';
import type { RoleListItem } from '@packages/types';

import { useRoleMutate } from '../hooks';

type RoleDeleteProps = {
  role: RoleListItem | null;
  open: boolean;
  onClose: () => void;
};

export function RoleDelete({ role, open, onClose }: RoleDeleteProps) {
  const { remove } = useRoleMutate();

  return (
    <AlertDialog
      isOpen={open && Boolean(role)}
      title="Системийн эрх устгах уу?"
      description={
        role
          ? `${role.name} системийн эрхийг устгаснаар дахин ашиглах боломжгүй болно.`
          : ''
      }
      onClose={() => {
        if (!remove.isPending) {
          onClose();
        }
      }}
      onConfirm={() => {
        if (!role || remove.isPending) {
          return;
        }

        remove.mutate(role.id, {
          onSuccess: () => {
            toast.success('Үүргийг устгалаа.');
            onClose();
          },
        });
      }}
    />
  );
}
