'use client';

import { toast } from '@packages/ui/components/sonner';
import { AlertDialog } from '@packages/ui/main/Alert.dialog';
import type { EmployeeMealTypeItem } from '@packages/types';

import { useMealTypeMutate } from '../hooks';

export function MealTypeDelete({
  item,
  open,
  onClose,
}: {
  item: EmployeeMealTypeItem | null;
  open: boolean;
  onClose: () => void;
}) {
  const { remove } = useMealTypeMutate();
  return (
    <AlertDialog
      isOpen={open && Boolean(item)}
      title="Хоолны төрөл устгах уу?"
      description={item ? `${item.name} төрлийг идэвхгүй болгоно.` : ''}
      onClose={() => {
        if (!remove.isPending) onClose();
      }}
      onConfirm={() => {
        if (!item || remove.isPending) return;
        remove.mutate(item.id, {
          onSuccess: () => {
            toast.success('Төрөл устгагдлаа');
            onClose();
          },
        });
      }}
    />
  );
}
