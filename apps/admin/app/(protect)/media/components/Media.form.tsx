'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@packages/ui/components/field';
import { toast } from '@packages/ui/components/sonner';
import { CancelButton, DeleteButton, SaveButton } from '@packages/ui/main/MButtons';
import { useDialog } from '@packages/ui/main/MDialog.context';
import { DialogForm } from '@packages/ui/main/MDialog';
import { MInput } from '@packages/ui/main/MFields';
import { MImageUpload } from '@packages/ui/main/MImage.upload';
import type { MediaAssetDetail } from '@packages/types';
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';

import { getApiErrorMessage } from '@/lib/api-error';
import { getMedia } from '@/services/media/media.service';

import {
  getUpdateMediaDefaults,
  mediaQueryKey,
  updateMediaSchema,
  useMediaMutate,
  type UpdateMediaFormData,
} from '../hooks';

const IMAGE_ACCEPT = 'image/jpeg,image/png,image/webp,image/avif';

type DraftImage = {
  url: string;
  altText: string;
};

type MediaFormProps = {
  mode: 'add' | 'edit';
  asset?: MediaAssetDetail;
  onSuccess?: () => void;
};

export function MediaForm({ mode, asset, onSuccess }: MediaFormProps) {
  const { hideDialog } = useDialog();
  const { upload, update } = useMediaMutate();
  const isCreate = mode === 'add';
  const [drafts, setDrafts] = useState<DraftImage[]>([]);
  const filesByUrlRef = useRef(new Map<string, File>());

  useEffect(() => {
    const filesByUrl = filesByUrlRef.current;
    return () => {
      for (const url of filesByUrl.keys()) URL.revokeObjectURL(url);
      filesByUrl.clear();
    };
  }, []);

  const assetQuery = useQuery({
    queryKey: [...mediaQueryKey, 'detail', asset?.id],
    queryFn: () => getMedia(asset!.id),
    enabled: !isCreate && Boolean(asset?.id),
  });
  const detail = assetQuery.data;
  const isDeleted = Boolean(detail?.deletedAt);
  const form = useForm<UpdateMediaFormData>({
    resolver: zodResolver(updateMediaSchema),
    defaultValues: getUpdateMediaDefaults(asset),
    mode: 'onTouched',
  });
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;
  const isLoading = upload.isPending || update.isPending;
  const disabled = isLoading || isDeleted;

  useEffect(() => {
    if (isCreate || !detail) return;
    form.reset(getUpdateMediaDefaults(detail));
  }, [detail, form, isCreate]);

  const onSubmit = async (data: UpdateMediaFormData) => {
    try {
      if (isCreate) {
        if (drafts.length === 0) {
          toast.error('Зураг сонгоно уу');
          return;
        }
        for (const draft of drafts) {
          const file = filesByUrlRef.current.get(draft.url);
          if (!file) {
            toast.error('Зураг сонгоно уу');
            return;
          }
          await upload.mutateAsync({
            file,
            altText: draft.altText.trim() || undefined,
          });
        }
        toast.success(drafts.length > 1 ? 'Зургууд хадгалагдлаа' : 'Зураг амжилттай хадгалагдлаа');
      } else {
        const targetId = detail?.id;
        if (!targetId) {
          toast.error('Зураг сонгоно уу');
          return;
        }
        await update.mutateAsync({ id: targetId, dto: { altText: data.altText || null } });
        toast.success('Медиа шинэчлэгдлээ');
      }
      hideDialog();
      onSuccess?.();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  if (!isCreate && assetQuery.isPending) {
    return <p className="text-sm text-muted-foreground">Уншиж байна…</p>;
  }

  if (!isCreate && assetQuery.error) {
    return <p className="text-sm text-destructive">{getApiErrorMessage(assetQuery.error)}</p>;
  }

  return (
    <DialogForm
      onSubmit={(event) => {
        void handleSubmit(onSubmit)(event);
      }}
      noValidate
      actions={
        <>
          <CancelButton text="Болих" icon={false} tooltip={false} onClick={hideDialog} disabled={isLoading} />
          <SaveButton
            type="submit"
            icon={false}
            tooltip={false}
            text={isLoading ? 'Хадгалж байна…' : 'Хадгалах'}
            disabled={disabled || (isCreate && drafts.length === 0)}
          />
        </>
      }
    >
      <FieldGroup className="gap-4 grid w-full grid-cols-1">
        {isCreate ? (
          <>
            <MImageUpload
              required
              label="Зураг"
              accept={IMAGE_ACCEPT}
              maxSizeMB={10}
              className="max-w-sm"
              value=""
              onChange={() => undefined}
              onUpload={async (file) => {
                const url = URL.createObjectURL(file);
                filesByUrlRef.current.set(url, file);
                setDrafts((current) => [...current, { url, altText: '' }]);
                return url;
              }}
            />
            {drafts.length > 0 ? (
              <div className="gap-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
                {drafts.map((draft, index) => (
                  <div key={draft.url} className="space-y-2">
                    <div className="relative h-50 overflow-hidden rounded-md ring-1 ring-border">
                      <Image src={draft.url} alt="" fill unoptimized sizes="100px" className="object-cover" />
                      <DeleteButton
                        text={false}
                        tooltip="Цэвэрлэх"
                        className="absolute right-1 top-1"
                        onClick={() => {
                          URL.revokeObjectURL(draft.url);
                          filesByUrlRef.current.delete(draft.url);
                          setDrafts((current) => current.filter((item) => item.url !== draft.url));
                        }}
                      />
                    </div>
                    <Field>
                      <FieldLabel htmlFor={`media-alt-${index}`}>Тайлбар</FieldLabel>
                      <MInput
                        id={`media-alt-${index}`}
                        autoComplete="off"
                        maxLength={300}
                        disabled={disabled}
                        value={draft.altText}
                        onChange={(event) => {
                          const altText = event.target.value;
                          setDrafts((current) =>
                            current.map((item) => (item.url === draft.url ? { ...item, altText } : item)),
                          );
                        }}
                      />
                    </Field>
                  </div>
                ))}
              </div>
            ) : null}
          </>
        ) : (
          <>
            <MImageUpload
              label="Зураг"
              accept={IMAGE_ACCEPT}
              maxSizeMB={10}
              aspect="16 / 9"
              disabled
              showRemove={false}
              value={detail?.storageUrl}
              onChange={() => undefined}
            />
            <Field>
              <FieldLabel htmlFor="media-alt">Тайлбар</FieldLabel>
              <MInput
                id="media-alt"
                autoComplete="off"
                maxLength={300}
                disabled={disabled}
                aria-invalid={Boolean(errors.altText)}
                {...register('altText')}
              />
              <FieldError errors={[errors.altText]} />
            </Field>
          </>
        )}
      </FieldGroup>
    </DialogForm>
  );
}
