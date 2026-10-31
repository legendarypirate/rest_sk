import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrderChannel, OrderStatus, ServiceType } from '@generated/prisma/client';
import { Transform, Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';

import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';

const MONEY = /^\d{1,12}(\.\d{1,2})?$/;
const QTY = /^\d{1,7}(\.\d{1,3})?$/;

function trimString({ value }: { value: unknown }) {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function emptyToNull({ value }: { value: unknown }) {
  if (value === undefined || value === null || value === '') return null;
  return typeof value === 'string' ? value.trim() : value;
}

function upper({ value }: { value: unknown }) {
  return typeof value === 'string' ? value.trim().toUpperCase() : value;
}

export class ListOrdersQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MaxLength(100)
  search?: string;

  @ApiPropertyOptional({ enum: OrderStatus })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @ApiPropertyOptional({ enum: OrderChannel })
  @IsOptional()
  @IsEnum(OrderChannel)
  channel?: OrderChannel;
}

export class UpsertOrderDto {
  @ApiProperty()
  @Transform(trimString)
  @IsString()
  @MaxLength(32)
  orderNumber!: string;

  @ApiProperty({ enum: OrderChannel })
  @IsEnum(OrderChannel)
  channel!: OrderChannel;

  @ApiProperty({ enum: ServiceType })
  @IsEnum(ServiceType)
  serviceType!: ServiceType;

  @ApiPropertyOptional({ enum: OrderStatus })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @ApiPropertyOptional({ example: 'MNT' })
  @IsOptional()
  @Transform(upper)
  @Matches(/^[A-Z]{3}$/)
  currency?: string;

  @ApiPropertyOptional({ nullable: true })
  @Transform(emptyToNull)
  @ValidateIf((_, value) => value !== null)
  @IsUUID()
  employeeId!: string | null;

  @ApiPropertyOptional({ nullable: true })
  @Transform(emptyToNull)
  @ValidateIf((_, value) => value !== null)
  @IsUUID()
  kioskDeviceId!: string | null;

  @ApiPropertyOptional({ nullable: true })
  @Transform(emptyToNull)
  @ValidateIf((_, value) => value !== null)
  @IsUUID()
  kioskSessionId!: string | null;

  @ApiPropertyOptional({ nullable: true })
  @Transform(emptyToNull)
  @ValidateIf((_, value) => value !== null)
  @IsString()
  @MaxLength(500)
  note!: string | null;
}

export class ListOrderItemsQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  orderId?: string;
}

export class UpsertOrderItemDto {
  @ApiProperty()
  @IsUUID()
  orderId!: string;

  @ApiPropertyOptional({ nullable: true })
  @Transform(emptyToNull)
  @ValidateIf((_, value) => value !== null)
  @IsUUID()
  menuItemId!: string | null;

  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  lineNumber!: number;

  @ApiProperty()
  @Transform(trimString)
  @IsString()
  @MaxLength(200)
  nameSnapshot!: string;

  @ApiProperty()
  @Transform(trimString)
  @IsString()
  @MaxLength(64)
  skuSnapshot!: string;

  @ApiPropertyOptional({ nullable: true })
  @Transform(emptyToNull)
  @ValidateIf((_, value) => value !== null)
  @IsString()
  @MaxLength(200)
  variantSnapshot!: string | null;

  @ApiProperty({ example: '1.000' })
  @Transform(({ value }) => String(value).trim())
  @Matches(QTY)
  quantity!: string;

  @ApiPropertyOptional({ example: 'MNT' })
  @IsOptional()
  @Transform(upper)
  @Matches(/^[A-Z]{3}$/)
  currency?: string;

  @ApiProperty({ example: '12000.00' })
  @Transform(({ value }) => String(value).trim())
  @Matches(MONEY)
  unitPrice!: string;

  @ApiPropertyOptional({ example: '0.00' })
  @IsOptional()
  @Transform(({ value }) => String(value).trim())
  @Matches(MONEY)
  discountAmount?: string;

  @ApiPropertyOptional({ example: '0.00' })
  @IsOptional()
  @Transform(({ value }) => String(value).trim())
  @Matches(MONEY)
  subsidyAmount?: string;

  @ApiPropertyOptional({ nullable: true })
  @Transform(emptyToNull)
  @ValidateIf((_, value) => value !== null)
  @IsString()
  @MaxLength(300)
  note!: string | null;
}

export class ListOrderStatusHistoryQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  orderId?: string;
}

export class CreateOrderStatusHistoryDto {
  @ApiProperty()
  @IsUUID()
  orderId!: string;

  @ApiProperty({ enum: OrderStatus })
  @IsEnum(OrderStatus)
  toStatus!: OrderStatus;

  @ApiPropertyOptional({ nullable: true })
  @Transform(emptyToNull)
  @ValidateIf((_, value) => value !== null)
  @IsString()
  @MaxLength(300)
  reason!: string | null;
}
