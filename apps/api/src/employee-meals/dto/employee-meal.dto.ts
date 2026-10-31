import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  EmployeeMealDayStatus,
  EmployeeMealKind,
  EmployeeMealOrderStatus,
} from '@generated/prisma/client';
import { Transform, Type } from 'class-transformer';
import {
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Max,
  MinLength,
  MaxLength,
  Min,
} from 'class-validator';

import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';

const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

function trimString({ value }: { value: unknown }) {
  if (typeof value !== 'string') {
    return value;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export class ListEmployeeMealTypesQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MaxLength(100)
  search?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') return undefined;
    return value === 'true' || value === true;
  })
  @IsBoolean()
  isEnabled?: boolean;
}

export class UpsertEmployeeMealTypeDto {
  @ApiProperty({ enum: EmployeeMealKind })
  @IsEnum(EmployeeMealKind)
  kind!: EmployeeMealKind;

  @ApiProperty()
  @Transform(trimString)
  @IsString()
  @MaxLength(32)
  code!: string;

  @ApiProperty()
  @Transform(trimString)
  @IsString()
  @MaxLength(100)
  name!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;
}

export class ListEmployeeOrderSchedulesQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  mealTypeId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') return undefined;
    return value === 'true' || value === true;
  })
  @IsBoolean()
  isEnabled?: boolean;
}

export class UpsertEmployeeOrderScheduleDto {
  @ApiProperty()
  @IsUUID()
  mealTypeId!: string;

  @ApiProperty()
  @Transform(trimString)
  @IsString()
  @MaxLength(120)
  name!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MaxLength(64)
  timezone?: string;

  @ApiProperty({ type: [Number] })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayUnique()
  @IsInt({ each: true })
  @Min(1, { each: true })
  @Max(7, { each: true })
  weekdays!: number[];

  @ApiProperty({ example: '08:00' })
  @Matches(TIME)
  opensAt!: string;

  @ApiProperty({ example: '10:30' })
  @Matches(TIME)
  closesAt!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;
}

export class ListEmployeeMealDaysQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  mealTypeId?: string;

  @ApiPropertyOptional({ example: '2026-09-24' })
  @IsOptional()
  @Transform(trimString)
  @Matches(DATE)
  serviceDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(trimString)
  @Matches(DATE)
  from?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(trimString)
  @Matches(DATE)
  to?: string;

  @ApiPropertyOptional({ enum: EmployeeMealDayStatus })
  @IsOptional()
  @IsEnum(EmployeeMealDayStatus)
  status?: EmployeeMealDayStatus;
}

export class UpsertEmployeeMealDayDto {
  @ApiProperty()
  @IsUUID()
  mealTypeId!: string;

  @ApiProperty()
  @Matches(DATE)
  serviceDate!: string;

  @ApiProperty()
  @IsUUID()
  menuItemId!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MaxLength(200)
  name?: string;

  @ApiPropertyOptional({ enum: EmployeeMealDayStatus })
  @IsOptional()
  @IsEnum(EmployeeMealDayStatus)
  status?: EmployeeMealDayStatus;
}

export class ListEmployeeMealOrdersQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  mealDayId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MaxLength(32)
  employeeCode?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Matches(DATE)
  from?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Matches(DATE)
  to?: string;

  @ApiPropertyOptional({ enum: EmployeeMealOrderStatus })
  @IsOptional()
  @IsEnum(EmployeeMealOrderStatus)
  status?: EmployeeMealOrderStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MaxLength(100)
  search?: string;
}

export class CreateEmployeeMealOrderDto {
  @ApiProperty()
  @IsUUID('all')
  mealDayId!: string;

  @ApiProperty({ example: 'E-1001' })
  @Transform(trimString)
  @IsString()
  @MinLength(1)
  @MaxLength(32)
  employeeCode!: string;
}

export class UpdateEmployeeMealOrderDto {
  @ApiProperty({ enum: EmployeeMealOrderStatus })
  @IsEnum(EmployeeMealOrderStatus)
  status!: EmployeeMealOrderStatus;
}
