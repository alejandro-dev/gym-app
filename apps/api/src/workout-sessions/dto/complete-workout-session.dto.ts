import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

/**
 * Datos opcionales para completar una sesion de entrenamiento.
 */
export class CompleteWorkoutSessionDto {
   @ApiPropertyOptional({
      example: 'Buen entreno, subir peso la proxima semana.',
      nullable: true,
   })
   /** Notas opcionales de la sesion. */
   @IsOptional()
   @IsString()
   notes?: string | null;
}
