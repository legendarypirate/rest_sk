'use client';

import { AlertDialog } from '@packages/ui/main/Alert.dialog';
import { toast } from '@packages/ui/components/sonner';
import type { UserListItem } from '@packages/types';

import { useUserMutate } from '../hooks';
import { displayName } from '../lib/labels';

type UserDeleteProps = {
  user: UserListItem | null;
  open: boolean;
  onClose: () => void;
};

export function UserDelete({ user, open, onClose }: UserDeleteProps) {
  const { remove } = useUserMutate();

  return (
    <AlertDialog
      isOpen={open && Boolean(user)}
      title="Хэрэглэгч устгах уу?"
      description={
        user
          ? `${displayName(user)} хэрэглэгчийг устгаснаар нэвтрэх эрх хаагдана.`
          : ''
      }
      onClose={() => {
        if (!remove.isPending) {
          onClose();
        }
      }}
      onConfirm={() => {
        if (!user || remove.isPending) {
          return;
        }

        remove.mutate(user.id, {
          onSuccess: () => {
            toast.success('Хэрэглэгчийг устгалаа.');
            onClose();
          },
        });
      }}
    />
  );
}
