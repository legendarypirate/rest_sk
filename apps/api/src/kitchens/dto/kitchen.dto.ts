import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { KitchenStationType } from '@generated/prisma/client';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, IsUUID, MaxLength, Min } from 'class-validator';

import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';

function trimString({ value }: { value: unknown }) {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export class ListKitchensQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MaxLength(100)
  search?: string;
}

export class UpsertKitchenDto {
  @ApiProperty()
  @Transform(trimString)
  @IsString()
  @MaxLength(32)
  code!: string;

  @ApiProperty()
  @Transform(trimString)
  @IsString()
  @MaxLength(200)
  name!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class ListKitchenStationsQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  kitchenId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MaxLength(100)
  search?: string;
}

export class UpsertKitchenStationDto {
  @ApiProperty()
  @IsUUID()
  kitchenId!: string;

  @ApiProperty()
  @Transform(trimString)
  @IsString()
  @MaxLength(32)
  code!: string;

  @ApiProperty()
  @Transform(trimString)
  @IsString()
  @MaxLength(200)
  name!: string;

  @ApiProperty({ enum: KitchenStationType })
  @IsEnum(KitchenStationType)
  stationType!: KitchenStationType;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
