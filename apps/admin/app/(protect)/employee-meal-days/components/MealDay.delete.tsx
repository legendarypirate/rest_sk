'use client';

import { toast } from '@packages/ui/components/sonner';
import { AlertDialog } from '@packages/ui/main/Alert.dialog';
import type { EmployeeMealDayItem } from '@packages/types';

import { useMealDayMutate } from '../hooks';

export function MealDayDelete({
  item,
  open,
  onClose,
}: {
  item: EmployeeMealDayItem | null;
  open: boolean;
  onClose: () => void;
}) {
  const { remove } = useMealDayMutate();
  return (
    <AlertDialog
      isOpen={open && Boolean(item)}
      title="Өдрийн хоол устгах уу?"
      description={item ? `${item.serviceDate} ${item.mealTypeName} бүртгэлийг идэвхгүй болгоно.` : ''}
      onClose={() => {
        if (!remove.isPending) onClose();
      }}
      onConfirm={() => {
        if (!item || remove.isPending) return;
        remove.mutate(item.id, {
          onSuccess: () => {
            toast.success('Өдрийн хоол устгагдлаа');
            onClose();
          },
        });
      }}
    />
  );
}
