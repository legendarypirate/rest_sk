import type { RecordStatus } from '@packages/types';

export type ListRestaurantsQueryDto = {
  page?: number;
  limit?: number | '*';
  search?: string;
  status?: RecordStatus;
};

export type UpsertRestaurantDto = {
  code: string;
  name: string;
  legalName: string;
  taxId?: string;
  phone?: string;
  email?: string;
  country?: string;
  city?: string;
  addressLine?: string;
  timezone?: string;
  locale?: string;
  currency?: string;
  status?: RecordStatus;
};

export type UpdateRestaurantSettingDto = {
  kioskEnabled?: boolean;
  kitchenEnabled?: boolean;
  employeeMealsEnabled?: boolean;
  qpayEnabled?: boolean;
  cardPaymentsEnabled?: boolean;
  cashPaymentsEnabled?: boolean;
  orderNumberPrefix?: string;
  currency?: string;
};
