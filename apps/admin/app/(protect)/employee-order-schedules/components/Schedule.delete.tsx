'use client';

import { toast } from '@packages/ui/components/sonner';
import { AlertDialog } from '@packages/ui/main/Alert.dialog';
import type { EmployeeOrderScheduleItem } from '@packages/types';

import { useScheduleMutate } from '../hooks';

export function ScheduleDelete({
  item,
  open,
  onClose,
}: {
  item: EmployeeOrderScheduleItem | null;
  open: boolean;
  onClose: () => void;
}) {
  const { remove } = useScheduleMutate();
  return (
    <AlertDialog
      isOpen={open && Boolean(item)}
      title="Захиалгын цаг устгах уу?"
      description={item ? `${item.name} бүртгэлийг идэвхгүй болгоно.` : ''}
      onClose={() => {
        if (!remove.isPending) onClose();
      }}
      onConfirm={() => {
        if (!item || remove.isPending) return;
        remove.mutate(item.id, {
          onSuccess: () => {
            toast.success('Цаг устгагдлаа');
            onClose();
          },
        });
      }}
    />
  );
}
