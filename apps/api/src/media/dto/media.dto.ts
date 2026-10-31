import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MediaUploadStatus } from '@generated/prisma/client';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

import { PaginationQueryDto } from '@/common/dto/pagination-query.dto';
import { parseQueryBoolean } from '@/common/utils/transform';

const MEDIA_SORT_FIELDS = ['createdAt', 'updatedAt', 'originalFilename'] as const;

function trimString({ value }: { value: unknown }) {
  if (typeof value !== 'string') {
    return value;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export class ListMediaQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MaxLength(255)
  search?: string;

  @ApiPropertyOptional({ enum: MediaUploadStatus })
  @IsOptional()
  @IsEnum(MediaUploadStatus)
  status?: MediaUploadStatus;

  @ApiPropertyOptional({ enum: MEDIA_SORT_FIELDS })
  @IsOptional()
  @IsIn(MEDIA_SORT_FIELDS)
  sortBy?: (typeof MEDIA_SORT_FIELDS)[number];

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(parseQueryBoolean)
  @IsBoolean()
  includeDeleted?: boolean;
}

export class UpdateMediaDto {
  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => {
    if (value === null) {
      return null;
    }
    return trimString({ value });
  })
  @IsString()
  @MaxLength(300)
  altText?: string | null;
}

export class UploadMediaFieldsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => String)
  @Transform(trimString)
  @IsString()
  @MaxLength(300)
  altText?: string;
}
