import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import { REFRESH_TOKEN_COOKIE_NAME } from './auth/constants/auth.constants';
import { AppModule } from './app.module';
import { join } from 'node:path';
import { NestExpressApplication } from '@nestjs/platform-express/interfaces/nest-express-application.interface';

async function bootstrap() {
   const app = await NestFactory.create<NestExpressApplication>(AppModule);

   if (shouldTrustProxy()) {
      app.set('trust proxy', 1);
   }

   app.setGlobalPrefix('api');
   app.use(cookieParser());
   app.useGlobalPipes(
      new ValidationPipe({
         transform: true,
         whitelist: true,
         forbidNonWhitelisted: true,
      }),
   );

   app.useStaticAssets(join(process.cwd(), 'uploads'), {
      prefix: '/uploads',
   });

   const swaggerConfig = new DocumentBuilder()
      .setTitle('Gym App API')
      .setDescription(
         'Documentacion de la API para autenticacion y gestion de usuarios y ejercicios.',
      )
      .setVersion('1.0.0')
      .addBearerAuth()
      .addCookieAuth(REFRESH_TOKEN_COOKIE_NAME)
      .build();

   const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
   SwaggerModule.setup('docs', app, swaggerDocument, {
      useGlobalPrefix: false,
      jsonDocumentUrl: 'docs-json',
      yamlDocumentUrl: 'docs-yaml',
   });

   await app.listen(process.env.PORT ?? 3000);
}

/**
 * Decide si Express debe confiar en el proxy frontal para resolver la IP real
 * del cliente, necesaria para que el rate limiting funcione correctamente en
 * producción detrás de balanceadores o plataformas gestionadas.
 */
function shouldTrustProxy() {
   const configuredValue = process.env.TRUST_PROXY?.trim().toLowerCase();

   if (configuredValue === 'true' || configuredValue === '1') {
      return true;
   }

   if (configuredValue === 'false' || configuredValue === '0') {
      return false;
   }

   return process.env.NODE_ENV === 'production';
}

void bootstrap();
