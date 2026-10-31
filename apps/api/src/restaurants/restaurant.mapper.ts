import type { RestaurantDetail, RestaurantListItem, RestaurantSettingItem } from '@packages/types';

import { toIso } from '@/common/utils/date';

type SettingRow = {
  id: string;
  kioskEnabled: boolean;
  kitchenEnabled: boolean;
  employeeMealsEnabled: boolean;
  qpayEnabled: boolean;
  cardPaymentsEnabled: boolean;
  cashPaymentsEnabled: boolean;
  orderNumberPrefix: string;
  currency: string;
  updatedAt: Date;
};

type RestaurantRow = {
  id: string;
  publicId: string;
  code: string;
  name: string;
  legalName: string;
  taxId: string | null;
  phone: string | null;
  email: string | null;
  country: string;
  city: string | null;
  addressLine: string | null;
  timezone: string;
  locale: string;
  currency: string;
  status: RestaurantListItem['status'];
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  setting: SettingRow | null;
};

export function toSetting(row: SettingRow): RestaurantSettingItem {
  return {
    id: row.id,
    kioskEnabled: row.kioskEnabled,
    kitchenEnabled: row.kitchenEnabled,
    employeeMealsEnabled: row.employeeMealsEnabled,
    qpayEnabled: row.qpayEnabled,
    cardPaymentsEnabled: row.cardPaymentsEnabled,
    cashPaymentsEnabled: row.cashPaymentsEnabled,
    orderNumberPrefix: row.orderNumberPrefix,
    currency: row.currency,
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function toRestaurantList(row: RestaurantRow): RestaurantListItem {
  return {
    id: row.id,
    publicId: row.publicId,
    code: row.code,
    name: row.name,
    legalName: row.legalName,
    status: row.status,
    city: row.city,
    phone: row.phone,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    deletedAt: toIso(row.deletedAt),
  };
}

export function toRestaurantDetail(row: RestaurantRow & { setting: SettingRow }): RestaurantDetail {
  return {
    ...toRestaurantList(row),
    taxId: row.taxId,
    email: row.email,
    country: row.country,
    addressLine: row.addressLine,
    timezone: row.timezone,
    locale: row.locale,
    currency: row.currency,
    setting: toSetting(row.setting),
  };
}
