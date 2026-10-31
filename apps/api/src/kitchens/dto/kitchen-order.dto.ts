import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { KitchenOrderStatus } from '@generated/prisma/client';
import { Transform, Type } from 'class-transformer';
import { IsEnum, IsInt, IsISO8601, IsOptional, IsString, IsUUID, Matches, MaxLength, Min, ValidateIf } from 'class-validator';

import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';

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

export class ListKitchenOrdersQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  kitchenId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  orderId?: string;

  @ApiPropertyOptional({ enum: KitchenOrderStatus })
  @IsOptional()
  @IsEnum(KitchenOrderStatus)
  status?: KitchenOrderStatus;
}

export class UpsertKitchenOrderDto {
  @ApiProperty()
  @IsUUID()
  kitchenId!: string;

  @ApiProperty()
  @IsUUID()
  orderId!: string;

  @ApiPropertyOptional({ enum: KitchenOrderStatus })
  @IsOptional()
  @IsEnum(KitchenOrderStatus)
  status?: KitchenOrderStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  priority?: number;
}

export class ListKitchenOrderItemsQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  kitchenOrderId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  stationId?: string;

  @ApiPropertyOptional({ enum: KitchenOrderStatus })
  @IsOptional()
  @IsEnum(KitchenOrderStatus)
  status?: KitchenOrderStatus;
}

export class UpsertKitchenOrderItemDto {
  @ApiProperty()
  @IsUUID()
  kitchenOrderId!: string;

  @ApiProperty()
  @IsUUID()
  orderItemId!: string;

  @ApiProperty()
  @IsUUID()
  stationId!: string;

  @ApiPropertyOptional({ enum: KitchenOrderStatus })
  @IsOptional()
  @IsEnum(KitchenOrderStatus)
  status?: KitchenOrderStatus;

  @ApiProperty({ example: '1.000' })
  @Transform(({ value }) => String(value).trim())
  @Matches(QTY)
  quantity!: string;
}

export class ListKitchenTicketsQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  kitchenOrderId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  stationId?: string;

  @ApiPropertyOptional({ enum: KitchenOrderStatus })
  @IsOptional()
  @IsEnum(KitchenOrderStatus)
  status?: KitchenOrderStatus;
}

export class UpsertKitchenTicketDto {
  @ApiProperty()
  @IsUUID()
  kitchenOrderId!: string;

  @ApiProperty()
  @IsUUID()
  stationId!: string;

  @ApiProperty()
  @Transform(trimString)
  @IsString()
  @MaxLength(32)
  ticketNumber!: string;

  @ApiPropertyOptional({ enum: KitchenOrderStatus })
  @IsOptional()
  @IsEnum(KitchenOrderStatus)
  status?: KitchenOrderStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  priority?: number;

  @ApiPropertyOptional({ nullable: true })
  @Transform(emptyToNull)
  @ValidateIf((_, value) => value !== null)
  @IsISO8601()
  printedAt!: string | null;
}
