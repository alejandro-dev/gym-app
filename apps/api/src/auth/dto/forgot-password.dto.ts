import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

/**
 * Dto para el endpoint de restablecimiento de contraseña
 */
export class ForgotPasswordDto {
   @ApiProperty({ example: 'alex@example.com' })
   /** Correo de la cuenta que solicita restablecer la contraseña. */
   @IsEmail()
   email!: string;
}
