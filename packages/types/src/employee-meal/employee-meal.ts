export const EMPLOYEE_MEAL_KINDS = ['LUNCH', 'DINNER'] as const;
export type EmployeeMealKind = (typeof EMPLOYEE_MEAL_KINDS)[number];

export const EMPLOYEE_MEAL_DAY_STATUSES = ['SCHEDULED', 'CLOSED', 'CANCELLED'] as const;
export type EmployeeMealDayStatus = (typeof EMPLOYEE_MEAL_DAY_STATUSES)[number];

export const EMPLOYEE_MEAL_ORDER_STATUSES = ['ORDERED', 'CANCELLED', 'CONSUMED'] as const;
export type EmployeeMealOrderStatus = (typeof EMPLOYEE_MEAL_ORDER_STATUSES)[number];

export type EmployeeMealTypeItem = {
  id: string;
  publicId: string;
  kind: EmployeeMealKind;
  code: string;
  name: string;
  sortOrder: number;
  isEnabled: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

export type EmployeeOrderScheduleItem = {
  id: string;
  publicId: string;
  mealTypeId: string;
  mealTypeName: string;
  name: string;
  timezone: string;
  weekdays: number[];
  opensAt: string;
  closesAt: string;
  validFrom: string;
  validTo: string | null;
  isEnabled: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

export type EmployeeMealDayImage = {
  id: string;
  mediaAssetId: string;
  storageUrl: string;
  thumbnailUrl: string | null;
  isPrimary: boolean;
};

export type EmployeeMealDayItem = {
  id: string;
  publicId: string;
  mealTypeId: string;
  mealTypeName: string;
  serviceDate: string;
  name: string | null;
  menuItemId: string | null;
  menuItemName: string | null;
  categoryId: string | null;
  categoryName: string | null;
  images: EmployeeMealDayImage[];
  status: EmployeeMealDayStatus;
  orderedCount: number;
  consumedCount: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

export type EmployeeMealOrderItem = {
  id: string;
  publicId: string;
  mealDayId: string;
  serviceDate: string;
  mealTypeName: string;
  employeeId: string | null;
  employeeCode: string;
  employeeName: string;
  plateNumber: string | null;
  status: EmployeeMealOrderStatus;
  orderedAt: string;
  cancelledAt: string | null;
  consumedAt: string | null;
  createdAt: string;
  updatedAt: string;
};
