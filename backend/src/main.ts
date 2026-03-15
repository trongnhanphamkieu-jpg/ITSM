import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import compression from 'compression';
import { AppModule } from './app.module';
import { SanitizePipe } from './common/pipes/sanitize.pipe';

// ── Startup Validation ──
function validateEnv() {
  const required = ['DATABASE_URL', 'JWT_SECRET'];
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length) {
    throw new Error(`Missing required env variables: ${missing.join(', ')}`);
  }

  const recommended = ['JWT_REFRESH_SECRET', 'FRONTEND_URL'];
  const missingRecommended = recommended.filter((key) => !process.env[key]);
  if (missingRecommended.length) {
    const logger = new Logger('Bootstrap');
    logger.warn(`Recommended env variables not set: ${missingRecommended.join(', ')}`);
  }
}

async function bootstrap() {
  validateEnv();

  const app = await NestFactory.create(AppModule, {
    rawBody: true,
    bodyParser: true,
  });

  // Increase body size limit for file uploads
  app.use(require('express').json({ limit: '10mb' }));
  app.use(require('express').urlencoded({ extended: true, limit: '10mb' }));

  // Global prefix
  app.setGlobalPrefix('api/v1');

  // ── Security: Helmet ──
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
          fontSrc: ["'self'", 'https://fonts.gstatic.com'],
          imgSrc: ["'self'", 'data:', 'https:'],
          connectSrc: ["'self'", ...(process.env.FRONTEND_URL || 'http://localhost:3000').split(',').map((u: string) => u.trim())],
          frameAncestors: ["'none'"],
          objectSrc: ["'none'"],
        },
      },
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );

  // ── Performance: Compression ──
  app.use(compression({ threshold: 1024 }));

  // ── Security: CORS ──
  const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:3000')
    .split(',')
    .map((o) => o.trim());
  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Content-Disposition'],
    maxAge: 86400,
  });

  // ── Validation + XSS Sanitization ──
  app.useGlobalPipes(
    new SanitizePipe(),
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // ── Swagger (disabled in production) ──
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('ITMS API')
      .setDescription('IT Management System — API Documentation')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }

  const port = process.env.PORT ?? 4000;
  await app.listen(port);

  const logger = new Logger('Bootstrap');
  logger.log(`🚀 ITMS Backend running on http://localhost:${port}`);
  logger.log(`🔒 Security: Helmet + CORS + Rate Limiting + XSS Sanitization active`);
  if (process.env.NODE_ENV !== 'production') {
    logger.log(`📄 Swagger docs: http://localhost:${port}/api/docs`);
  }
}
bootstrap();
