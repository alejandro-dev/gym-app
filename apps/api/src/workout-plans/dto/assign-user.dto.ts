import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

/**
 * Datos necesarios para asignar un usuario a un plan de entrenamiento.
 */
export class AssignUserDto {
   @ApiProperty({ example: 'cm9j8u4p10000fkoq2m9is1r0' })
   /** Identificador del usuario a asignar. */
   @IsString()
   @IsNotEmpty()
   userId!: string;
}
