import { Logger, UseFilters, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { AppErrorCode, holdsAllPermissions, PLATFORM_SUPER_ADMIN_SLUG } from '@packages/types';

import {
  AppException,
  localeFromHeaders,
  translatedMessage,
  UnauthorizedAppException,
} from '@/common/exceptions';
import { AuthQueryService } from '../iam/auth.query.service';
import { primaryRole, type AuthenticatedUser } from '../iam/auth.types';
import { Public } from '../iam/decorators/public.decorator';
import { ConnectionRegistryService } from './connection-registry.service';
import { WsExceptionFilter } from './filters/ws-exception.filter';
import { WsAuthGuard } from './guards/ws-auth.guard';
import { RealtimeService } from './realtime.service';
import {
  CLIENT_EVENTS,
  REALTIME_NAMESPACE,
  Rooms,
  SERVER_EVENTS,
  isKitchenRole,
  isStaffRole,
  type AppServer,
  type AppSocket,
  type WsAck,
} from './types/realtime.types';
import { extractWsToken } from './utils/ws-token';

@Public()
@UseFilters(WsExceptionFilter)
@WebSocketGateway({
  namespace: REALTIME_NAMESPACE,
  transports: ['websocket', 'polling'],
  allowUpgrades: true,
})
export class RealtimeGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(RealtimeGateway.name);
  private readonly pingLimit: number;
  private readonly pingWindowMs: number;
  private readonly pingWindows = new Map<string, number[]>();

  @WebSocketServer()
  private readonly server!: AppServer;

  constructor(
    private readonly authQuery: AuthQueryService,
    private readonly realtime: RealtimeService,
    private readonly registry: ConnectionRegistryService,
    config: ConfigService,
  ) {
    this.pingLimit = config.get<number>('realtime.pingRateLimit') ?? 30;
    this.pingWindowMs =
      config.get<number>('realtime.pingRateWindowMs') ?? 60_000;
  }

  afterInit(server: AppServer): void {
    this.realtime.bindServer(server);

    server.use((socket: AppSocket, next: (err?: Error) => void) => {
      this.authenticateSocket(socket)
        .then(() => next())
        .catch((error: unknown) => {
          const code =
            error instanceof AppException
              ? error.code
              : AppErrorCode.UNAUTHORIZED;
          next(new Error(code));
        });
    });

    this.logger.log(
      `Realtime gateway ready on namespace ${REALTIME_NAMESPACE}`,
    );
  }

  private async authenticateSocket(socket: AppSocket): Promise<void> {
    const token = extractWsToken(socket);
    if (!token) {
      throw new UnauthorizedAppException();
    }

    const user: AuthenticatedUser =
      await this.authQuery.authenticateAccessToken(token);
    socket.data.user = user;
  }

  async handleConnection(client: AppSocket): Promise<void> {
    const user = client.data.user;
    if (!user) {
      client.disconnect(true);
      return;
    }

    const role = primaryRole(user);
    const rooms: string[] = [Rooms.user(user.id), Rooms.role(role)];
    await client.join(Rooms.user(user.id));
    await client.join(Rooms.role(role));

    if (isKitchenRole(role)) {
      rooms.push(Rooms.kitchen());
      await client.join(Rooms.kitchen());
    }

    if (isStaffRole(role)) {
      rooms.push(Rooms.staff());
      await client.join(Rooms.staff());
    }

    const canReadMealOrders =
      user.roles.includes(PLATFORM_SUPER_ADMIN_SLUG) ||
      holdsAllPermissions(user.permissions) ||
      user.permissions.includes('platform:employee-meal-orders:read');
    if (canReadMealOrders) {
      rooms.push(Rooms.employeeMealOrders());
      await client.join(Rooms.employeeMealOrders());
    }

    this.registry.register({
      socketId: client.id,
      userId: user.id,
      role,
      connectedAt: new Date().toISOString(),
    });

    client.emit(SERVER_EVENTS.connected, {
      userId: user.id,
      role,
      rooms,
      serverTime: new Date().toISOString(),
    });

    this.logger.log(
      `Socket connected ${client.id} (user=${user.id} role=${role}) rooms=${rooms.join(',')}`,
    );
  }

  handleDisconnect(client: AppSocket): void {
    this.pingWindows.delete(client.id);

    const userId = client.data.user?.id;
    this.registry.unregister(client.id);

    const userLabel = userId ? `user=${userId}` : 'user=unknown';
    this.logger.log(`Socket disconnected ${client.id} (${userLabel})`);
  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage(CLIENT_EVENTS.ping)
  ping(client: AppSocket): WsAck<{ at: string }> {
    if (!this.allowPing(client)) {
      const code = AppErrorCode.RATE_LIMITED;
      const locale = localeFromHeaders(client.handshake.headers);
      return {
        success: false,
        error: {
          code,
          message: translatedMessage(code, locale),
          event: CLIENT_EVENTS.ping,
        },
      };
    }

    const at = new Date().toISOString();
    client.emit(SERVER_EVENTS.pong, { at });
    return { success: true, data: { at } };
  }

  private allowPing(client: AppSocket): boolean {
    const now = Date.now();
    const windowStart = now - this.pingWindowMs;
    const pingWindow = this.pingWindows.get(client.id) ?? [];
    const recent = pingWindow.filter((timestamp) => timestamp >= windowStart);

    if (recent.length >= this.pingLimit) {
      this.pingWindows.set(client.id, recent);
      return false;
    }

    this.pingWindows.set(client.id, [...recent, now]);
    return true;
  }
}
