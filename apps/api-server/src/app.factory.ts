import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { Logger } from 'nestjs-pino';
import { resolve } from 'node:path';
import type { ServerOptions } from 'socket.io';
import { AppModule } from './app.module';
import { APP_ENV } from './config/config.module';
import type { Env } from './config/env';

/** Socket.io with the same CORS whitelist as HTTP. */
class CorsIoAdapter extends IoAdapter {
  constructor(
    app: NestExpressApplication,
    private readonly origins: string[],
  ) {
    super(app);
  }
  override createIOServer(port: number, options?: ServerOptions) {
    return super.createIOServer(port, {
      ...options,
      cors: { origin: this.origins, credentials: true },
    });
  }
}

export async function createApp() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
  });
  const env = app.get<Env>(APP_ENV);
  const origins = env.CORS_ORIGINS.split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  app.useLogger(app.get(Logger));
  app.setGlobalPrefix('api');
  app.set('trust proxy', 1);
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.enableCors({ origin: origins, credentials: true });
  app.useWebSocketAdapter(new CorsIoAdapter(app, origins));
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useStaticAssets(resolve(env.UPLOADS_DIR), {
    prefix: '/api/uploads',
    maxAge: '7d',
    index: false,
  });
  app.enableShutdownHooks();

  if (env.NODE_ENV !== 'production') {
    const doc = new DocumentBuilder()
      .setTitle('NovaLimo API')
      .setDescription(
        'REST API cho Web Booking, Web Admin và App Tài xế. Realtime: Socket.io namespace `/realtime`.',
      )
      .setVersion('2.0')
      .addBearerAuth()
      .build();
    SwaggerModule.setup(
      'api/docs',
      app,
      SwaggerModule.createDocument(app, doc),
      {
        swaggerOptions: { persistAuthorization: true, tagsSorter: 'alpha' },
      },
    );
  }
  return { app, env };
}
