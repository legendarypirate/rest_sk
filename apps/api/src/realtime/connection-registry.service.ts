import { Injectable } from '@nestjs/common';

export type RealtimeStats = {
  namespace: string;
  connections: number;
  uniqueUsers: number;
  redisEnabled: boolean;
  startedAt: string;
};

export type ConnectedClientMeta = {
  socketId: string;
  userId: string;
  role: string;
  connectedAt: string;
};

@Injectable()
export class ConnectionRegistryService {
  readonly startedAt = new Date().toISOString();

  private readonly clients = new Map<string, ConnectedClientMeta>();
  private redisEnabled = false;

  register(client: ConnectedClientMeta): void {
    this.clients.set(client.socketId, client);
  }

  unregister(socketId: string): void {
    this.clients.delete(socketId);
  }

  setRedisEnabled(enabled: boolean): void {
    this.redisEnabled = enabled;
  }

  getConnectionCount(): number {
    return this.clients.size;
  }

  getUniqueUserCount(): number {
    return new Set([...this.clients.values()].map((client) => client.userId))
      .size;
  }

  isRedisEnabled(): boolean {
    return this.redisEnabled;
  }

  getStats(): RealtimeStats {
    return {
      namespace: '/realtime',
      connections: this.getConnectionCount(),
      uniqueUsers: this.getUniqueUserCount(),
      redisEnabled: this.isRedisEnabled(),
      startedAt: this.startedAt,
    };
  }
}
