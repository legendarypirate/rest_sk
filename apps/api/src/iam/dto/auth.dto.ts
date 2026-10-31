import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  AUTH_PASSWORD_MAX_LENGTH,
  AUTH_PASSWORD_MIN_LENGTH,
} from '@packages/auth';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

const strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[\s\S]+$/;

export class LoginDto {
  @ApiProperty({ example: 'admin@food-order.local' })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty()
  @MaxLength(320)
  identifier!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(AUTH_PASSWORD_MAX_LENGTH)
  password!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(8, 128)
  fingerprint?: string;
}

export class RefreshDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(16)
  @MaxLength(512)
  refreshToken?: string;
}

export class LogoutDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  everywhere?: boolean;
}

export class RegisterDto {
  @ApiProperty({ example: 'candidate@food-order.local' })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail()
  @MaxLength(320)
  email!: string;

  @ApiProperty()
  @IsString()
  @MinLength(AUTH_PASSWORD_MIN_LENGTH)
  @MaxLength(AUTH_PASSWORD_MAX_LENGTH)
  @Matches(strongPassword)
  password!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  firstName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  lastName?: string;
}

export class PasswordForgotDto {
  @ApiProperty()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail()
  @MaxLength(320)
  email!: string;
}

export class PasswordResetDto {
  @ApiProperty()
  @IsString()
  @MinLength(16)
  @MaxLength(512)
  token!: string;

  @ApiProperty()
  @IsString()
  @MinLength(AUTH_PASSWORD_MIN_LENGTH)
  @MaxLength(AUTH_PASSWORD_MAX_LENGTH)
  @Matches(strongPassword)
  password!: string;
}

export class PasswordChangeDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(AUTH_PASSWORD_MAX_LENGTH)
  currentPassword!: string;

  @ApiProperty()
  @IsString()
  @MinLength(AUTH_PASSWORD_MIN_LENGTH)
  @MaxLength(AUTH_PASSWORD_MAX_LENGTH)
  @Matches(strongPassword)
  newPassword!: string;
}

export class EmailVerifyDto {
  @ApiProperty()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail()
  @MaxLength(320)
  email!: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  @Matches(/^\d{6}$/)
  code!: string;
}

export class EmailResendDto {
  @ApiProperty()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail()
  @MaxLength(320)
  email!: string;
}

export class MfaVerifyDto {
  @ApiProperty()
  @IsUUID()
  challengeId!: string;

  @ApiProperty()
  @IsString()
  @MinLength(6)
  @MaxLength(64)
  code!: string;
}

export class MfaTotpConfirmDto {
  @ApiProperty({ example: '123456' })
  @IsString()
  @Matches(/^\d{6}$/)
  code!: string;
}

export class MfaDisableDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(AUTH_PASSWORD_MAX_LENGTH)
  password!: string;

  @ApiProperty()
  @IsString()
  @MinLength(6)
  @MaxLength(64)
  code!: string;
}
