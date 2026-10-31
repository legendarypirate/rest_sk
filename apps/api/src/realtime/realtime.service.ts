import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ConnectionRegistryService,
  type RealtimeStats,
} from './connection-registry.service';
import {
  Rooms,
  SERVER_EVENTS,
  type AppServer,
  type NotificationData,
  type OrgDailyMenuUpdateData,
  type OrgMealOrderUpdateData,
} from './types/realtime.types';
import { createRealtimeEnvelope } from './utils/envelope';

@Injectable()
export class RealtimeService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RealtimeService.name);
  private server: AppServer | null = null;

  constructor(
    private readonly config: ConfigService,
    private readonly registry: ConnectionRegistryService,
  ) {}

  onModuleInit(): void {
    const redisUrl = this.config.get<string>('realtime.redisUrl');
    this.registry.setRedisEnabled(Boolean(redisUrl));
  }

  bindServer(server: AppServer): void {
    this.server = server;
  }

  getStats(): RealtimeStats {
    return this.registry.getStats();
  }

  private get io(): AppServer | null {
    if (!this.server) {
      this.logger.warn('Realtime server not initialized yet; emit skipped');
      return null;
    }
    return this.server;
  }

  private emitToRooms<T>(
    rooms: string[],
    event: (typeof SERVER_EVENTS)[keyof typeof SERVER_EVENTS],
    data: T,
  ): void {
    if (!this.io) {
      return;
    }

    const envelope = createRealtimeEnvelope(data);
    const uniqueRooms = [...new Set(rooms)];

    for (const room of uniqueRooms) {
      this.io.to(room).emit(event, envelope);
    }
  }

  notifyUser(userId: string, notification: NotificationData): void {
    this.emitToRooms(
      [Rooms.user(userId)],
      SERVER_EVENTS.notification,
      notification,
    );
  }

  notifyKitchen(notification: NotificationData): void {
    this.emitToRooms(
      [Rooms.kitchen()],
      SERVER_EVENTS.notification,
      notification,
    );
  }

  notifyStaff(notification: NotificationData): void {
    this.emitToRooms([Rooms.staff()], SERVER_EVENTS.notification, notification);
  }

  emitOrgDailyMenuUpdate(data: OrgDailyMenuUpdateData): void {
    if (!this.io) {
      this.logger.warn(
        `org-daily-menu:updated skipped — realtime server not ready (menu=${data.menuId})`,
      );
      return;
    }

    this.emitToRooms(
      [Rooms.staff(), Rooms.kitchen()],
      SERVER_EVENTS.orgDailyMenuUpdated,
      data,
    );

    this.logger.debug(
      `org-daily-menu:updated → menu=${data.menuId} action=${data.action}`,
    );
  }

  emitOrgMealOrderUpdate(data: OrgMealOrderUpdateData): void {
    if (!this.io) {
      this.logger.warn(
        `org-meal-order:updated skipped — realtime server not ready (order=${data.orderId})`,
      );
      return;
    }

    const rooms = [Rooms.staff(), Rooms.kitchen(), Rooms.employeeMealOrders()];
    if (data.employeeId) {
      rooms.push(Rooms.user(data.employeeId));
    }

    this.emitToRooms(rooms, SERVER_EVENTS.orgMealOrderUpdated, data);

    this.logger.debug(
      `org-meal-order:updated → order=${data.orderId} action=${data.action}`,
    );
  }

  onModuleDestroy(): void {
    if (!this.server) {
      return;
    }

    this.logger.log('Closing realtime socket connections');
    // Gateway binds a namespace server — it has disconnectSockets(), not close().
    // The HTTP server shutdown (enableShutdownHooks) closes the underlying Socket.IO server.
    this.server.disconnectSockets(true);
    this.server = null;
  }
}
