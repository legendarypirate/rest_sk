import type { INestApplication } from '@nestjs/common';
import type { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { Logger } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient, type RedisClientType } from 'redis';
import type { Server, ServerOptions } from 'socket.io';

export type RealtimeAdapterOptions = {
  pingInterval: number;
  pingTimeout: number;
  connectTimeout: number;
  maxHttpBufferSize: number;
};

type RedisConn = RedisClientType;

export class RealtimeIoAdapter extends IoAdapter {
  protected readonly logger = new Logger(RealtimeIoAdapter.name);
  private adapterConstructor: ReturnType<typeof createAdapter> | null = null;
  private pubClient: RedisConn | null = null;
  private subClient: RedisConn | null = null;

  constructor(
    app: INestApplication,
    private readonly cors: CorsOptions,
    private readonly socketOptions: RealtimeAdapterOptions,
  ) {
    super(app);
  }

  async connectToRedis(redisUrl: string, timeoutMs = 5_000): Promise<void> {
    const pubClient = createClient({
      url: redisUrl,
      socket: {
        connectTimeout: timeoutMs,
        reconnectStrategy: () => false,
      },
    });
    const subClient = pubClient.duplicate();

    try {
      await Promise.race([
        Promise.all([pubClient.connect(), subClient.connect()]),
        new Promise<never>((_, reject) => {
          setTimeout(() => {
            reject(
              new Error(`Redis connection timed out after ${timeoutMs}ms`),
            );
          }, timeoutMs);
        }),
      ]);
    } catch (error) {
      pubClient.removeAllListeners();
      subClient.removeAllListeners();
      await Promise.allSettled([
        pubClient.disconnect(),
        subClient.disconnect(),
      ]);
      throw error;
    }

    pubClient.on('error', (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Redis pub client error: ${message}`);
    });
    subClient.on('error', (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Redis sub client error: ${message}`);
    });

    this.pubClient = pubClient;
    this.subClient = subClient;
    this.adapterConstructor = createAdapter(pubClient, subClient);

    this.logger.log('Socket.IO Redis adapter connected');
  }

  createIOServer(port: number, options?: ServerOptions): Server {
    const { path, ...rest } = options ?? { path: '/socket.io/' };

    const server = super.createIOServer(port, {
      ...rest,
      path: path ?? '/socket.io/',
      cors: {
        origin: this.cors.origin ?? true,
        credentials: this.cors.credentials ?? true,
        methods: this.cors.methods,
        allowedHeaders: this.cors.allowedHeaders,
      },
      allowEIO3: true,
      pingInterval: this.socketOptions.pingInterval,
      pingTimeout: this.socketOptions.pingTimeout,
      connectTimeout: this.socketOptions.connectTimeout,
      maxHttpBufferSize: this.socketOptions.maxHttpBufferSize,
    } as ServerOptions) as Server;

    if (this.adapterConstructor) {
      server.adapter(this.adapterConstructor);
    }

    return server;
  }

  async closeRedis(): Promise<void> {
    await Promise.allSettled([
      this.pubClient?.disconnect(),
      this.subClient?.disconnect(),
    ]);
    this.pubClient = null;
    this.subClient = null;
    this.adapterConstructor = null;
  }
}
