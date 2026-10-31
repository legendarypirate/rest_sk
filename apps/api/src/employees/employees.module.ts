import { Module } from '@nestjs/common';

import { EmployeesController } from './employees.controller';
import { EmployeesQueryService } from './employees.query.service';

@Module({
  controllers: [EmployeesController],
  providers: [EmployeesQueryService],
})
export class EmployeesModule {}
