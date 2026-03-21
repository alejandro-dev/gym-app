import { UserRole } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
	IsDateString,
	IsEmail,
	IsEnum,
	IsNumber,
	IsOptional,
	IsString,
	MinLength,
} from 'class-validator';

/**
 * Datos necesarios para crear un usuario.
 * Refleja los campos disponibles en el modelo `User` de Prisma.
 */
export class CreateUserDto {
	@ApiProperty({ example: 'alex@example.com' })
	/** Correo unico del usuario. */
	@IsEmail()
	email!: string;

	@ApiPropertyOptional({ example: 'alexfit' })
	/** Nombre de usuario unico opcional. */
	@IsOptional()
	@IsString()
	username?: string;

	@ApiProperty({ example: 'hashed-password-value' })
	/** Hash de la contrasena almacenado en base de datos. */
	@IsString()
	@MinLength(10)
	passwordHash!: string;

	@ApiPropertyOptional({ example: 'Alex' })
	/** Nombre del usuario. */
	@IsOptional()
	@IsString()
	firstName?: string;

	@ApiPropertyOptional({ example: 'Garcia' })
	/** Apellidos del usuario. */
	@IsOptional()
	@IsString()
	lastName?: string;

	@ApiPropertyOptional({ enum: UserRole, example: UserRole.USER })
	/** Rol del usuario dentro de la aplicacion. */
	@IsOptional()
	@IsEnum(UserRole)
	role?: UserRole;

	@ApiPropertyOptional({ example: 78.5 })
	/** Peso del usuario en kilogramos. */
	@IsOptional()
	@IsNumber()
	weightKg?: number;

	@ApiPropertyOptional({ example: 180 })
	/** Altura del usuario en centimetros. */
	@IsOptional()
	@IsNumber()
	heightCm?: number;

	@ApiPropertyOptional({ example: '1995-06-20T00:00:00.000Z' })
	/** Fecha de nacimiento en formato ISO. */
	@IsOptional()
	@IsDateString()
	birthDate?: string;
}
