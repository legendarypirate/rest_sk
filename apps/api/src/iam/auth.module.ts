import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { parseDurationMs } from '@packages/auth';

import { AuthCommandService } from './auth.command.service';
import { AuthController } from './auth.controller';
import { NoopAuthNotification } from './auth.notification.noop';
import { AuthNotificationPort } from './auth.notification';
import { AuthQueryService } from './auth.query.service';
import { AuthGuard } from './guards/auth.guard';
import { PermissionsGuard } from './guards/permissions.guard';
import { RolesModule } from './roles/roles.module';
import { ResourcesModule } from './resources/resources.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    UsersModule,
    RolesModule,
    ResourcesModule,
    ThrottlerModule.forRoot({
      throttlers: [{ name: 'default', ttl: 60_000, limit: 120 }],
    }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('auth.jwtSecret'),
        signOptions: {
          expiresIn: Math.floor(
            parseDurationMs(config.get<string>('auth.jwtExpiresIn') ?? '15m') /
              1000,
          ),
          issuer: config.get<string>('auth.jwtIssuer'),
          audience: config.get<string>('auth.jwtAudience'),
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthQueryService,
    AuthCommandService,
    {
      provide: AuthNotificationPort,
      useClass: NoopAuthNotification,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard,
    },
  ],
  exports: [AuthQueryService, AuthCommandService, JwtModule],
})
export class AuthModule {}
