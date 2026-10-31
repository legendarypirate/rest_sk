export const MEAL_TYPES = ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK', 'OTHER'] as const;
export type MealType = (typeof MEAL_TYPES)[number];

export const EMPLOYEE_MEAL_STATUSES = ['CONSUMED', 'CANCELLED', 'REFUNDED'] as const;
export type EmployeeMealStatus = (typeof EMPLOYEE_MEAL_STATUSES)[number];

export type EmployeeMealRecord = {
  id: string;
  employeeId: string;
  employeeName: string;
  orderId: string | null;
  mealType: MealType;
  status: EmployeeMealStatus;
  consumedAt: string;
  currency: string;
  foodAmount: string;
  subsidyAmount: string;
  employeePaidAmount: string;
  cancelledAt: string | null;
  createdAt: string;
  updatedAt: string;
};
