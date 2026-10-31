'use client';

import { zodResolver } from '@hookform/resolvers/zod';
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
import { MInput, MSelect, MSwitch } from '@packages/ui/main/MFields';
import type { EmployeeMealTypeItem } from '@packages/types';
import { Controller, useForm } from 'react-hook-form';

import {
  getMealTypeDefaults,
  mealTypeSchema,
  useMealTypeMutate,
  type MealTypeFormData,
} from '../hooks';
import { MEAL_KIND_OPTIONS } from '../lib/labels';

export function MealTypeForm({
  mode,
  item,
  onSuccess,
}: {
  mode: 'add' | 'edit';
  item?: EmployeeMealTypeItem;
  onSuccess?: () => void;
}) {
  const { hideDialog } = useDialog();
  const { create, update } = useMealTypeMutate();
  const isCreate = mode === 'add';
  const pending = create.isPending || update.isPending;
  const form = useForm<MealTypeFormData>({
    resolver: zodResolver(mealTypeSchema),
    defaultValues: getMealTypeDefaults(item),
  });

  const onSubmit = (values: MealTypeFormData) => {
    const request = isCreate
      ? create.mutateAsync(values)
      : update.mutateAsync({ id: item!.id, dto: values });
    void request.then(() => {
      toast.success(isCreate ? 'Төрөл бүртгэгдлээ' : 'Төрөл шинэчлэгдлээ');
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
      <FieldGroup className="gap-4 grid w-full grid-cols-1">
        <Controller
          control={form.control}
          name="kind"
          render={({ field }) => (
            <Field>
              <FieldLabel data-required>Төрөл</FieldLabel>
              <MSelect
                value={field.value}
                onValueChange={(value) => field.onChange(value ?? 'LUNCH')}
                options={MEAL_KIND_OPTIONS.map((option) => ({
                  value: option.value,
                  label: option.label,
                }))}
              />
              <FieldError errors={[form.formState.errors.kind]} />
            </Field>
          )}
        />
        <Field>
          <FieldLabel htmlFor="meal-type-code" data-required>Код</FieldLabel>
          <MInput id="meal-type-code" {...form.register('code')} />
          <FieldError errors={[form.formState.errors.code]} />
        </Field>
        <Field>
          <FieldLabel htmlFor="meal-type-name" data-required>Нэр</FieldLabel>
          <MInput id="meal-type-name" {...form.register('name')} />
          <FieldError errors={[form.formState.errors.name]} />
        </Field>
        <Field>
          <FieldLabel htmlFor="meal-type-sort">Эрэмбэ</FieldLabel>
          <MInput id="meal-type-sort" type="number" {...form.register('sortOrder', { valueAsNumber: true })} />
          <FieldError errors={[form.formState.errors.sortOrder]} />
        </Field>
        <Controller
          control={form.control}
          name="isEnabled"
          render={({ field }) => (
            <Field>
              <FieldLabel>Идэвхтэй</FieldLabel>
              <MSwitch checked={field.value} onCheckedChange={field.onChange} />
            </Field>
          )}
        />
      </FieldGroup>
    </DialogForm>
  );
}
