'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@packages/ui/components/field';
import { toast } from '@packages/ui/components/sonner';
import { CancelButton, SaveButton } from '@packages/ui/main/MButtons';
import { DialogForm } from '@packages/ui/main/MDialog';
import { useDialog } from '@packages/ui/main/MDialog.context';
import { MInput, MSelect, MTextarea } from '@packages/ui/main/MFields';
import type { MenuCategoryListItem } from '@packages/types';
import { Controller, useForm } from 'react-hook-form';

import { listMenuCategories } from '@/services/menus/menus.service';

import {
  getMenuCategoryDefaults,
  menuCategorySchema,
  toMenuCategoryDto,
  useMenuCategoryMutate,
  type MenuCategoryFormData,
} from '../hooks';
import { AVAILABILITY_OPTIONS, RECORD_STATUS_OPTIONS } from '../lib/labels';

export function MenuCategoryForm({
  mode,
  item,
  onSuccess,
}: {
  mode: 'add' | 'edit';
  item?: MenuCategoryListItem;
  onSuccess?: () => void;
}) {
  const { hideDialog } = useDialog();
  const { create, update } = useMenuCategoryMutate();
  const isCreate = mode === 'add';
  const pending = create.isPending || update.isPending;
  const form = useForm<MenuCategoryFormData>({
    resolver: zodResolver(menuCategorySchema),
    defaultValues: getMenuCategoryDefaults(item),
  });
  const parents = useQuery({
    queryKey: ['menu-categories', 'options'],
    queryFn: () => listMenuCategories({ page: 1, limit: '*' }),
  });
  const parentOptions = (parents.data?.items ?? [])
    .filter((row) => row.id !== item?.id)
    .map((row) => ({ value: row.id, label: row.name }));

  const onSubmit = (values: MenuCategoryFormData) => {
    const dto = toMenuCategoryDto(values);
    const request = isCreate
      ? create.mutateAsync(dto)
      : update.mutateAsync({ id: item!.id, dto });
    void request.then(() => {
      toast.success(isCreate ? 'Ангилал бүртгэгдлээ' : 'Ангилал шинэчлэгдлээ');
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
          <SaveButton
            type="submit"
            icon={false}
            tooltip={false}
            text={pending ? 'Хадгалж байна…' : 'Хадгалах'}
            disabled={pending}
          />
        </>
      }
    >
      <FieldGroup className="gap-4 grid w-full grid-cols-1 sm:grid-cols-2">
        <Controller
          control={form.control}
          name="parentId"
          render={({ field }) => (
            <Field className="sm:col-span-2">
              <FieldLabel>Эцэг ангилал</FieldLabel>
              <MSelect
                value={field.value}
                onValueChange={(value) => field.onChange(value ?? '')}
                placeholder="Эцэггүй"
                options={[{ value: '', label: 'Эцэггүй' }, ...parentOptions]}
              />
              <FieldError errors={[form.formState.errors.parentId]} />
            </Field>
          )}
        />
        <Field>
          <FieldLabel htmlFor="category-code" data-required>Код</FieldLabel>
          <MInput id="category-code" {...form.register('code')} />
          <FieldError errors={[form.formState.errors.code]} />
        </Field>
        <Field>
          <FieldLabel htmlFor="category-name" data-required>Нэр</FieldLabel>
          <MInput id="category-name" {...form.register('name')} />
          <FieldError errors={[form.formState.errors.name]} />
        </Field>
        <Field className="sm:col-span-2">
          <FieldLabel htmlFor="category-description">Тайлбар</FieldLabel>
          <MTextarea id="category-description" {...form.register('description')} />
          <FieldError errors={[form.formState.errors.description]} />
        </Field>
        <Field>
          <FieldLabel htmlFor="category-sort">Эрэмбэ</FieldLabel>
          <MInput
            id="category-sort"
            type="number"
            {...form.register('sortOrder', { valueAsNumber: true })}
          />
          <FieldError errors={[form.formState.errors.sortOrder]} />
        </Field>
        <Controller
          control={form.control}
          name="status"
          render={({ field }) => (
            <Field>
              <FieldLabel data-required>Төлөв</FieldLabel>
              <MSelect
                value={field.value}
                onValueChange={(value) => field.onChange(value ?? 'DRAFT')}
                options={RECORD_STATUS_OPTIONS}
              />
              <FieldError errors={[form.formState.errors.status]} />
            </Field>
          )}
        />
        <Controller
          control={form.control}
          name="availability"
          render={({ field }) => (
            <Field className="sm:col-span-2">
              <FieldLabel data-required>Бэлэн байдал</FieldLabel>
              <MSelect
                value={field.value}
                onValueChange={(value) => field.onChange(value ?? 'AVAILABLE')}
                options={AVAILABILITY_OPTIONS}
              />
              <FieldError errors={[form.formState.errors.availability]} />
            </Field>
          )}
        />
      </FieldGroup>
    </DialogForm>
  );
}
