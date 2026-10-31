'use client';

import { toast } from '@packages/ui/components/sonner';
import { AlertDialog } from '@packages/ui/main/Alert.dialog';
import type { RestaurantListItem } from '@packages/types';

import { useRestaurantMutate } from '../hooks';

export function RestaurantDelete({
  item,
  open,
  onClose,
}: {
  item: RestaurantListItem | null;
  open: boolean;
  onClose: () => void;
}) {
  const { remove } = useRestaurantMutate();
  return (
    <AlertDialog
      isOpen={open && Boolean(item)}
      title="Ресторан устгах уу?"
      description={item ? `${item.name} рестораныг идэвхгүй болгоно.` : ''}
      onClose={() => {
        if (!remove.isPending) onClose();
      }}
      onConfirm={() => {
        if (!item || remove.isPending) return;
        remove.mutate(item.id, {
          onSuccess: () => {
            toast.success('Ресторан устгагдлаа');
            onClose();
          },
        });
      }}
    />
  );
}
