import { RECORD_STATUSES, type RecordStatus, type RestaurantDetail } from '@packages/types';
import { z } from 'zod';

export const restaurantSchema = z.object({
  code: z.string().trim().min(1, 'Код оруулна уу').max(32),
  name: z.string().trim().min(1, 'Нэр оруулна уу').max(200),
  legalName: z.string().trim().min(1, 'Хуулийн нэр оруулна уу').max(200),
  taxId: z.string().trim().max(32),
  phone: z.string().trim().max(32),
  email: z.string().trim().max(320).refine((value) => !value || z.email().safeParse(value).success, 'Имэйл буруу'),
  country: z.string().trim().regex(/^[A-Z]{2}$/, 'Улс 2 үсэг'),
  city: z.string().trim().max(100),
  addressLine: z.string().trim().max(300),
  timezone: z.string().trim().min(1).max(64),
  locale: z.string().trim().min(1).max(16),
  currency: z.string().trim().regex(/^[A-Z]{3}$/, 'Валют 3 үсэг'),
  status: z.enum(RECORD_STATUSES),
  kioskEnabled: z.boolean(),
  kitchenEnabled: z.boolean(),
  employeeMealsEnabled: z.boolean(),
  qpayEnabled: z.boolean(),
  cardPaymentsEnabled: z.boolean(),
  cashPaymentsEnabled: z.boolean(),
  orderNumberPrefix: z.string().trim().min(1, 'Угтвар оруулна уу').max(8),
  settingCurrency: z.string().trim().regex(/^[A-Z]{3}$/, 'Валют 3 үсэг'),
});

export type RestaurantFormData = z.infer<typeof restaurantSchema>;

const emptySetting = {
  kioskEnabled: false,
  kitchenEnabled: false,
  employeeMealsEnabled: false,
  qpayEnabled: false,
  cardPaymentsEnabled: false,
  cashPaymentsEnabled: true,
  orderNumberPrefix: 'R',
  settingCurrency: 'MNT',
};

export function getRestaurantDefaults(item?: RestaurantDetail): RestaurantFormData {
  return {
    code: item?.code ?? '',
    name: item?.name ?? '',
    legalName: item?.legalName ?? '',
    taxId: item?.taxId ?? '',
    phone: item?.phone ?? '',
    email: item?.email ?? '',
    country: item?.country ?? 'MN',
    city: item?.city ?? '',
    addressLine: item?.addressLine ?? '',
    timezone: item?.timezone ?? 'Asia/Ulaanbaatar',
    locale: item?.locale ?? 'mn',
    currency: item?.currency ?? 'MNT',
    status: item?.status ?? 'ACTIVE',
    kioskEnabled: item?.setting?.kioskEnabled ?? emptySetting.kioskEnabled,
    kitchenEnabled: item?.setting?.kitchenEnabled ?? emptySetting.kitchenEnabled,
    employeeMealsEnabled: item?.setting?.employeeMealsEnabled ?? emptySetting.employeeMealsEnabled,
    qpayEnabled: item?.setting?.qpayEnabled ?? emptySetting.qpayEnabled,
    cardPaymentsEnabled: item?.setting?.cardPaymentsEnabled ?? emptySetting.cardPaymentsEnabled,
    cashPaymentsEnabled: item?.setting?.cashPaymentsEnabled ?? emptySetting.cashPaymentsEnabled,
    orderNumberPrefix: item?.setting?.orderNumberPrefix ?? emptySetting.orderNumberPrefix,
    settingCurrency: item?.setting?.currency ?? emptySetting.settingCurrency,
  };
}

export function toRestaurantDto(values: RestaurantFormData) {
  return {
    code: values.code,
    name: values.name,
    legalName: values.legalName,
    taxId: values.taxId || undefined,
    phone: values.phone || undefined,
    email: values.email || undefined,
    country: values.country,
    city: values.city || undefined,
    addressLine: values.addressLine || undefined,
    timezone: values.timezone,
    locale: values.locale,
    currency: values.currency,
    status: values.status,
  };
}

export function toRestaurantSettingDto(values: RestaurantFormData) {
  return {
    kioskEnabled: values.kioskEnabled,
    kitchenEnabled: values.kitchenEnabled,
    employeeMealsEnabled: values.employeeMealsEnabled,
    qpayEnabled: values.qpayEnabled,
    cardPaymentsEnabled: values.cardPaymentsEnabled,
    cashPaymentsEnabled: values.cashPaymentsEnabled,
    orderNumberPrefix: values.orderNumberPrefix,
    currency: values.settingCurrency,
  };
}

export const RECORD_STATUS_LABELS: Record<RecordStatus, string> = {
  DRAFT: 'Ноорог',
  ACTIVE: 'Идэвхтэй',
  INACTIVE: 'Идэвхгүй',
  ARCHIVED: 'Архив',
};
