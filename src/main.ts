import 'dotenv/config';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { Env } from './common/enum/env.enum';
import { loggerMiddleware } from './core/middleware/logger.middleware';
import { requestIdMiddleware } from './core/middleware/request-id.middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableShutdownHooks();
  app.enableCors({
    origin: true,
    credentials: true,
  });

  app.setGlobalPrefix('api', {
    exclude: ['/', 'health'],
  });
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  app.use(requestIdMiddleware);
  app.use(loggerMiddleware);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('AndYesQo API')
    .setDescription(
      [
        'AndYesQo fleet & operations API',
        '',
        '### Response contract',
        'Success: `{ success, statusCode, message, data, meta, pagination? }`',
        'Error: `{ success:false, statusCode, message, error:{ code, details? }, meta }`',
      ].join('\n'),
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Paste a JWT access token',
      },
      'JWT',
    )
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  const port = process.env[Env.PORT] ?? 3001;
  await app.listen(port);
  console.log(`API base:    http://localhost:${port}/api/v1`);
  console.log(`Swagger UI:  http://localhost:${port}/docs`);
}
void bootstrap();
