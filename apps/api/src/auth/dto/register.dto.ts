import {
   IsDateString,
   IsEmail,
   IsNumber,
   IsOptional,
   IsString,
   MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Datos permitidos para registrar una cuenta.
 */
export class RegisterDto {
   @ApiProperty({ example: 'alex@example.com' })
   /** Correo unico del usuario. */
   @IsEmail()
   email!: string;

   @ApiProperty({ example: 'supersecreto123' })
   /** Password en texto plano que sera hasheada antes de guardarse. */
   @IsString()
   @MinLength(8)
   password!: string;

   @ApiPropertyOptional({ example: 'alexfit' })
   /** Nombre de usuario unico opcional. */
   @IsOptional()
   @IsString()
   username?: string;

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
