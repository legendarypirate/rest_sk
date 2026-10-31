import type { EmployeeStatus, SortDirection } from '@packages/types';

export type ListEmployeesQueryDto = {
  page?: number;
  limit?: number | '*';
  search?: string;
  status?: EmployeeStatus;
  sortBy?: 'createdAt' | 'employeeCode' | 'firstName' | 'lastName';
  sortDirection?: SortDirection;
};
