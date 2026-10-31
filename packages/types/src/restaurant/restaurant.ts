export const RECORD_STATUSES = ['DRAFT', 'ACTIVE', 'INACTIVE', 'ARCHIVED'] as const;
export type RecordStatus = (typeof RECORD_STATUSES)[number];

export type RestaurantSettingItem = {
  id: string;
  kioskEnabled: boolean;
  kitchenEnabled: boolean;
  employeeMealsEnabled: boolean;
  qpayEnabled: boolean;
  cardPaymentsEnabled: boolean;
  cashPaymentsEnabled: boolean;
  orderNumberPrefix: string;
  currency: string;
  updatedAt: string;
};

export type RestaurantListItem = {
  id: string;
  publicId: string;
  code: string;
  name: string;
  legalName: string;
  status: RecordStatus;
  city: string | null;
  phone: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

export type RestaurantDetail = RestaurantListItem & {
  taxId: string | null;
  email: string | null;
  country: string;
  addressLine: string | null;
  timezone: string;
  locale: string;
  currency: string;
  setting: RestaurantSettingItem;
};
