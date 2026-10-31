import type {
  EmployeeMealDayStatus,
  EmployeeMealKind,
  EmployeeMealOrderStatus,
} from '@packages/types';

export type ListEmployeeMealTypesQueryDto = {
  page?: number;
  limit?: number;
  search?: string;
};

export type UpsertEmployeeMealTypeDto = {
  kind: EmployeeMealKind;
  code: string;
  name: string;
  sortOrder?: number;
  isEnabled?: boolean;
};

export type ListEmployeeOrderSchedulesQueryDto = {
  page?: number;
  limit?: number;
  mealTypeId?: string;
};

export type UpsertEmployeeOrderScheduleDto = {
  mealTypeId: string;
  name: string;
  timezone?: string;
  weekdays: number[];
  opensAt: string;
  closesAt: string;
  isEnabled?: boolean;
};

export type ListEmployeeMealDaysQueryDto = {
  page?: number;
  limit?: number;
  mealTypeId?: string;
  from?: string;
  to?: string;
  status?: EmployeeMealDayStatus;
};

export type UpsertEmployeeMealDayDto = {
  mealTypeId: string;
  serviceDate: string;
  menuItemId: string;
  name?: string;
  status?: EmployeeMealDayStatus;
};

export type ListEmployeeMealOrdersQueryDto = {
  page?: number;
  limit?: number | '*';
  search?: string;
  from?: string;
  to?: string;
  status?: EmployeeMealOrderStatus;
  mealDayId?: string;
};

export type CreateEmployeeMealOrderDto = {
  mealDayId: string;
  employeeCode: string;
  plateNumber?: string | null;
  fulfillmentType?: 'CAMP' | 'DELIVERY' | null;
  deliveryLocation?: string | null;
};

export type UpdateEmployeeMealOrderDto = {
  status: EmployeeMealOrderStatus;
};
