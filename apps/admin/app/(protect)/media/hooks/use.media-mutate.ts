'use client';

import { toast } from '@packages/ui/components/sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { getApiErrorMessage } from '@/lib/api-error';
import {
  deleteMedia,
  discardMedia,
  updateMedia,
  uploadMedia,
} from '@/services/media/media.service';
import type { UpdateMediaDto } from '@/types/media/media.dto';

import { mediaQueryKey } from './use.media';

export function useMediaMutate() {
  const queryClient = useQueryClient();

  function invalidate() {
    void queryClient.invalidateQueries({ queryKey: mediaQueryKey });
  }

  const upload = useMutation({
    mutationFn: (input: { file: File; altText?: string }) =>
      uploadMedia(input.file, input.altText),
    onSuccess: invalidate,
  });

  const discard = useMutation({
    mutationFn: (id: string) => discardMedia(id),
  });

  const update = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateMediaDto }) =>
      updateMedia(id, dto),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteMedia(id),
    onSuccess: invalidate,
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });

  return { upload, discard, update, remove };
}
