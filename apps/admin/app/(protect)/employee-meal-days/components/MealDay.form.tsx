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
import { DatePicker } from '@packages/ui/main/MDatepicker';
import { MSelect } from '@packages/ui/main/MFields';
import { EMPLOYEE_MEAL_DAY_STATUSES, type EmployeeMealDayItem } from '@packages/types';
import { Controller, useForm } from 'react-hook-form';

import { listEmployeeMealTypes } from '@/services/employee-meals/employee-meals.service';
import { listMenuItems } from '@/services/menus/menus.service';

import {
  getMealDayDefaults,
  mealDaySchema,
  useMealDayMutate,
  type MealDayFormData,
} from '../hooks';
import { MEAL_DAY_STATUS_LABELS } from '../lib/labels';

function parseDateOnly(value: string) {
  const [year, month, day] = value.split('-').map(Number);
  if (!year || !month || !day) return undefined;
  return new Date(year, month - 1, day);
}

function formatDateOnly(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

export function MealDayForm({
  mode,
  item,
}: {
  mode: 'add' | 'edit';
  item?: EmployeeMealDayItem;
}) {
  const { hideDialog } = useDialog();
  const { create, update } = useMealDayMutate();
  const isCreate = mode === 'add';
  const pending = create.isPending || update.isPending;
  const types = useQuery({
    queryKey: ['employee-meal-types', 'options'],
    queryFn: () => listEmployeeMealTypes({ page: 1, limit: 50 }),
  });
  const foods = useQuery({
    queryKey: ['menu-items', 'e-food'],
    queryFn: () => listMenuItems({ page: 1, limit: '*', foodType: 'E_FOOD' }),
  });
  const form = useForm<MealDayFormData>({
    resolver: zodResolver(mealDaySchema),
    defaultValues: getMealDayDefaults(item),
  });
  const menuItemId = form.watch('menuItemId');
  const selectedFood = (foods.data?.items ?? []).find((row) => row.id === menuItemId);

  const onSubmit = (values: MealDayFormData) => {
    const request = isCreate
      ? create.mutateAsync(values)
      : update.mutateAsync({ id: item!.id, dto: values });
    void request.then(() => {
      toast.success(isCreate ? 'Хоол бүртгэгдлээ' : 'Хоол шинэчлэгдлээ');
      hideDialog();
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
          name="mealTypeId"
          render={({ field }) => (
            <Field>
              <FieldLabel data-required>Төрөл</FieldLabel>
              <MSelect
                value={field.value}
                onValueChange={(value) => field.onChange(value ?? '')}
                options={(types.data?.items ?? []).map((type) => ({
                  value: type.id,
                  label: type.name,
                }))}
              />
              <FieldError errors={[form.formState.errors.mealTypeId]} />
            </Field>
          )}
        />
        <Controller
          control={form.control}
          name="serviceDate"
          render={({ field }) => (
            <Field>
              <FieldLabel data-required>Огноо</FieldLabel>
              <DatePicker
                id="meal-day-date"
                value={field.value ? parseDateOnly(field.value) : undefined}
                onChange={(date) => field.onChange(date ? formatDateOnly(date) : '')}
                className="h-8 w-full"
                placeholder="Огноо сонгоно уу"
              />
              <FieldError errors={[form.formState.errors.serviceDate]} />
            </Field>
          )}
        />
        <Controller
          control={form.control}
          name="menuItemId"
          render={({ field }) => (
            <Field>
              <FieldLabel data-required>А-хоол</FieldLabel>
              <MSelect
                value={field.value}
                onValueChange={(value) => field.onChange(value ?? '')}
                placeholder="А-хоол сонгоно уу"
                options={(foods.data?.items ?? []).map((row) => ({
                  value: row.id,
                  label: `${row.categoryName} / ${row.name}`,
                }))}
              />
              {selectedFood ? (
                <p className="text-xs text-muted-foreground">Ангилал: {selectedFood.categoryName}</p>
              ) : null}
              <FieldError errors={[form.formState.errors.menuItemId]} />
            </Field>
          )}
        />
        <Controller
          control={form.control}
          name="status"
          render={({ field }) => (
            <Field>
              <FieldLabel>Төлөв</FieldLabel>
              <MSelect
                value={field.value}
                onValueChange={(value) => field.onChange(value ?? 'SCHEDULED')}
                options={EMPLOYEE_MEAL_DAY_STATUSES.map((status) => ({
                  value: status,
                  label: MEAL_DAY_STATUS_LABELS[status],
                }))}
              />
            </Field>
          )}
        />
      </FieldGroup>
    </DialogForm>
  );
}
