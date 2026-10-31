import type { IntegrationVehicle } from './integration';

export const EMPLOYEE_STATUSES = ['ACTIVE', 'SUSPENDED', 'INACTIVE'] as const;

export type EmployeeStatus = (typeof EMPLOYEE_STATUSES)[number];

export type EmployeeVehicle = IntegrationVehicle;

export type EmployeeListItem = {
  id: string;
  publicId: string;
  employeeCode: string | null;
  firstName: string;
  lastName: string;
  department: string;
  position: string;
  status: EmployeeStatus;
  externalId: string | null;
  vehiclePlate: string | null;
  vehicle: EmployeeVehicle | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};
