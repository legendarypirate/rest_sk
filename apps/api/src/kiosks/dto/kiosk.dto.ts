import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DeviceEventType, KioskDeviceStatus, KioskSessionStatus } from '@generated/prisma/client';
import { Transform } from 'class-transformer';
import { IsEnum, IsISO8601, IsOptional, IsString, IsUUID, Matches, MaxLength, ValidateIf } from 'class-validator';

import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';

function trimString({ value }: { value: unknown }) {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function emptyToNull({ value }: { value: unknown }) {
  if (value === undefined || value === null || value === '') return null;
  return typeof value === 'string' ? value.trim() : value;
}

export class ListKioskDevicesQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MaxLength(100)
  search?: string;

  @ApiPropertyOptional({ enum: KioskDeviceStatus })
  @IsOptional()
  @IsEnum(KioskDeviceStatus)
  status?: KioskDeviceStatus;
}

export class UpsertKioskDeviceDto {
  @ApiProperty()
  @Transform(trimString)
  @IsString()
  @MaxLength(64)
  code!: string;

  @ApiProperty()
  @Transform(trimString)
  @IsString()
  @MaxLength(200)
  name!: string;

  @ApiPropertyOptional({ enum: KioskDeviceStatus })
  @IsOptional()
  @IsEnum(KioskDeviceStatus)
  status?: KioskDeviceStatus;

  @ApiPropertyOptional({ nullable: true })
  @Transform(emptyToNull)
  @ValidateIf((_, value) => value !== null)
  @IsString()
  @MaxLength(32)
  appVersion!: string | null;

  @ApiPropertyOptional({ nullable: true })
  @Transform(emptyToNull)
  @ValidateIf((_, value) => value !== null)
  @Matches(/^(?:\d{1,3}\.){3}\d{1,3}$|^[0-9a-fA-F:]+$/)
  ipAddress!: string | null;
}

export class ListKioskSessionsQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  deviceId?: string;

  @ApiPropertyOptional({ enum: KioskSessionStatus })
  @IsOptional()
  @IsEnum(KioskSessionStatus)
  status?: KioskSessionStatus;
}

export class UpsertKioskSessionDto {
  @ApiProperty()
  @IsUUID()
  deviceId!: string;

  @ApiPropertyOptional({ nullable: true })
  @Transform(emptyToNull)
  @ValidateIf((_, value) => value !== null)
  @IsUUID()
  employeeId!: string | null;

  @ApiPropertyOptional({ enum: KioskSessionStatus })
  @IsOptional()
  @IsEnum(KioskSessionStatus)
  status?: KioskSessionStatus;

  @ApiPropertyOptional({ nullable: true })
  @Transform(emptyToNull)
  @ValidateIf((_, value) => value !== null)
  @IsISO8601()
  endedAt!: string | null;
}

export class ListDeviceEventsQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  deviceId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  sessionId?: string;

  @ApiPropertyOptional({ enum: DeviceEventType })
  @IsOptional()
  @IsEnum(DeviceEventType)
  type?: DeviceEventType;
}

export class UpsertDeviceEventDto {
  @ApiProperty()
  @IsUUID()
  deviceId!: string;

  @ApiPropertyOptional({ nullable: true })
  @Transform(emptyToNull)
  @ValidateIf((_, value) => value !== null)
  @IsUUID()
  sessionId!: string | null;

  @ApiProperty({ enum: DeviceEventType })
  @IsEnum(DeviceEventType)
  type!: DeviceEventType;

  @ApiPropertyOptional({ nullable: true })
  @Transform(emptyToNull)
  @ValidateIf((_, value) => value !== null)
  @IsString()
  @MaxLength(500)
  message!: string | null;

  @ApiProperty()
  @IsISO8601()
  occurredAt!: string;
}
