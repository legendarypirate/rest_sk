'use client';

import { toast } from '@packages/ui/components/sonner';
import { AlertDialog } from '@packages/ui/main/Alert.dialog';
import type { EmployeeMealOrderItem } from '@packages/types';

import { useMealOrderMutate } from '../hooks';

export function MealOrderDelete({
  item,
  open,
  onClose,
}: {
  item: EmployeeMealOrderItem | null;
  open: boolean;
  onClose: () => void;
}) {
  const { remove } = useMealOrderMutate();
  return (
    <AlertDialog
      isOpen={open && Boolean(item)}
      title="Захиалга устгах уу?"
      description={item ? `${item.employeeName} захиалгыг устгана.` : ''}
      onClose={() => {
        if (!remove.isPending) onClose();
      }}
      onConfirm={() => {
        if (!item || remove.isPending) return;
        remove.mutate(item.id, {
          onSuccess: () => {
            toast.success('Захиалга устгагдлаа');
            onClose();
          },
        });
      }}
    />
  );
}
