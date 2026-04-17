import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

/**
 * Datos para activar o desactivar el acceso de un usuario.
 */
export class ChangeUserStatusDto {
   @ApiProperty({
      example: false,
      description: 'Indica si el usuario puede acceder a la aplicación.',
   })
   /** Nuevo estado de acceso del usuario. */
   @IsBoolean()
   isActive!: boolean;
}
