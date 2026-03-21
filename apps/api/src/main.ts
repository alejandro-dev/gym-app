import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import { REFRESH_TOKEN_COOKIE_NAME } from './auth/constants/auth.constants';
import { AppModule } from './app.module';

async function bootstrap() {
  	const app = await NestFactory.create(AppModule);
	app.use(cookieParser());
	app.useGlobalPipes(
		new ValidationPipe({
			transform: true,
			whitelist: true,
			forbidNonWhitelisted: true,
		}),
	);

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
	SwaggerModule.setup('docs', app, swaggerDocument);

  	await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
