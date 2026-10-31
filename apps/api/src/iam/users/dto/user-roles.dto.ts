import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayUnique,
  IsArray,
  IsISO8601,
  IsOptional,
  IsUUID,
  ValidateNested,
} from 'class-validator';

export class AssignUserRoleDto {
  @ApiProperty()
  @IsUUID()
  roleId!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsISO8601()
  expiresAt?: string;
}

export class ReplaceUserRoleItemDto {
  @ApiProperty()
  @IsUUID()
  roleId!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsISO8601()
  expiresAt?: string;
}

export class ReplaceUserRolesDto {
  @ApiProperty({ type: [ReplaceUserRoleItemDto] })
  @IsArray()
  @ArrayUnique((item: ReplaceUserRoleItemDto) => item.roleId)
  @ValidateNested({ each: true })
  @Type(() => ReplaceUserRoleItemDto)
  assignments!: ReplaceUserRoleItemDto[];
}
