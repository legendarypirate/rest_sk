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
import { MInput, MSelect, MSwitch } from '@packages/ui/main/MFields';
import type { RestaurantListItem } from '@packages/types';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { getRestaurant } from '@/services/restaurants/restaurants.service';

import {
  getRestaurantDefaults,
  restaurantSchema,
  toRestaurantDto,
  toRestaurantSettingDto,
  useRestaurantMutate,
  type RestaurantFormData,
} from '../hooks';
import { RECORD_STATUS_OPTIONS } from '../lib/labels';

const switches: Array<{ name: keyof RestaurantFormData; label: string }> = [
  { name: 'kioskEnabled', label: 'Киоск' },
  { name: 'kitchenEnabled', label: 'Гал тогоо' },
  { name: 'employeeMealsEnabled', label: 'Ажилтны хоол' },
  { name: 'cashPaymentsEnabled', label: 'Бэлэн' },
  { name: 'cardPaymentsEnabled', label: 'Карт' },
  { name: 'qpayEnabled', label: 'QPay' },
];

export function RestaurantForm({
  mode,
  item,
  onSuccess,
}: {
  mode: 'add' | 'edit';
  item?: RestaurantListItem;
  onSuccess?: () => void;
}) {
  const { hideDialog } = useDialog();
  const { create, update, updateSetting } = useRestaurantMutate();
  const isCreate = mode === 'add';
  const pending = create.isPending || update.isPending || updateSetting.isPending;
  const detail = useQuery({
    queryKey: ['restaurants', 'detail', item?.id],
    queryFn: () => getRestaurant(item!.id),
    enabled: !isCreate && Boolean(item?.id),
    staleTime: 0,
    refetchOnMount: 'always',
  });
  const form = useForm<RestaurantFormData>({
    resolver: zodResolver(restaurantSchema),
    defaultValues: getRestaurantDefaults(),
  });

  useEffect(() => {
    if (isCreate || !detail.data) return;
    form.reset(getRestaurantDefaults(detail.data));
  }, [detail.data, form, isCreate]);

  const onSubmit = (values: RestaurantFormData) => {
    const dto = toRestaurantDto(values);
    const setting = toRestaurantSettingDto(values);
    const request = isCreate
      ? create.mutateAsync(dto).then((saved) => updateSetting.mutateAsync({ id: saved.id, dto: setting }))
      : update.mutateAsync({ id: item!.id, dto }).then(() => updateSetting.mutateAsync({ id: item!.id, dto: setting }));
    void request.then(() => {
      toast.success(isCreate ? 'Ресторан бүртгэгдлээ' : 'Ресторан шинэчлэгдлээ');
      hideDialog();
      onSuccess?.();
    });
  };

  if (!isCreate && detail.isPending) {
    return <p className="text-sm text-muted-foreground">Уншиж байна…</p>;
  }

  if (!isCreate && detail.error) {
    return <p className="text-sm text-destructive">Ресторан уншиж чадсангүй</p>;
  }

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
            disabled={pending || (Boolean(item) && detail.isPending)}
          />
        </>
      }
    >
      <FieldGroup className="gap-4 grid w-full grid-cols-1 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="restaurant-code" data-required>Код</FieldLabel>
          <MInput id="restaurant-code" {...form.register('code')} />
          <FieldError errors={[form.formState.errors.code]} />
        </Field>
        <Field>
          <FieldLabel htmlFor="restaurant-name" data-required>Нэр</FieldLabel>
          <MInput id="restaurant-name" {...form.register('name')} />
          <FieldError errors={[form.formState.errors.name]} />
        </Field>
        <Field className="sm:col-span-2">
          <FieldLabel htmlFor="restaurant-legal" data-required>Хуулийн нэр</FieldLabel>
          <MInput id="restaurant-legal" {...form.register('legalName')} />
          <FieldError errors={[form.formState.errors.legalName]} />
        </Field>
        <Field>
          <FieldLabel htmlFor="restaurant-tax">Татварын дугаар</FieldLabel>
          <MInput id="restaurant-tax" {...form.register('taxId')} />
          <FieldError errors={[form.formState.errors.taxId]} />
        </Field>
        <Field>
          <FieldLabel htmlFor="restaurant-phone">Утас</FieldLabel>
          <MInput id="restaurant-phone" {...form.register('phone')} />
          <FieldError errors={[form.formState.errors.phone]} />
        </Field>
        <Field>
          <FieldLabel htmlFor="restaurant-email">Имэйл</FieldLabel>
          <MInput id="restaurant-email" {...form.register('email')} />
          <FieldError errors={[form.formState.errors.email]} />
        </Field>
        <Field>
          <FieldLabel htmlFor="restaurant-city">Хот</FieldLabel>
          <MInput id="restaurant-city" {...form.register('city')} />
          <FieldError errors={[form.formState.errors.city]} />
        </Field>
        <Field className="sm:col-span-2">
          <FieldLabel htmlFor="restaurant-address">Хаяг</FieldLabel>
          <MInput id="restaurant-address" {...form.register('addressLine')} />
          <FieldError errors={[form.formState.errors.addressLine]} />
        </Field>
        <Field>
          <FieldLabel htmlFor="restaurant-country" data-required>Улс</FieldLabel>
          <MInput id="restaurant-country" {...form.register('country')} />
          <FieldError errors={[form.formState.errors.country]} />
        </Field>
        <Field>
          <FieldLabel htmlFor="restaurant-currency" data-required>Валют</FieldLabel>
          <MInput id="restaurant-currency" {...form.register('currency')} />
          <FieldError errors={[form.formState.errors.currency]} />
        </Field>
        <Field>
          <FieldLabel htmlFor="restaurant-timezone" data-required>Цагийн бүс</FieldLabel>
          <MInput id="restaurant-timezone" {...form.register('timezone')} />
          <FieldError errors={[form.formState.errors.timezone]} />
        </Field>
        <Field>
          <FieldLabel htmlFor="restaurant-locale" data-required>Хэл</FieldLabel>
          <MInput id="restaurant-locale" {...form.register('locale')} />
          <FieldError errors={[form.formState.errors.locale]} />
        </Field>
        <Controller
          control={form.control}
          name="status"
          render={({ field }) => (
            <Field>
              <FieldLabel data-required>Төлөв</FieldLabel>
              <MSelect
                value={field.value}
                onValueChange={(value) => field.onChange(value ?? 'ACTIVE')}
                options={RECORD_STATUS_OPTIONS}
              />
              <FieldError errors={[form.formState.errors.status]} />
            </Field>
          )}
        />
        <Field>
          <FieldLabel htmlFor="restaurant-prefix" data-required>Захиалгын угтвар</FieldLabel>
          <MInput id="restaurant-prefix" {...form.register('orderNumberPrefix')} />
          <FieldError errors={[form.formState.errors.orderNumberPrefix]} />
        </Field>
        <Field>
          <FieldLabel htmlFor="restaurant-setting-currency" data-required>Тохиргооны валют</FieldLabel>
          <MInput id="restaurant-setting-currency" {...form.register('settingCurrency')} />
          <FieldError errors={[form.formState.errors.settingCurrency]} />
        </Field>
        {switches.map((item) => (
          <Controller
            key={item.name}
            control={form.control}
            name={item.name}
            render={({ field }) => (
              <Field>
                <FieldLabel>{item.label}</FieldLabel>
                <MSwitch checked={Boolean(field.value)} onCheckedChange={field.onChange} />
              </Field>
            )}
          />
        ))}
      </FieldGroup>
    </DialogForm>
  );
}
