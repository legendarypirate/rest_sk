'use client';

import { toast } from '@packages/ui/components/sonner';
import { AlertDialog } from '@packages/ui/main/Alert.dialog';
import type { MenuCategoryImageItem } from '@packages/types';

import { useMenuCategoryImageMutate } from '../hooks';

export function MenuCategoryImageDelete({
  item,
  open,
  onClose,
}: {
  item: MenuCategoryImageItem | null;
  open: boolean;
  onClose: () => void;
}) {
  const { remove } = useMenuCategoryImageMutate();
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
