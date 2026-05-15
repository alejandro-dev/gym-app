import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

/**
 * Dto para formulario de restablecimiento de contraseña
 */
export class ResetPasswordDto {
   @ApiProperty({ example: 'reset-token' })
   @IsNotEmpty()
   @MinLength(10)
   @IsString()
   token!: string;

   @ApiProperty({ example: 'nuevasegura123' })
   @IsString()
   @MinLength(8)
   newPassword!: string;
}
