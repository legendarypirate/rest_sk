-- Persist MLOS driver plate + camp/delivery on employee meal orders.
CREATE TYPE employee_meal."EmployeeMealFulfillmentType" AS ENUM ('CAMP', 'DELIVERY');

ALTER TABLE employee_meal.employee_meal_order
  ADD COLUMN IF NOT EXISTS plate_number VARCHAR(20),
  ADD COLUMN IF NOT EXISTS fulfillment_type employee_meal."EmployeeMealFulfillmentType",
  ADD COLUMN IF NOT EXISTS delivery_location VARCHAR(200);

CREATE INDEX IF NOT EXISTS employee_meal_order_fulfillment_type_idx
  ON employee_meal.employee_meal_order (fulfillment_type);

CREATE INDEX IF NOT EXISTS employee_meal_order_plate_number_idx
  ON employee_meal.employee_meal_order (plate_number);
