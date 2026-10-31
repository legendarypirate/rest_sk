import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsIn,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';

import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';

import { INTEGRATION_SCOPES } from '../integration.catalog';

function trimString({ value }: { value: unknown }) {
  if (typeof value !== 'string') {
    return value;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export class ListIntegrationsQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MaxLength(120)
  search?: string;
}

export class UpsertIntegrationDto {
  @ApiProperty()
  @Transform(trimString)
  @IsString()
  @MaxLength(120)
  name!: string;

  @ApiProperty({ example: 'http://localhost:5050/api/v1' })
  @Transform(trimString)
  @IsUrl({ require_tld: false })
  @MaxLength(300)
  baseUrl!: string;

  @ApiProperty()
  @Transform(trimString)
  @IsString()
  @MaxLength(200)
  clientId!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MaxLength(500)
  clientSecret?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;

  @ApiProperty({ enum: INTEGRATION_SCOPES, isArray: true })
  @IsArray()
  @ArrayUnique()
  @IsIn(INTEGRATION_SCOPES, { each: true })
  scopes!: string[];
}
