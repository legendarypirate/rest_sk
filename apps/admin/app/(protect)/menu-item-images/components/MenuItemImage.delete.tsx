'use client';

import { toast } from '@packages/ui/components/sonner';
import { AlertDialog } from '@packages/ui/main/Alert.dialog';
import type { MenuItemImageItem } from '@packages/types';

import { useMenuItemImageMutate } from '../hooks';

export function MenuItemImageDelete({
  item,
  open,
  onClose,
}: {
  item: MenuItemImageItem | null;
  open: boolean;
  onClose: () => void;
}) {
  const { remove } = useMenuItemImageMutate();
  return (
    <AlertDialog
      isOpen={open && Boolean(item)}
      title="Зургийн холбоос устгах уу?"
      description={item ? `${item.originalFilename} файлын холбоосыг устгана.` : ''}
      onClose={() => {
        if (!remove.isPending) onClose();
      }}
      onConfirm={() => {
        if (!item || remove.isPending) return;
        remove.mutate(item.id, {
          onSuccess: () => {
            toast.success('Зураг устгагдлаа');
            onClose();
          },
        });
      }}
    />
  );
}
