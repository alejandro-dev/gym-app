import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Credenciales de inicio de sesion.
 */
export class LoginDto {
  @ApiProperty({ example: 'alex@example.com' })
  /** Email de la cuenta. */
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'supersecreto123' })
  /** Password en texto plano enviada por el cliente. */
  @IsString()
  @MinLength(8)
  password!: string;
}
