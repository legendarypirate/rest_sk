import { Module } from '@nestjs/common';

import { RealtimeModule } from '@/realtime';

import { MealCommandService } from '@/employee-meal-policies/meals/meal.command.service';
import { EmployeeMealsController } from '@/employee-meal-policies/meals/meal.controller';
import { MealQueryService } from '@/employee-meal-policies/meals/meal.query.service';

import { EmployeeMealCommandService } from './employee-meal.command.service';
import {
  EmployeeMealDaysController,
  EmployeeMealOrdersController,
  EmployeeMealTypesController,
  EmployeeOrderSchedulesController,
} from './employee-meal.controller';
import { EmployeeMealQueryService } from './employee-meal.query.service';

@Module({
  imports: [RealtimeModule],
  controllers: [
    EmployeeMealTypesController,
    EmployeeOrderSchedulesController,
    EmployeeMealDaysController,
    EmployeeMealOrdersController,
    EmployeeMealsController,
  ],
  providers: [
    EmployeeMealQueryService,
    EmployeeMealCommandService,
    MealQueryService,
    MealCommandService,
  ],
})
export class EmployeeMealModule {}
