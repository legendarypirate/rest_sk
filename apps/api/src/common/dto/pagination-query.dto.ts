import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  ALL_DATA,
  DEFAULT_LIMIT,
  DEFAULT_PAGE,
  DEFAULT_SORT_DIRECTION,
  MAX_LIMIT,
  type PageLimit,
  type SortDirection,
} from '@packages/constants';
import { Transform, Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsOptional,
  Max,
  Min,
  ValidateIf,
} from 'class-validator';

export class PaginationQueryDto {
  @ApiPropertyOptional({ type: Number, example: DEFAULT_PAGE })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({
    type: String,
    example: String(DEFAULT_LIMIT),
    description: `Page size (1–${MAX_LIMIT}), or "${ALL_DATA}" to return every row`,
  })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => {
    if (value === undefined || value === null || value === '') {
      return undefined;
    }
    if (value === ALL_DATA) {
      return ALL_DATA;
    }
    return Number(value);
  })
  @ValidateIf((_, value) => value !== ALL_DATA)
  @IsInt()
  @Min(1)
  @Max(MAX_LIMIT)
  limit?: PageLimit;

  @ApiPropertyOptional({
    type: String,
    enum: ['asc', 'desc'],
    example: DEFAULT_SORT_DIRECTION,
  })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortDirection?: SortDirection;
}
