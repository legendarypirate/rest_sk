import { ApiPropertyOptional } from '@nestjs/swagger';
import { EmployeeStatus } from '@generated/prisma/client';
import { Transform } from 'class-transformer';
import { IsEnum, IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';

const EMPLOYEE_SORT_FIELDS = ['createdAt', 'employeeCode', 'firstName', 'lastName'] as const;

function trimString({ value }: { value: unknown }) {
  if (typeof value !== 'string') {
    return value;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export class ListEmployeesQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MaxLength(100)
  search?: string;

  @ApiPropertyOptional({ enum: EmployeeStatus })
  @IsOptional()
  @IsEnum(EmployeeStatus)
  status?: EmployeeStatus;

  @ApiPropertyOptional({ enum: EMPLOYEE_SORT_FIELDS })
  @IsOptional()
  @IsIn(EMPLOYEE_SORT_FIELDS)
  sortBy?: (typeof EMPLOYEE_SORT_FIELDS)[number];
}
