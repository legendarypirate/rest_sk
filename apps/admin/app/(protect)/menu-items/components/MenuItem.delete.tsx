'use client';

import { toast } from '@packages/ui/components/sonner';
import { AlertDialog } from '@packages/ui/main/Alert.dialog';
import type { MenuItemListItem } from '@packages/types';

import { useMenuItemMutate } from '../hooks';

export function MenuItemDelete({
  item,
  open,
  onClose,
}: {
  item: MenuItemListItem | null;
  open: boolean;
  onClose: () => void;
}) {
  const { remove } = useMenuItemMutate();
  return (
    <AlertDialog
      isOpen={open && Boolean(item)}
      title="Хоол устгах уу?"
      description={item ? `${item.name} хоолыг идэвхгүй болгоно. Хувилбартай хоолыг устгахгүй.` : ''}
      onClose={() => {
        if (!remove.isPending) onClose();
      }}
      onConfirm={() => {
        if (!item || remove.isPending) return;
        remove.mutate(item.id, {
          onSuccess: () => {
            toast.success('Хоол устгагдлаа');
            onClose();
          },
        });
      }}
    />
  );
}
