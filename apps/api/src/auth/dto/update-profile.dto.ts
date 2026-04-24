import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';

/**
 * Datos permitidos para actualizar el perfil propio.
 */
export class UpdateProfileDto {
   @ApiPropertyOptional({ example: 'Alex', nullable: true })
   /** Nuevo nombre o `null` para limpiar el valor. */
   @IsOptional()
   @IsString()
   firstName?: string | null;

   @ApiPropertyOptional({ example: 'Garcia', nullable: true })
   /** Nuevos apellidos o `null` para limpiar el valor. */
   @IsOptional()
   @IsString()
   lastName?: string | null;

   @ApiPropertyOptional({ example: 81.2, nullable: true })
   /** Nuevo peso en kilogramos o `null` para limpiar el valor. */
   @IsOptional()
   @IsNumber()
   weightKg?: number | null;

   @ApiPropertyOptional({ example: 182, nullable: true })
   /** Nueva altura en centimetros o `null` para limpiar el valor. */
   @IsOptional()
   @IsNumber()
   heightCm?: number | null;

   @ApiPropertyOptional({
      example: '1995-06-20T00:00:00.000Z',
      nullable: true,
   })
   /** Nueva fecha de nacimiento ISO o `null` para limpiarla. */
   @IsOptional()
   @IsDateString()
   birthDate?: string | null;
}
