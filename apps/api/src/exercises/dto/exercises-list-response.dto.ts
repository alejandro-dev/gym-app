import { ApiProperty } from '@nestjs/swagger';
import { ExerciseResponseDto } from './exercise-response.dto';

/**
 * Respuesta paginada del listado de ejercicios.
 */
export class ExercisesListResponseDto {
   @ApiProperty({ type: ExerciseResponseDto, isArray: true })
   /** Pagina actual de ejercicios. */
   items!: ExerciseResponseDto[];

   @ApiProperty({ example: 42 })
   /** Numero total de ejercicios disponibles. */
   total!: number;

   @ApiProperty({ example: 0 })
   /** Numero de pagina base cero. */
   page!: number;

   @ApiProperty({ example: 10 })
   /** Tamano de pagina solicitado. */
   limit!: number;
}
