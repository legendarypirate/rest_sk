import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EmployeeMealStatus, MealType } from '@generated/prisma/client';
import { Transform } from 'class-transformer';
import { IsEnum, IsISO8601, IsOptional, IsUUID, Matches, ValidateIf } from 'class-validator';

import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';

const MONEY = /^\d{1,12}(\.\d{1,2})?$/;

function emptyToNull({ value }: { value: unknown }) {
  if (value === undefined || value === null || value === '') return null;
  return typeof value === 'string' ? value.trim() : value;
}

function upper({ value }: { value: unknown }) {
  return typeof value === 'string' ? value.trim().toUpperCase() : value;
}

export class ListEmployeeMealsQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  employeeId?: string;

  @ApiPropertyOptional({ enum: EmployeeMealStatus })
  @IsOptional()
  @IsEnum(EmployeeMealStatus)
  status?: EmployeeMealStatus;
}

export class UpsertEmployeeMealDto {
  @ApiProperty()
  @IsUUID()
  employeeId!: string;

  @ApiPropertyOptional({ nullable: true })
  @Transform(emptyToNull)
  @ValidateIf((_, value) => value !== null)
  @IsUUID()
  orderId!: string | null;

  @ApiProperty({ enum: MealType })
  @IsEnum(MealType)
  mealType!: MealType;

  @ApiPropertyOptional({ enum: EmployeeMealStatus })
  @IsOptional()
  @IsEnum(EmployeeMealStatus)
  status?: EmployeeMealStatus;

  @ApiProperty()
  @IsISO8601()
  consumedAt!: string;

  @ApiPropertyOptional({ example: 'MNT' })
  @IsOptional()
  @Transform(upper)
  @Matches(/^[A-Z]{3}$/)
  currency?: string;

  @ApiProperty({ example: '12000.00' })
  @Transform(({ value }) => String(value).trim())
  @Matches(MONEY)
  foodAmount!: string;

  @ApiProperty({ example: '8000.00' })
  @Transform(({ value }) => String(value).trim())
  @Matches(MONEY)
  subsidyAmount!: string;

  @ApiProperty({ example: '4000.00' })
  @Transform(({ value }) => String(value).trim())
  @Matches(MONEY)
  employeePaidAmount!: string;
}
