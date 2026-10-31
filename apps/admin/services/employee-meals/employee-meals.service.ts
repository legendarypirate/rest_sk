import type {
  EmployeeMealDayItem,
  EmployeeMealOrderItem,
  EmployeeMealTypeItem,
  EmployeeOrderScheduleItem,
  Paginated,
} from '@packages/types';

import { api } from '@/lib/api';
import { REALTIME_EVENTS } from '@/lib/realtime/events';
import { socketService } from '@/lib/realtime/realtime';
import { toSearchParams } from '@/lib/search-params';
import type {
  CreateEmployeeMealOrderDto,
  ListEmployeeMealDaysQueryDto,
  ListEmployeeMealOrdersQueryDto,
  ListEmployeeMealTypesQueryDto,
  ListEmployeeOrderSchedulesQueryDto,
  UpdateEmployeeMealOrderDto,
  UpsertEmployeeMealDayDto,
  UpsertEmployeeMealTypeDto,
  UpsertEmployeeOrderScheduleDto,
} from '@/types/employee-meals/employee-meal.dto';

export function listEmployeeMealTypes(params: ListEmployeeMealTypesQueryDto = {}) {
  return api<Paginated<EmployeeMealTypeItem>>(
    `employee-meal-types?${toSearchParams({ ...params })}`,
  );
}

export function createEmployeeMealType(dto: UpsertEmployeeMealTypeDto) {
  return api<EmployeeMealTypeItem>('employee-meal-types', {
    method: 'POST',
    body: JSON.stringify(dto),
  });
}

export function updateEmployeeMealType(id: string, dto: UpsertEmployeeMealTypeDto) {
  return api<EmployeeMealTypeItem>(`employee-meal-types/${id}`, {
    method: 'PUT',
    body: JSON.stringify(dto),
  });
}

export function deleteEmployeeMealType(id: string) {
  return api<void>(`employee-meal-types/${id}`, { method: 'DELETE' });
}

export function listEmployeeOrderSchedules(params: ListEmployeeOrderSchedulesQueryDto = {}) {
  return api<Paginated<EmployeeOrderScheduleItem>>(
    `employee-order-schedules?${toSearchParams({ ...params })}`,
  );
}

export function createEmployeeOrderSchedule(dto: UpsertEmployeeOrderScheduleDto) {
  return api<EmployeeOrderScheduleItem>('employee-order-schedules', {
    method: 'POST',
    body: JSON.stringify(dto),
  });
}

export function updateEmployeeOrderSchedule(id: string, dto: UpsertEmployeeOrderScheduleDto) {
  return api<EmployeeOrderScheduleItem>(`employee-order-schedules/${id}`, {
    method: 'PUT',
    body: JSON.stringify(dto),
  });
}

export function deleteEmployeeOrderSchedule(id: string) {
  return api<void>(`employee-order-schedules/${id}`, { method: 'DELETE' });
}

export function listEmployeeMealDays(params: ListEmployeeMealDaysQueryDto = {}) {
  return api<Paginated<EmployeeMealDayItem>>(
    `employee-meal-days?${toSearchParams({ ...params })}`,
  );
}

export function createEmployeeMealDay(dto: UpsertEmployeeMealDayDto) {
  return api<EmployeeMealDayItem>('employee-meal-days', {
    method: 'POST',
    body: JSON.stringify(dto),
  });
}

export function updateEmployeeMealDay(id: string, dto: UpsertEmployeeMealDayDto) {
  return api<EmployeeMealDayItem>(`employee-meal-days/${id}`, {
    method: 'PUT',
    body: JSON.stringify(dto),
  });
}

export function deleteEmployeeMealDay(id: string) {
  return api<void>(`employee-meal-days/${id}`, { method: 'DELETE' });
}

export function listEmployeeMealOrders(params: ListEmployeeMealOrdersQueryDto = {}) {
  return api<Paginated<EmployeeMealOrderItem>>(
    `employee-meal-orders?${toSearchParams({ ...params })}`,
  );
}

export function createEmployeeMealOrder(dto: CreateEmployeeMealOrderDto) {
  return api<EmployeeMealOrderItem>('employee-meal-orders', {
    method: 'POST',
    body: JSON.stringify(dto),
  });
}

export function updateEmployeeMealOrder(id: string, dto: UpdateEmployeeMealOrderDto) {
  return api<EmployeeMealOrderItem>(`employee-meal-orders/${id}`, {
    method: 'PUT',
    body: JSON.stringify(dto),
  });
}

export function deleteEmployeeMealOrder(id: string) {
  return api<void>(`employee-meal-orders/${id}`, { method: 'DELETE' });
}

export function onEmployeeMealOrderUpdated(handler: () => void) {
  const socket = socketService.connect();
  socket.on(REALTIME_EVENTS.employeeMealOrderUpdated, handler);
  return () => {
    socket.off(REALTIME_EVENTS.employeeMealOrderUpdated, handler);
  };
}
