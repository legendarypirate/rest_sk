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
import { MCheckbox, MInput, MSelect, MSwitch } from '@packages/ui/main/MFields';
import { TimePicker } from '@packages/ui/main/MTimepicker';
import type { EmployeeOrderScheduleItem } from '@packages/types';
import { Controller, useForm } from 'react-hook-form';

import { listEmployeeMealTypes } from '@/services/employee-meals/employee-meals.service';

import {
  getScheduleDefaults,
  scheduleSchema,
  useScheduleMutate,
  type ScheduleFormData,
} from '../hooks';
import { WEEKDAYS } from '../lib/labels';

export function ScheduleForm({
  mode,
  item,
}: {
  mode: 'add' | 'edit';
  item?: EmployeeOrderScheduleItem;
}) {
  const { hideDialog } = useDialog();
  const { create, update } = useScheduleMutate();
  const isCreate = mode === 'add';
  const pending = create.isPending || update.isPending;
  const types = useQuery({
    queryKey: ['employee-meal-types', 'options'],
    queryFn: () => listEmployeeMealTypes({ page: 1, limit: 50 }),
  });
  const form = useForm<ScheduleFormData>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: getScheduleDefaults(item),
  });

  const onSubmit = (values: ScheduleFormData) => {
    const dto = {
      ...values,
      timezone: 'Asia/Ulaanbaatar',
    };
    const request = isCreate
      ? create.mutateAsync(dto)
      : update.mutateAsync({ id: item!.id, dto });
    void request.then(() => {
      toast.success(isCreate ? 'Цаг бүртгэгдлээ' : 'Цаг шинэчлэгдлээ');
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
              <FieldLabel data-required>Хоолны төрөл</FieldLabel>
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
        <Field>
          <FieldLabel htmlFor="schedule-name" data-required>Нэр</FieldLabel>
          <MInput id="schedule-name" {...form.register('name')} />
          <FieldError errors={[form.formState.errors.name]} />
        </Field>
        <div className="gap-3 grid grid-cols-2">
          <Controller
            control={form.control}
            name="opensAt"
            render={({ field }) => (
              <Field>
                <FieldLabel data-required>Хоолны цаг</FieldLabel>
                <TimePicker
                  value={field.value}
                  onChange={(time) => field.onChange(time)}
                  className="h-8 w-full"
                  placeholder="Хоолны цаг"
                />
                <FieldError errors={[form.formState.errors.opensAt]} />
              </Field>
            )}
          />
          <Controller
            control={form.control}
            name="closesAt"
            render={({ field }) => (
              <Field>
                <FieldLabel data-required>Дуусах цаг</FieldLabel>
                <TimePicker
                  value={field.value}
                  onChange={(time) => field.onChange(time)}
                  className="h-8 w-full"
                  placeholder="Дуусах цаг"
                />
                <FieldError errors={[form.formState.errors.closesAt]} />
              </Field>
            )}
          />
        </div>
        <Controller
          control={form.control}
          name="weekdays"
          render={({ field }) => (
            <Field>
              <FieldLabel data-required>Гараг</FieldLabel>
              <div className="gap-2 flex flex-wrap">
                {WEEKDAYS.map((day) => (
                  <MCheckbox
                    key={day.value}
                    checked={field.value.includes(day.value)}
                    label={day.label}
                    onCheckedChange={(checked) => {
                      field.onChange(
                        checked
                          ? [...field.value, day.value]
                          : field.value.filter((value) => value !== day.value),
                      );
                    }}
                  />
                ))}
              </div>
              <FieldError errors={[form.formState.errors.weekdays]} />
            </Field>
          )}
        />
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
