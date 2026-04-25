import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

/**
 * Datos necesarios para cambiar la contrasena del usuario autenticado.
 */
export class ChangePasswordDto {
   @ApiProperty({ example: 'supersecreto123' })
   /** Contrasena actual de la cuenta. */
   @IsString()
   @MinLength(8)
   currentPassword!: string;

   @ApiProperty({ example: 'nuevasegura123' })
   /** Nueva contrasena en texto plano que sera hasheada antes de guardarse. */
   @IsString()
   @MinLength(8)
   newPassword!: string;
}
