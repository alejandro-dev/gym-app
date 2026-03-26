import { UserRole } from '@prisma/client';
import { ApiPropertyOptional } from '@nestjs/swagger';
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
 * Datos permitidos para actualizar un usuario.
 * Todos los campos son opcionales para soportar updates parciales.
 */
export class UpdateUserDto {
   @ApiPropertyOptional({ example: 'alex@example.com' })
   /** Nuevo correo unico del usuario. */
   @IsOptional()
   @IsEmail()
   email?: string;

   @ApiPropertyOptional({ example: 'alexfit' })
   /** Nuevo username o `null` para eliminarlo. */
   @IsOptional()
   @IsString()
   username?: string | null;

   @ApiPropertyOptional({ example: 'hashed-password-value' })
   /** Nuevo hash de contrasena. */
   @IsOptional()
   @IsString()
   @MinLength(10)
   passwordHash?: string;

   @ApiPropertyOptional({ example: 'Alex' })
   /** Nuevo nombre o `null` para limpiar el valor. */
   @IsOptional()
   @IsString()
   firstName?: string | null;

   @ApiPropertyOptional({ example: 'Garcia' })
   /** Nuevos apellidos o `null` para limpiar el valor. */
   @IsOptional()
   @IsString()
   lastName?: string | null;

   @ApiPropertyOptional({ enum: UserRole, example: UserRole.COACH })
   /** Nuevo rol del usuario. */
   @IsOptional()
   @IsEnum(UserRole)
   role?: UserRole;

   @ApiPropertyOptional({ example: 81.2 })
   /** Nuevo peso en kilogramos o `null` para limpiar el valor. */
   @IsOptional()
   @IsNumber()
   weightKg?: number | null;

   @ApiPropertyOptional({ example: 182 })
   /** Nueva altura en centimetros o `null` para limpiar el valor. */
   @IsOptional()
   @IsNumber()
   heightCm?: number | null;

   @ApiPropertyOptional({ example: '1995-06-20T00:00:00.000Z' })
   /** Nueva fecha de nacimiento ISO o `null` para limpiarla. */
   @IsOptional()
   @IsDateString()
   birthDate?: string | null;
}
