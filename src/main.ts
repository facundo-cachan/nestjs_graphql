/**
 * Initializes and starts the NestJS application.
 *
 * @async
 * @function bootstrap
 * @returns {Promise<void>} A promise that resolves when the application is successfully started.
 * @description This function creates a NestJS application instance, starts the server to listen on the specified port (or 3000 by default), and logs the URL where the application is running.
 */

import { join } from 'node:path';
import { readFileSync } from 'node:fs';
import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

import * as dotenv from 'dotenv';
import { AppModule } from './app.module';

import type { SwaggerCustomOptions } from '@nestjs/swagger/dist/interfaces';

// Cargar variables de entorno antes de cualquier uso
dotenv.config();

const globalPrefix = '';
const port = process.env.PORT ? Number(process.env.PORT) : 3000;
const msPort = process.env.MS_PORT ? Number(process.env.MS_PORT) : 3001;
const host = process.env.HOST || 'localhost';

// Configuración de Swagger
const config = new DocumentBuilder()
  .setTitle('APP API')
  .setDescription('API documentation for APP application')
  .setVersion('1.0')
  .addBearerAuth()
  .build();
const myCustom: SwaggerCustomOptions = {
  customSiteTitle: 'Swagger dark mode',
  customCss: readFileSync(
    join(process.cwd(), 'src', 'SwaggerDark.css'),
    'utf8',
  ),
  swaggerOptions: {
    docExpansion: 'none',
    apisSorter: 'alpha',
  },
};

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix(globalPrefix);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true, // Habilitar transformación automática de tipos
    }),
  );

  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://0.0.0.0:3000',
      process.env.API_URL || '',
    ].filter(Boolean),
    credentials: true,
  });

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, myCustom);

  await app.listen(port, host);

  Logger.log(
    `🚀 APP HTTP está corriendo en: http://${host}:${port}/${globalPrefix}`,
  );
  Logger.log(
    `🦾 APP Microservicio (TCP) está corriendo en el puerto: ${msPort}`,
  );
  Logger.log(`📖 Documentación disponible en: http://${host}:${port}/api`);
  Logger.log(`📖 GraphQL disponible en: http://${host}:${port}/graphql`);
}

bootstrap().catch((err) => {
  Logger.error('❌ Error iniciando la aplicación:', err);
  process.exit(1);
});
