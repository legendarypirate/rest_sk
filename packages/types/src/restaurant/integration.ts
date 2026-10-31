export const INTEGRATION_SCOPES = [
  'employees:read',
  'vehicles:read',
  'employee-vehicles:read',
] as const;

export type IntegrationScope = (typeof INTEGRATION_SCOPES)[number];

export type IntegrationApiItem = {
  id: string;
  scope: string;
  method: string;
  path: string;
  isEnabled: boolean;
};

export type IntegrationListItem = {
  id: string;
  publicId: string;
  name: string;
  baseUrl: string;
  clientId: string;
  hasSecret: boolean;
  isEnabled: boolean;
  scopes: IntegrationScope[];
  apis: IntegrationApiItem[];
  lastSyncedAt: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

export type IntegrationDetail = IntegrationListItem;

export type EmployeeSyncResult = {
  saved: number;
};

export type EmployeeSyncAllResult = EmployeeSyncResult & {
  integrations: number;
  failed: number;
};

export type IntegrationEmployeeStatus = 'active' | 'inactive' | 'terminated';
export type IntegrationVehicleStatus = 'active' | 'inactive' | 'maintenance' | 'retired';
export type IntegrationTrailerConfig = 'none' | 'one' | 'two';

export type IntegrationRef = {
  id: string;
  name: string;
  code: string | null;
};

export type IntegrationDriver = {
  id: string;
  firstName: string;
  lastName: string;
  code: string | null;
};

export type IntegrationVehicle = {
  id: string;
  plateNumber: string;
  chassisNumber: string;
  make: string;
  model: string;
  status: IntegrationVehicleStatus;
  isTrailer: IntegrationTrailerConfig;
  category: IntegrationRef | null;
  driver: IntegrationDriver | null;
};

export type IntegrationEmployee = {
  id: string;
  code: string | null;
  firstName: string;
  lastName: string;
  status: IntegrationEmployeeStatus;
  hiredAt: string | null;
  department: IntegrationRef | null;
  position: IntegrationRef | null;
};

export type IntegrationEmployeeDetail = IntegrationEmployee & {
  vehicle: IntegrationVehicle | null;
};
