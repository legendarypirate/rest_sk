import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ApiBearerAuth,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import {
  AUTH_REFRESH_COOKIE,
  parseDurationMs,
  type AuthenticatedResponse,
  type AuthLoginResponse,
  type AuthSession,
  type AuthUser,
  type BackupCodesResponse,
  type TotpSetupResponse,
} from '@packages/auth';
import type { Request, Response } from 'express';

import { clearAuthCookies, setAuthCookies } from './auth-cookies';
import { authRequestContext } from './auth-request.context';
import { AuthCommandService } from './auth.command.service';
import { AuthQueryService } from './auth.query.service';
import type { AuthenticatedUser } from './auth.types';
import {
  AllowMustChangePassword,
  Public,
} from './decorators/auth.decorators';
import { CurrentUser } from './decorators/current-user.decorator';
import {
  EmailResendDto,
  EmailVerifyDto,
  LoginDto,
  LogoutDto,
  MfaDisableDto,
  MfaTotpConfirmDto,
  MfaVerifyDto,
  PasswordChangeDto,
  PasswordForgotDto,
  PasswordResetDto,
  RefreshDto,
  RegisterDto,
} from './dto/auth.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly commands: AuthCommandService,
    private readonly queries: AuthQueryService,
    private readonly config: ConfigService,
  ) {}

  @Public()
  @Throttle({ default: { limit: 8, ttl: 60_000 } })
  @Post('login')
  async login(
    @Body() body: LoginDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthLoginResponse> {
    const result = await this.commands.login(
      body,
      authRequestContext(request, body.fingerprint),
    );

    if (!result.mfaRequired) {
      this.attachCookies(response, result);
    }

    return result;
  }

  @Public()
  @Throttle({ default: { limit: 8, ttl: 60_000 } })
  @Post('mfa/verify')
  async verifyMfa(
    @Body() body: MfaVerifyDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthenticatedResponse> {
    const result = await this.commands.verifyMfa(
      body,
      authRequestContext(request),
    );
    this.attachCookies(response, result);
    return result;
  }

  @Public()
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  @Post('refresh')
  async refresh(
    @Body() body: RefreshDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthenticatedResponse> {
    const result = await this.commands.refresh(
      body.refreshToken ?? cookieValue(request, AUTH_REFRESH_COOKIE),
      authRequestContext(request),
    );
    this.attachCookies(response, result);
    return result;
  }

  @AllowMustChangePassword()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  @Post('logout')
  async logout(
    @Body() body: LogoutDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    await this.commands.logout(
      user,
      body.everywhere === true,
      authRequestContext(request),
    );
    clearAuthCookies(response, this.cookieOptions());
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  @Post('register')
  async register(
    @Body() body: RegisterDto,
    @Req() request: Request,
  ): Promise<void> {
    await this.commands.register(body, authRequestContext(request));
  }

  @AllowMustChangePassword()
  @ApiBearerAuth()
  @Get('me')
  async me(@CurrentUser() user: AuthenticatedUser): Promise<AuthUser> {
    return this.queries.getMe(user);
  }

  @AllowMustChangePassword()
  @ApiBearerAuth()
  @Get('sessions')
  async sessions(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<AuthSession[]> {
    return this.queries.listSessions(user);
  }

  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  @Delete('sessions/:id')
  async revokeSession(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
    @Req() request: Request,
  ): Promise<void> {
    await this.commands.revokeSession(user, id, authRequestContext(request));
  }

  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  @Post('sessions/revoke-others')
  async revokeOtherSessions(
    @CurrentUser() user: AuthenticatedUser,
    @Req() request: Request,
  ): Promise<void> {
    await this.commands.revokeOtherSessions(user, authRequestContext(request));
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  @Post('password/forgot')
  async forgotPassword(
    @Body() body: PasswordForgotDto,
    @Req() request: Request,
  ): Promise<void> {
    await this.commands.requestPasswordReset(body, authRequestContext(request));
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  @Post('password/reset')
  async resetPassword(
    @Body() body: PasswordResetDto,
    @Req() request: Request,
  ): Promise<void> {
    await this.commands.confirmPasswordReset(body, authRequestContext(request));
  }

  @AllowMustChangePassword()
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  @Post('password/change')
  async changePassword(
    @Body() body: PasswordChangeDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() request: Request,
  ): Promise<void> {
    await this.commands.changePassword(user, body, authRequestContext(request));
  }

  @Public()
  @Throttle({ default: { limit: 8, ttl: 60_000 } })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  @Post('email/verify')
  async verifyEmail(
    @Body() body: EmailVerifyDto,
    @Req() request: Request,
  ): Promise<void> {
    await this.commands.verifyEmail(body, authRequestContext(request));
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  @Post('email/resend')
  async resendEmail(
    @Body() body: EmailResendDto,
    @Req() request: Request,
  ): Promise<void> {
    await this.commands.resendEmailVerification(
      body,
      authRequestContext(request),
    );
  }

  @ApiBearerAuth()
  @ApiOkResponse()
  @Post('mfa/totp/setup')
  async setupTotp(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<TotpSetupResponse> {
    return this.commands.setupTotp(user);
  }

  @ApiBearerAuth()
  @Post('mfa/totp/confirm')
  async confirmTotp(
    @Body() body: MfaTotpConfirmDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<BackupCodesResponse> {
    return this.commands.confirmTotp(user, body);
  }

  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  @Post('mfa/disable')
  async disableMfa(
    @Body() body: MfaDisableDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() request: Request,
  ): Promise<void> {
    await this.commands.disableMfa(user, body, authRequestContext(request));
  }

  private attachCookies(
    response: Response,
    result: AuthenticatedResponse,
  ): void {
    setAuthCookies(response, result.tokens, this.cookieOptions());
  }

  private cookieOptions() {
    return {
      secure: this.config.get<boolean>('auth.cookieSecure') ?? false,
      domain: this.config.get<string>('auth.cookieDomain'),
      accessMaxAgeMs: parseDurationMs(
        this.config.get<string>('auth.jwtExpiresIn') ?? '15m',
      ),
      refreshMaxAgeMs: parseDurationMs(
        this.config.get<string>('auth.jwtRefreshExpiresIn') ?? '7d',
      ),
    };
  }
}

function cookieValue(request: Request, name: string): string | undefined {
  const value = request.cookies?.[name];
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}
