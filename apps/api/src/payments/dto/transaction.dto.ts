import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  PayerRole,
  PaymentEventStatus,
  PaymentMethodKind,
  PaymentStatus,
} from '@generated/prisma/client';
import { Transform } from 'class-transformer';
import { IsEnum, IsISO8601, IsObject, IsOptional, IsString, IsUUID, Matches, MaxLength, ValidateIf } from 'class-validator';

import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';

const MONEY = /^\d{1,12}(\.\d{1,2})?$/;

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

export class ListPaymentTransactionsQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  orderId?: string;

  @ApiPropertyOptional({ enum: PaymentStatus })
  @IsOptional()
  @IsEnum(PaymentStatus)
  status?: PaymentStatus;

  @ApiPropertyOptional({ enum: PaymentMethodKind })
  @IsOptional()
  @IsEnum(PaymentMethodKind)
  method?: PaymentMethodKind;
}

export class UpsertPaymentTransactionDto {
  @ApiProperty()
  @IsUUID()
  orderId!: string;

  @ApiProperty({ enum: PaymentMethodKind })
  @IsEnum(PaymentMethodKind)
  method!: PaymentMethodKind;

  @ApiProperty({ enum: PayerRole })
  @IsEnum(PayerRole)
  payerRole!: PayerRole;

  @ApiPropertyOptional({ enum: PaymentStatus })
  @IsOptional()
  @IsEnum(PaymentStatus)
  status?: PaymentStatus;

  @ApiPropertyOptional({ example: 'MNT' })
  @IsOptional()
  @Transform(upper)
  @Matches(/^[A-Z]{3}$/)
  currency?: string;

  @ApiProperty({ example: '12000.00' })
  @Transform(({ value }) => String(value).trim())
  @Matches(MONEY)
  amount!: string;

  @ApiProperty()
  @Transform(trimString)
  @IsString()
  @MaxLength(128)
  idempotencyKey!: string;

  @ApiPropertyOptional({ nullable: true })
  @Transform(emptyToNull)
  @ValidateIf((_, value) => value !== null)
  @IsString()
  @MaxLength(128)
  providerTransactionId!: string | null;

  @ApiPropertyOptional({ nullable: true })
  @Transform(emptyToNull)
  @ValidateIf((_, value) => value !== null)
  @IsString()
  @MaxLength(64)
  failureCode!: string | null;

  @ApiPropertyOptional({ nullable: true })
  @Transform(emptyToNull)
  @ValidateIf((_, value) => value !== null)
  @IsString()
  @MaxLength(300)
  failureMessage!: string | null;
}

export class ListPaymentEventsQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  transactionId?: string;
}

export class UpsertPaymentEventDto {
  @ApiProperty()
  @IsUUID()
  transactionId!: string;

  @ApiPropertyOptional({ example: 'QPAY' })
  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MaxLength(32)
  source?: string;

  @ApiProperty()
  @Transform(trimString)
  @IsString()
  @MaxLength(128)
  providerEventId!: string;

  @ApiProperty()
  @Transform(trimString)
  @IsString()
  @MaxLength(64)
  eventType!: string;

  @ApiPropertyOptional({ enum: PaymentEventStatus })
  @IsOptional()
  @IsEnum(PaymentEventStatus)
  status?: PaymentEventStatus;

  @ApiPropertyOptional({ type: Object })
  @IsOptional()
  @IsObject()
  payload?: Record<string, unknown>;

  @ApiPropertyOptional({ nullable: true })
  @Transform(emptyToNull)
  @ValidateIf((_, value) => value !== null)
  @IsISO8601()
  processedAt!: string | null;
}
