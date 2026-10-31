'use client';

import { AlertDialog } from '@packages/ui/main/Alert.dialog';
import { toast } from '@packages/ui/components/sonner';
import type { MediaAssetDetail } from '@packages/types';

import { useMediaMutate } from '../hooks';

type MediaDeleteProps = {
  asset: MediaAssetDetail | null;
  open: boolean;
  onClose: () => void;
};

export function MediaDelete({ asset, open, onClose }: MediaDeleteProps) {
  const { remove } = useMediaMutate();

  return (
    <AlertDialog
      isOpen={open && Boolean(asset)}
      title="Медиа устгах уу?"
      description={
        asset
          ? `${asset.originalFilename} файлыг сангаас хасна. Цэсэнд холбогдсон зургийг устгахгүй.`
          : ''
      }
      onClose={() => {
        if (!remove.isPending) {
          onClose();
        }
      }}
      onConfirm={() => {
        if (!asset || remove.isPending) {
          return;
        }

        remove.mutate(asset.id, {
          onSuccess: () => {
            toast.success('Медиа устгагдлаа');
            onClose();
          },
        });
      }}
    />
  );
}
