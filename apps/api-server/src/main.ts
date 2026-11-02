import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import * as express from 'express';
import * as path from 'node:path';
import { AppModule } from './app/app.module';
import { HttpExceptionFilter } from './app/http-exception.filter';

function getUploadsDir(): string {
  return process.env.UPLOADS_DIR
    ? path.resolve(process.env.UPLOADS_DIR)
    : path.resolve(process.cwd(), 'uploads');
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  // Serve local uploads under /api/uploads/*
  app.use('/api/uploads', express.static(getUploadsDir()));
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidUnknownValues: false,
    }),
  );
  app.enableCors({ origin: true });
  const port = process.env.PORT || 3000;
  await app.listen(port);
}

bootstrap();
