'use client';

import { AlertDialog } from '@packages/ui/main/Alert.dialog';
import { toast } from '@packages/ui/components/sonner';

import type { IntegrationDetail } from '@packages/types';

import { useIntegrationMutate } from '../hooks';

type IntegrationDeleteProps = {
  item: IntegrationDetail | null;
  open: boolean;
  onClose: () => void;
};

export function IntegrationDelete({ item, open, onClose }: IntegrationDeleteProps) {
  const { remove } = useIntegrationMutate();

  return (
    <AlertDialog
      isOpen={open && Boolean(item)}
      title="Интеграци устгах уу?"
      description={item ? `${item.name} бүртгэлийг идэвхгүй болгоно.` : ''}
      onClose={() => {
        if (!remove.isPending) {
          onClose();
        }
      }}
      onConfirm={() => {
        if (!item || remove.isPending) {
          return;
        }

        remove.mutate(item.id, {
          onSuccess: () => {
            toast.success('Интеграци устгагдлаа');
            onClose();
          },
        });
      }}
    />
  );
}
