'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { Field, FieldError, FieldGroup, FieldLabel } from '@packages/ui/components/field';
import { toast } from '@packages/ui/components/sonner';
import { CancelButton, SaveButton } from '@packages/ui/main/MButtons';
import { MDatalist } from '@packages/ui/main/MData.list';
import { DialogForm } from '@packages/ui/main/MDialog';
import { useDialog } from '@packages/ui/main/MDialog.context';
import { MInput, MSelect, MSwitch } from '@packages/ui/main/MFields';
import type { MenuCategoryImageItem } from '@packages/types';
import { Controller, useForm } from 'react-hook-form';

import { listMedia } from '@/services/media/media.service';
import { listMenuCategories } from '@/services/menus/menus.service';

import {
  getMenuCategoryImageDefaults,
  menuCategoryImageSchema,
  useMenuCategoryImageMutate,
  type MenuCategoryImageFormData,
} from '../hooks';

export function MenuCategoryImageForm({
  mode,
  item,
  onSuccess,
}: {
  mode: 'add' | 'edit';
  item?: MenuCategoryImageItem;
  onSuccess?: () => void;
}) {
  const { hideDialog } = useDialog();
  const { create, update } = useMenuCategoryImageMutate();
  const isCreate = mode === 'add';
  const pending = create.isPending || update.isPending;
  const form = useForm<MenuCategoryImageFormData>({
    resolver: zodResolver(menuCategoryImageSchema),
    defaultValues: getMenuCategoryImageDefaults(item),
  });
  const categories = useQuery({
    queryKey: ['menu-categories', 'options'],
    queryFn: () => listMenuCategories({ page: 1, limit: '*' }),
  });
  const media = useQuery({
    queryKey: ['media', 'picker'],
    queryFn: () => listMedia({ page: 1, limit: '*', status: 'STORED' }),
  });
  const mediaOptions = (media.data?.items ?? []).map((asset) => ({
    value: asset.id,
    label: asset.altText || asset.originalFilename,
    image: asset.storageUrl || asset.thumbnailUrl || undefined,
    description: asset.originalFilename,
  }));

  const onSubmit = (values: MenuCategoryImageFormData) => {
    const request = isCreate
      ? create.mutateAsync({
          menuCategoryId: values.menuCategoryId,
          mediaAssetIds: [values.mediaAssetId],
          sortOrder: values.sortOrder,
          firstIsPrimary: values.isPrimary,
          altText: values.altText || null,
        })
      : update.mutateAsync({
          id: item!.id,
          dto: {
            menuCategoryId: values.menuCategoryId,
            mediaAssetId: values.mediaAssetId,
            sortOrder: values.sortOrder,
            isPrimary: values.isPrimary,
            altText: values.altText || null,
          },
        });
    void request.then(() => {
      toast.success(isCreate ? 'Зураг холбогдлоо' : 'Зураг шинэчлэгдлээ');
      hideDialog();
      onSuccess?.();
    });
  };

  return (
    <DialogForm
      noValidate
      onSubmit={form.handleSubmit(onSubmit)}
      actions={
        <>
          <CancelButton text="Болих" icon={false} tooltip={false} onClick={hideDialog} />
          <SaveButton type="submit" icon={false} tooltip={false} text={pending ? 'Хадгалж байна…' : 'Хадгалах'} disabled={pending} />
        </>
      }
    >
      <FieldGroup className="gap-4 grid w-full grid-cols-1 sm:grid-cols-2">
        <Controller
          control={form.control}
          name="menuCategoryId"
          render={({ field }) => (
            <Field className="sm:col-span-2">
              <FieldLabel data-required>Ангилал</FieldLabel>
              <MSelect
                value={field.value}
                onValueChange={(value) => field.onChange(value ?? '')}
                placeholder="Ангилал сонгоно уу"
                options={(categories.data?.items ?? []).map((row) => ({ value: row.id, label: row.name }))}
              />
              <FieldError errors={[form.formState.errors.menuCategoryId]} />
            </Field>
          )}
        />
        <Controller
          control={form.control}
          name="mediaAssetId"
          render={({ field }) => (
            <Field className="sm:col-span-2">
              <FieldLabel data-required>Зураг</FieldLabel>
              <MDatalist
                value={field.value}
                onValueChange={field.onChange}
                options={mediaOptions}
                placeholder={media.isPending ? 'Уншиж байна…' : 'Зураг сонгоно уу'}
                searchPlaceholder="Зураг хайх…"
                emptyText="Медиа сан хоосон байна"
                disabled={pending || media.isPending}
              />
              <FieldError errors={[form.formState.errors.mediaAssetId]} />
            </Field>
          )}
        />
        <Field>
          <FieldLabel htmlFor="category-image-alt">Тайлбар</FieldLabel>
          <MInput id="category-image-alt" {...form.register('altText')} />
          <FieldError errors={[form.formState.errors.altText]} />
        </Field>
        <Field>
          <FieldLabel htmlFor="category-image-sort">Эрэмбэ</FieldLabel>
          <MInput id="category-image-sort" type="number" {...form.register('sortOrder', { valueAsNumber: true })} />
          <FieldError errors={[form.formState.errors.sortOrder]} />
        </Field>
        <Controller
          control={form.control}
          name="isPrimary"
          render={({ field }) => (
            <Field>
              <FieldLabel>Үндсэн зураг</FieldLabel>
              <MSwitch checked={field.value} onCheckedChange={field.onChange} />
            </Field>
          )}
        />
      </FieldGroup>
    </DialogForm>
  );
}
