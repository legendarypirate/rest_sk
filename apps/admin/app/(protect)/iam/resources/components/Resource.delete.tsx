'use client';

import { AlertDialog } from '@packages/ui/main/Alert.dialog';
import { toast } from '@packages/ui/components/sonner';
import type { ResourceListItem } from '@packages/types';

import { useResourceMutate } from '../hooks';

type ResourceDeleteProps = {
  resource: ResourceListItem | null;
  open: boolean;
  onClose: () => void;
};

export function ResourceDelete({
  resource,
  open,
  onClose,
}: ResourceDeleteProps) {
  const { remove } = useResourceMutate();

  return (
    <AlertDialog
      isOpen={open && Boolean(resource)}
      title="Цэс устгах уу?"
      description={
        resource
          ? `${resource.name} цэсийг устгаснаар түүний зөвшөөрлүүд ч устана.`
          : ''
      }
      onClose={() => {
        if (!remove.isPending) {
          onClose();
        }
      }}
      onConfirm={() => {
        if (!resource || remove.isPending) {
          return;
        }

        remove.mutate(resource.id, {
          onSuccess: () => {
            toast.success('Цэсийг устгалаа.');
            onClose();
          },
        });
      }}
    />
  );
}
