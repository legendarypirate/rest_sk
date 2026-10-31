'use client';

import { toast } from '@packages/ui/components/sonner';
import { AlertDialog } from '@packages/ui/main/Alert.dialog';
import type { MenuCategoryListItem } from '@packages/types';

import { useMenuCategoryMutate } from '../hooks';

export function MenuCategoryDelete({
  item,
  open,
  onClose,
}: {
  item: MenuCategoryListItem | null;
  open: boolean;
  onClose: () => void;
}) {
  const { remove } = useMenuCategoryMutate();
  return (
    <AlertDialog
      isOpen={open && Boolean(item)}
      title="Ангилал устгах уу?"
      description={item ? `${item.name} ангиллыг идэвхгүй болгоно. Дэд ангилалтай бол устгахгүй.` : ''}
      onClose={() => {
        if (!remove.isPending) onClose();
      }}
      onConfirm={() => {
        if (!item || remove.isPending) return;
        remove.mutate(item.id, {
          onSuccess: () => {
            toast.success('Ангилал устгагдлаа');
            onClose();
          },
        });
      }}
    />
  );
}
