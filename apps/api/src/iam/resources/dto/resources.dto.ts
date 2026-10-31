import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PermissionScope } from '@generated/prisma/client';
import { Transform, Type } from 'class-transformer';
import {
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';
import { parseQueryBoolean } from '@/common/utils/transform';

const RESOURCE_SORT_FIELDS = [
  'createdAt',
  'updatedAt',
  'name',
  'slug',
  'sortOrder',
  'groupSortOrder',
] as const;

function trimString({ value }: { value: unknown }) {
  if (typeof value !== 'string') {
    return value;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function trimSlug({ value }: { value: unknown }) {
  if (typeof value !== 'string') {
    return value;
  }
  const trimmed = value.trim().toLowerCase();
  return trimmed.length > 0 ? trimmed : undefined;
}

export class ListResourcesQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MaxLength(200)
  search?: string;

  @ApiPropertyOptional({ enum: PermissionScope })
  @IsOptional()
  @IsEnum(PermissionScope)
  scope?: PermissionScope;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(parseQueryBoolean)
  @IsBoolean()
  isSystem?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(parseQueryBoolean)
  @IsBoolean()
  isMenu?: boolean;

  @ApiPropertyOptional({ enum: RESOURCE_SORT_FIELDS })
  @IsOptional()
  @IsIn(RESOURCE_SORT_FIELDS)
  sortBy?: (typeof RESOURCE_SORT_FIELDS)[number];

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => value === true || value === 'true')
  @IsBoolean()
  includeDeleted?: boolean;
}

export class ResourceActionInputDto {
  @ApiProperty({ example: 'read' })
  @Transform(trimSlug)
  @Matches(/^[a-z][a-z0-9_]{1,31}$/)
  action!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MaxLength(120)
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isDangerous?: boolean;
}

export class CreateResourceDto {
  @ApiProperty({ example: 'jobs' })
  @Transform(trimSlug)
  @Matches(/^[a-z][a-z0-9_]{1,62}$/)
  slug!: string;

  @ApiProperty()
  @Transform(trimString)
  @IsString()
  @MaxLength(100)
  name!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiPropertyOptional({ enum: PermissionScope, default: PermissionScope.PLATFORM })
  @IsOptional()
  @IsEnum(PermissionScope)
  scope?: PermissionScope;

  @ApiPropertyOptional({ example: '/jobs' })
  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MaxLength(255)
  path?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MaxLength(64)
  icon?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MaxLength(64)
  groupKey?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MaxLength(100)
  groupLabel?: string;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(10_000)
  groupSortOrder?: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(10_000)
  sortOrder?: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isMenu?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  menuExact?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  parentId?: string;

  @ApiPropertyOptional({ type: [ResourceActionInputDto] })
  @IsOptional()
  @IsArray()
  @ArrayUnique((item: ResourceActionInputDto) => item.action)
  @ValidateNested({ each: true })
  @Type(() => ResourceActionInputDto)
  actions?: ResourceActionInputDto[];
}

export class UpdateResourceDto {
  @ApiPropertyOptional()
  @IsOptional()
  @Transform(trimSlug)
  @Matches(/^[a-z][a-z0-9_]{1,62}$/)
  slug?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MaxLength(2000)
  description?: string | null;

  @ApiPropertyOptional({ enum: PermissionScope })
  @IsOptional()
  @IsEnum(PermissionScope)
  scope?: PermissionScope;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MaxLength(255)
  path?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MaxLength(64)
  icon?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MaxLength(64)
  groupKey?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MaxLength(100)
  groupLabel?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(10_000)
  groupSortOrder?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(10_000)
  sortOrder?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isMenu?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  menuExact?: boolean;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsUUID()
  parentId?: string | null;

  @ApiPropertyOptional({ type: [ResourceActionInputDto] })
  @IsOptional()
  @IsArray()
  @ArrayUnique((item: ResourceActionInputDto) => item.action)
  @ValidateNested({ each: true })
  @Type(() => ResourceActionInputDto)
  actions?: ResourceActionInputDto[];
}
