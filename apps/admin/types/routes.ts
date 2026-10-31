import type { LucideIcon } from 'lucide-react';

export const PlatformPermission = {
  UsersRead: 'platform:users:read',
  UsersAdd: 'platform:users:add',
  UsersEdit: 'platform:users:edit',
  UsersDelete: 'platform:users:delete',
  UsersImpersonate: 'platform:users:impersonate',
  RolesRead: 'platform:roles:read',
  RolesManage: 'platform:roles:manage',
  ResourcesRead: 'platform:resources:read',
  ResourcesManage: 'platform:resources:manage',
  PermissionsManage: 'platform:permissions:manage',
  AuditRead: 'platform:audit:read',
  SecurityRead: 'platform:security:read',
  SecurityManage: 'platform:security:manage',
  MediaRead: 'platform:media:read',
  MediaAdd: 'platform:media:add',
  MediaEdit: 'platform:media:edit',
  MediaDelete: 'platform:media:delete',
  EmployeesRead: 'platform:employees:read',
  EmployeesEdit: 'platform:employees:edit',
  EmployeeMealTypesRead: 'platform:employee-meal-types:read',
  EmployeeMealTypesAdd: 'platform:employee-meal-types:add',
  EmployeeMealTypesEdit: 'platform:employee-meal-types:edit',
  EmployeeMealTypesDelete: 'platform:employee-meal-types:delete',
  EmployeeOrderSchedulesRead: 'platform:employee-order-schedules:read',
  EmployeeOrderSchedulesAdd: 'platform:employee-order-schedules:add',
  EmployeeOrderSchedulesEdit: 'platform:employee-order-schedules:edit',
  EmployeeOrderSchedulesDelete: 'platform:employee-order-schedules:delete',
  EmployeeMealDaysRead: 'platform:employee-meal-days:read',
  EmployeeMealDaysAdd: 'platform:employee-meal-days:add',
  EmployeeMealDaysEdit: 'platform:employee-meal-days:edit',
  EmployeeMealDaysDelete: 'platform:employee-meal-days:delete',
  EmployeeMealOrdersRead: 'platform:employee-meal-orders:read',
  EmployeeMealOrdersAdd: 'platform:employee-meal-orders:add',
  EmployeeMealOrdersEdit: 'platform:employee-meal-orders:edit',
  EmployeeMealOrdersDelete: 'platform:employee-meal-orders:delete',
  MenuCategoriesRead: 'platform:menu-categories:read',
  MenuCategoriesAdd: 'platform:menu-categories:add',
  MenuCategoriesEdit: 'platform:menu-categories:edit',
  MenuCategoriesDelete: 'platform:menu-categories:delete',
  MenuItemsRead: 'platform:menu-items:read',
  MenuItemsAdd: 'platform:menu-items:add',
  MenuItemsEdit: 'platform:menu-items:edit',
  MenuItemsDelete: 'platform:menu-items:delete',
  MenuCategoryImagesRead: 'platform:menu-category-images:read',
  MenuCategoryImagesAdd: 'platform:menu-category-images:add',
  MenuCategoryImagesEdit: 'platform:menu-category-images:edit',
  MenuCategoryImagesDelete: 'platform:menu-category-images:delete',
  MenuItemImagesRead: 'platform:menu-item-images:read',
  MenuItemImagesAdd: 'platform:menu-item-images:add',
  MenuItemImagesEdit: 'platform:menu-item-images:edit',
  MenuItemImagesDelete: 'platform:menu-item-images:delete',
  RestaurantsRead: 'platform:restaurants:read',
  RestaurantsAdd: 'platform:restaurants:add',
  RestaurantsEdit: 'platform:restaurants:edit',
  RestaurantsDelete: 'platform:restaurants:delete',
  IntegrationsRead: 'platform:integrations:read',
  IntegrationsAdd: 'platform:integrations:add',
  IntegrationsEdit: 'platform:integrations:edit',
  IntegrationsDelete: 'platform:integrations:delete',
  PaymentTransactionsRead: 'platform:payment-transactions:read',
  KioskDevicesEdit: 'platform:kiosk-devices:edit',
} as const;

export type PlatformPermission =
  (typeof PlatformPermission)[keyof typeof PlatformPermission];

export type NavItemConfig = {
  menuId: string;
  path: string;
  label: string;
  icon: LucideIcon;
  permission?: PlatformPermission | readonly PlatformPermission[];
  match?: 'all' | 'any';
  exact?: boolean;
  children?: readonly NavItemConfig[];
};

export type NavGroupConfig = {
  id: string;
  label: string;
  items: readonly NavItemConfig[];
};
