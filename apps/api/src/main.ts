import {
  Logger,
  RequestMethod,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import type { Server as HttpServer } from 'node:http';
import { AppModule } from './app.module';
import { getCorsConfig } from './common/utils/cors';
import { getLogLevels } from './common/utils/logger';
import { RealtimeIoAdapter } from './realtime/adapters/realtime-io.adapter';

type SwaggerParameterSchema = {
  type?: string;
  properties?: unknown;
  items?: unknown;
  oneOf?: unknown;
  anyOf?: unknown;
  $ref?: string;
};

type SwaggerParameter = {
  in?: string;
  schema?: SwaggerParameterSchema;
};

function normalizeSwaggerParamSchema(schema: SwaggerParameterSchema | undefined) {
  if (!schema || schema.$ref) {
    return;
  }
  if (schema.oneOf || schema.anyOf) {
    schema.type = 'string';
    delete schema.oneOf;
    delete schema.anyOf;
    return;
  }
  if (schema.type === 'object' && schema.properties) {
    return;
  }
  if (!schema.type || schema.type === 'object' || schema.type === 'array') {
    schema.type = 'string';
    delete schema.items;
  }
}

function normalizeSwaggerParameters(parameters: SwaggerParameter[] | undefined) {
  for (const param of parameters ?? []) {
    if (param.in !== 'query' && param.in !== 'header' && param.in !== 'path') {
      continue;
    }
    if (!param.schema) {
      param.schema = { type: 'string' };
      continue;
    }
    normalizeSwaggerParamSchema(param.schema);
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  const config = app.get(ConfigService);
  const nodeEnv = config.get<string>('app.nodeEnv') ?? 'development';
  const isProduction = nodeEnv === 'production';

  app.useLogger(getLogLevels(nodeEnv));

  const cors = getCorsConfig(
    config.get<string[]>('cors.origins') ?? [],
    isProduction,
  );

  const wsAdapter = new RealtimeIoAdapter(app, cors, {
    pingInterval: config.get<number>('realtime.pingInterval') ?? 25_000,
    pingTimeout: config.get<number>('realtime.pingTimeout') ?? 20_000,
    connectTimeout: config.get<number>('realtime.connectTimeout') ?? 45_000,
    maxHttpBufferSize: config.get<number>('realtime.maxHttpBufferSize') ?? 1e6,
  });

  const redisUrl = config.get<string>('realtime.redisUrl');
  const bootstrapLogger = new Logger('Bootstrap');

  if (redisUrl) {
    try {
      await wsAdapter.connectToRedis(redisUrl);
      bootstrapLogger.log('Realtime Redis adapter enabled');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown Redis error';
      bootstrapLogger.warn(
        `Realtime Redis adapter unavailable — running single-instance mode (${message})`,
      );
    }
  }

  app.use(cookieParser());
  app.use(
    helmet({
      contentSecurityPolicy: isProduction ? undefined : false,
      crossOriginEmbedderPolicy: false,
    }),
  );
  app.enableCors(cors);
  app.useWebSocketAdapter(wsAdapter);
  app.enableShutdownHooks();
  app.setGlobalPrefix('api', {
    exclude: [{ path: 'health', method: RequestMethod.GET }],
  });
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const swaggerEnabled = config.get<boolean>('app.swaggerEnabled') ?? false;

  if (swaggerEnabled) {
    const document = SwaggerModule.createDocument(
      app,
      new DocumentBuilder()
        .setTitle('Restaurant API')
        .setDescription('Restaurant platform API')
        .setVersion('1')
        .addBearerAuth()
        .build(),
    );
    for (const pathItem of Object.values(document.paths ?? {})) {
      if (!pathItem) continue;
      normalizeSwaggerParameters(
        (pathItem as { parameters?: SwaggerParameter[] }).parameters,
      );
      for (const [method, operation] of Object.entries(pathItem)) {
        if (
          method === 'parameters' ||
          !operation ||
          typeof operation !== 'object' ||
          Array.isArray(operation)
        ) {
          continue;
        }
        const publicOp = operation as {
          security?: unknown[];
          'x-public'?: boolean;
          parameters?: SwaggerParameter[];
        };
        if (publicOp['x-public']) {
          publicOp.security = [];
          delete publicOp['x-public'];
        }
        normalizeSwaggerParameters(publicOp.parameters);
      }
    }
    SwaggerModule.setup('docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
      },
    });
  }

  const port = config.get<number>('app.port') ?? 4004;
  await app.listen(port);

  const httpServer = app.getHttpAdapter().getHttpServer() as HttpServer;
  httpServer.on('close', () => {
    void wsAdapter.closeRedis();
  });

  const logger = new Logger('Bootstrap');
  logger.log(`API http://localhost:${port}/api/v1`);
  logger.log(`Realtime ws://localhost:${port}/realtime`);
  if (swaggerEnabled) {
    logger.log(`Swagger http://localhost:${port}/docs`);
  }
}

void bootstrap();
