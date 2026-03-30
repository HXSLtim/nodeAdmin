import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import fastifyMultipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import { join } from 'node:path';
import { AppModule } from './appModule';
import { UnifiedExceptionFilter } from './filters/unifiedExceptionFilter';
import { runtimeConfig } from './runtimeConfig';
import { startTelemetry } from '../infrastructure/observability/telemetry';

export async function createApp(): Promise<NestFastifyApplication> {
  await startTelemetry();

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      logger: {
        level: process.env.LOG_LEVEL?.trim() || 'info',
      },
      connectionTimeout: runtimeConfig.fastify.connectionTimeout,
      keepAliveTimeout: runtimeConfig.fastify.keepAliveTimeout,
      requestTimeout: runtimeConfig.fastify.requestTimeout,
      bodyLimit: runtimeConfig.fastify.bodyLimit,
      maxParamLength: runtimeConfig.fastify.maxParamLength,
    })
  );

  app.setGlobalPrefix('api/v1', {
    exclude: ['/uploads/(.*)'],
  });

  app.enableCors({
    origin: true,
    credentials: true,
  });

  const fastify = app.getHttpAdapter().getInstance();
  await fastify.register(fastifyMultipart, {
    limits: {
      fileSize: runtimeConfig.upload.maxFileSize,
    },
  });
  await fastify.register(fastifyStatic, {
    root: join(process.cwd(), runtimeConfig.upload.storagePath),
    prefix: '/uploads/',
    decorateReply: false,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    })
  );
  app.useGlobalFilters(new UnifiedExceptionFilter());
  app.enableShutdownHooks();

  if (runtimeConfig.security.enabled) {
    fastify.addHook('onRequest', (_request, reply, done) => {
      reply.header('X-Content-Type-Options', 'nosniff');
      reply.header('X-Frame-Options', 'DENY');
      reply.header('Referrer-Policy', 'same-origin');
      reply.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
      reply.header('Content-Security-Policy', runtimeConfig.security.csp);
      done();
    });
  }

  if (runtimeConfig.swagger.enabled) {
    const config = new DocumentBuilder()
      .setTitle('nodeAdmin API')
      .setDescription('Enterprise multi-tenant SaaS middleware platform API')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }

  return app;
}
