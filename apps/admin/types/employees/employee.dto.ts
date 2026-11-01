import type { EmployeeStatus, SortDirection } from '@packages/types';

export type ListEmployeesQueryDto = {
  page?: number;
  limit?: number | '*';
  search?: string;
  status?: EmployeeStatus;
  sortBy?:
    | 'createdAt'
    | 'updatedAt'
    | 'employeeCode'
    | 'firstName'
    | 'lastName'
    | 'department'
    | 'position'
    | 'status'
    | 'vehiclePlate';
  sortDirection?: SortDirection;
};

export type UpdateEmployeeStatusDto = {
  status: EmployeeStatus;
};
