import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import fastifyMultipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import { join } from 'node:path';
import { AppModule } from './app/appModule';
import { UnifiedExceptionFilter } from './app/filters/unifiedExceptionFilter';
import { runtimeConfig } from './app/runtimeConfig';
import { startTelemetry, stopTelemetry } from './infrastructure/observability/telemetry';

async function bootstrap(): Promise<void> {
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
    origin: runtimeConfig.corsOrigins,
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

  await app.listen(runtimeConfig.port, '0.0.0.0');

  const shutdown = async (): Promise<void> => {
    await stopTelemetry();
  };

  process.on('SIGTERM', () => {
    void shutdown();
  });
  process.on('SIGINT', () => {
    void shutdown();
  });
}

void bootstrap();
