import { Module } from '@nestjs/common';

import { EmployeesCommandService } from './employees.command.service';
import { EmployeesController } from './employees.controller';
import { EmployeesQueryService } from './employees.query.service';

@Module({
  controllers: [EmployeesController],
  providers: [EmployeesQueryService, EmployeesCommandService],
})
export class EmployeesModule {}
