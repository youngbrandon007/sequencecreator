import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import type { AppConfig } from './config/configuration';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = app.get(ConfigService<AppConfig, true>);

  app.useStaticAssets(join(__dirname, '..', 'public'));

  app.enableCors({
    origin: true,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const port = config.get('port', { infer: true });
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`Sequence Creator server listening on http://localhost:${port}`);
  // eslint-disable-next-line no-console
  console.log(`Live demo UI: http://localhost:${port}/`);
  // eslint-disable-next-line no-console
  console.log(`Yjs WebSocket endpoint: ws://localhost:${port}/yjs/:code`);
}

void bootstrap();
