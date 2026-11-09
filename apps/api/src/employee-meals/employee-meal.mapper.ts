import type {
  EmployeeMealDayItem,
  EmployeeMealOrderItem,
  EmployeeMealTypeItem,
  EmployeeOrderScheduleItem,
} from '@packages/types';

import { toIso } from '@/common/utils/date';

import {
  employeeNameFromParts,
  readMetadataEmployeeName,
} from './employee-meal-order-employee';

export function toDateOnlyString(value: Date) {
  return value.toISOString().slice(0, 10);
}

export function toTimeString(value: Date) {
  const hours = String(value.getUTCHours()).padStart(2, '0');
  const minutes = String(value.getUTCMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

export function parseTime(value: string) {
  const [hours, minutes] = value.split(':').map(Number);
  return new Date(Date.UTC(1970, 0, 1, hours, minutes, 0, 0));
}

export function parseDateOnly(value: string) {
  return new Date(`${value}T00:00:00.000Z`);
}

export function todayDateOnly(timeZone = 'Asia/Ulaanbaatar') {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

export function toMealType(row: {
  id: string;
  publicId: string;
  kind: EmployeeMealTypeItem['kind'];
  code: string;
  name: string;
  sortOrder: number;
  isEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}): EmployeeMealTypeItem {
  return {
    id: row.id,
    publicId: row.publicId,
    kind: row.kind,
    code: row.code,
    name: row.name,
    sortOrder: row.sortOrder,
    isEnabled: row.isEnabled,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    deletedAt: toIso(row.deletedAt),
  };
}

export function toSchedule(row: {
  id: string;
  publicId: string;
  mealTypeId: string;
  mealType: { name: string };
  name: string;
  timezone: string;
  weekdays: number[];
  opensAt: Date;
  closesAt: Date;
  validFrom: Date;
  validTo: Date | null;
  isEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}): EmployeeOrderScheduleItem {
  return {
    id: row.id,
    publicId: row.publicId,
    mealTypeId: row.mealTypeId,
    mealTypeName: row.mealType.name,
    name: row.name,
    timezone: row.timezone,
    weekdays: row.weekdays,
    opensAt: toTimeString(row.opensAt),
    closesAt: toTimeString(row.closesAt),
    validFrom: toDateOnlyString(row.validFrom),
    validTo: row.validTo ? toDateOnlyString(row.validTo) : null,
    isEnabled: row.isEnabled,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    deletedAt: toIso(row.deletedAt),
  };
}

type MealDayImageRow = {
  id: string;
  mediaAssetId: string;
  isPrimary: boolean;
  mediaAsset: { storageUrl: string; thumbnailUrl: string | null };
};

export function toMealDay(
  row: {
    id: string;
    publicId: string;
    mealTypeId: string;
    mealType: { name: string; kind: EmployeeMealDayItem['mealType'] };
    serviceDate: Date;
    name: string | null;
    menuItemId: string | null;
    status: EmployeeMealDayItem['status'];
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
    orders: { status: string }[];
    menuItem: {
      id: string;
      name: string;
      categoryId: string;
      category: { name: string };
      images: MealDayImageRow[];
    } | null;
  },
): EmployeeMealDayItem {
  return {
    id: row.id,
    publicId: row.publicId,
    mealTypeId: row.mealTypeId,
    mealType: row.mealType.kind,
    mealTypeName: row.mealType.name,
    serviceDate: toDateOnlyString(row.serviceDate),
    name: row.menuItem?.name ?? row.name,
    menuItemId: row.menuItemId,
    menuItemName: row.menuItem?.name ?? null,
    categoryId: row.menuItem?.categoryId ?? null,
    categoryName: row.menuItem?.category.name ?? null,
    images: [...(row.menuItem?.images ?? [])]
      .sort((left, right) => Number(right.isPrimary) - Number(left.isPrimary))
      .map((image) => ({
      id: image.id,
      mediaAssetId: image.mediaAssetId,
      storageUrl: image.mediaAsset.storageUrl,
      thumbnailUrl: image.mediaAsset.thumbnailUrl,
      isPrimary: image.isPrimary,
    })),
    status: row.status,
    orderedCount: row.orders.filter((order) => order.status === 'ORDERED').length,
    consumedCount: row.orders.filter((order) => order.status === 'CONSUMED').length,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    deletedAt: toIso(row.deletedAt),
  };
}

export function toMealOrder(row: {
  id: string;
  publicId: string;
  mealDayId: string;
  mealDay: { serviceDate: Date; mealType: { name: string } };
  employeeCode: string;
  employeeId: string | null;
  employee: {
    firstName: string;
    lastName: string;
    vehicle?: unknown;
  } | null;
  plateNumber?: string | null;
  fulfillmentType?: EmployeeMealOrderItem['fulfillmentType'];
  deliveryLocation?: string | null;
  status: EmployeeMealOrderItem['status'];
  orderedAt: Date;
  cancelledAt: Date | null;
  consumedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  metadata?: unknown;
}): EmployeeMealOrderItem {
  const storedPlate = row.plateNumber?.trim() || null;
  return {
    id: row.id,
    publicId: row.publicId,
    mealDayId: row.mealDayId,
    serviceDate: toDateOnlyString(row.mealDay.serviceDate),
    mealTypeName: row.mealDay.mealType.name,
    employeeId: row.employeeId,
    employeeCode: row.employeeCode,
    employeeName: mealOrderEmployeeDisplayName(row),
    plateNumber: storedPlate ?? plateNumberOf(row.employee?.vehicle),
    fulfillmentType: row.fulfillmentType ?? null,
    deliveryLocation:
      row.fulfillmentType === 'DELIVERY'
        ? row.deliveryLocation?.trim() || null
        : null,
    status: row.status,
    orderedAt: row.orderedAt.toISOString(),
    cancelledAt: toIso(row.cancelledAt),
    consumedAt: toIso(row.consumedAt),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function mealOrderEmployeeDisplayName(row: {
  metadata?: unknown;
  employee: { firstName: string; lastName: string } | null;
}) {
  const cached = readMetadataEmployeeName(row.metadata);
  if (cached) {
    return cached;
  }
  return (row.employee ? employeeNameFromParts(row.employee) : null) ?? '—';
}

function plateNumberOf(vehicle: unknown) {
  if (!vehicle || typeof vehicle !== 'object' || !('plateNumber' in vehicle)) return null;
  const plate = vehicle.plateNumber;
  return typeof plate === 'string' && plate.length > 0 ? plate : null;
}
