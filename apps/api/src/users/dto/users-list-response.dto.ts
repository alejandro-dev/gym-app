import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from './user-response.dto';

/**
 * Respuesta paginada del listado de usuarios.
 */
export class UsersListResponseDto {
   @ApiProperty({ type: UserResponseDto, isArray: true })
   /** Pagina actual de usuarios. */
   items!: UserResponseDto[];

   @ApiProperty({ example: 42 })
   /** Numero total de usuarios disponibles. */
   total!: number;

   @ApiProperty({ example: 0 })
   /** Numero de pagina base cero. */
   page!: number;

   @ApiProperty({ example: 10 })
   /** Tamano de pagina solicitado. */
   limit!: number;
}
