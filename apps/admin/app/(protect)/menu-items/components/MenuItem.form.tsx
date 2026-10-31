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
import type { MenuItemListItem } from '@packages/types';
import { Controller, useForm } from 'react-hook-form';

import { listMenuCategories } from '@/services/menus/menus.service';

import { getMenuItemDefaults, menuItemSchema, toMenuItemDto, useMenuItemMutate, type MenuItemFormData } from '../hooks';
import {
  AVAILABILITY_OPTIONS,
  FOOD_TYPE_OPTIONS,
  RECORD_STATUS_OPTIONS,
} from '../lib/labels';

export function MenuItemForm({
  mode,
  item,
  onSuccess,
}: {
  mode: 'add' | 'edit';
  item?: MenuItemListItem;
  onSuccess?: () => void;
}) {
  const { hideDialog } = useDialog();
  const { create, update } = useMenuItemMutate();
  const isCreate = mode === 'add';
  const pending = create.isPending || update.isPending;
  const form = useForm<MenuItemFormData>({
    resolver: zodResolver(menuItemSchema),
    defaultValues: getMenuItemDefaults(item),
  });
  const categories = useQuery({
    queryKey: ['menu-categories', 'options'],
    queryFn: () => listMenuCategories({ page: 1, limit: '*' }),
  });

  const onSubmit = (values: MenuItemFormData) => {
    const dto = toMenuItemDto(values);
    const request = isCreate ? create.mutateAsync(dto) : update.mutateAsync({ id: item!.id, dto });
    void request.then(() => {
      toast.success(isCreate ? 'Хоол бүртгэгдлээ' : 'Хоол шинэчлэгдлээ');
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
          name="categoryId"
          render={({ field }) => (
            <Field className="sm:col-span-2">
              <FieldLabel data-required>Ангилал</FieldLabel>
              <MSelect
                value={field.value}
                onValueChange={(value) => field.onChange(value ?? '')}
                placeholder="Ангилал сонгоно уу"
                options={(categories.data?.items ?? []).map((row) => ({ value: row.id, label: row.name }))}
              />
              <FieldError errors={[form.formState.errors.categoryId]} />
            </Field>
          )}
        />
        <Field>
          <FieldLabel htmlFor="item-sku" data-required>Код</FieldLabel>
          <MInput id="item-sku" {...form.register('sku')} />
          <FieldError errors={[form.formState.errors.sku]} />
        </Field>
        <Field>
          <FieldLabel htmlFor="item-name" data-required>Нэр</FieldLabel>
          <MInput id="item-name" {...form.register('name')} />
          <FieldError errors={[form.formState.errors.name]} />
        </Field>
        <Controller
          control={form.control}
          name="foodType"
          render={({ field }) => (
            <Field>
              <FieldLabel data-required>Төрөл</FieldLabel>
              <MSelect
                value={field.value}
                onValueChange={(value) => field.onChange(value ?? 'ORDERED')}
                options={FOOD_TYPE_OPTIONS}
              />
              <FieldError errors={[form.formState.errors.foodType]} />
            </Field>
          )}
        />
        <Field>
          <FieldLabel htmlFor="item-price" data-required>Үнэ</FieldLabel>
          <MInput id="item-price" inputMode="decimal" {...form.register('price')} />
          <FieldError errors={[form.formState.errors.price]} />
        </Field>
        <Field className="sm:col-span-2">
          <FieldLabel htmlFor="item-description">Тайлбар</FieldLabel>
          <MTextarea id="item-description" {...form.register('description')} />
          <FieldError errors={[form.formState.errors.description]} />
        </Field>
        <Field>
          <FieldLabel htmlFor="item-sort">Эрэмбэ</FieldLabel>
          <MInput id="item-sort" type="number" {...form.register('sortOrder', { valueAsNumber: true })} />
          <FieldError errors={[form.formState.errors.sortOrder]} />
        </Field>
        <Controller
          control={form.control}
          name="status"
          render={({ field }) => (
            <Field>
              <FieldLabel data-required>Төлөв</FieldLabel>
              <MSelect value={field.value} onValueChange={(value) => field.onChange(value ?? 'DRAFT')} options={RECORD_STATUS_OPTIONS} />
              <FieldError errors={[form.formState.errors.status]} />
            </Field>
          )}
        />
        <Controller
          control={form.control}
          name="availability"
          render={({ field }) => (
            <Field>
              <FieldLabel data-required>Бэлэн байдал</FieldLabel>
              <MSelect value={field.value} onValueChange={(value) => field.onChange(value ?? 'AVAILABLE')} options={AVAILABILITY_OPTIONS} />
              <FieldError errors={[form.formState.errors.availability]} />
            </Field>
          )}
        />
      </FieldGroup>
    </DialogForm>
  );
}
