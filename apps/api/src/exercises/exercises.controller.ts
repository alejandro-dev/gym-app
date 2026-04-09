import {
   Body,
   Controller,
   Delete,
   Get,
   Param,
   Patch,
   Post,
   Query,
   UseGuards,
} from '@nestjs/common';
import {
   ApiBearerAuth,
   ApiConflictResponse,
   ApiCreatedResponse,
   ApiNotFoundResponse,
   ApiOkResponse,
   ApiOperation,
   ApiQuery,
   ApiTags,
} from '@nestjs/swagger';
import { ExerciseCategory, MuscleGroup, UserRole } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ExercisesService } from './exercises.service';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { ExerciseResponseDto } from './dto/exercise-response.dto';
import { ExercisesListResponseDto } from './dto/exercises-list-response.dto';
import { UpdateExerciseDto } from './dto/update-exercise.dto';
import type { ExercisesListResponse } from '@gym-app/types';

/**
 * Controlador base para exponer endpoints del dominio de ejercicios.
 */
@ApiTags('exercises')
@ApiBearerAuth()
@UseGuards(AccessTokenGuard, RolesGuard)
@Controller('exercises')
export class ExercisesController {
   /**
    * Crea una nueva instancia del controlador de ejercicios.
    *
    * @param exercisesService - Servicio de dominio de ejercicios
    */
   constructor(private readonly exercisesService: ExercisesService) {}

   /**
    * Devuelve el listado de ejercicios.
    *
    * @param page - Numero de pagina base cero
    * @param limit - Cantidad maxima de ejercicios por pagina
    * @param search - Cadena de búsqueda para filtrar ejercicios
    * @param groupMuscleFilter - Filtro de grupo muscular
    * @param exerciseCategoryFilter - Filtro de categoria de ejercicio
    *
    * @returns Listado de ejercicios
    */
   @ApiOperation({ summary: 'Listar ejercicios' })
   @ApiQuery({
      name: 'page',
      required: false,
      description: 'Numero de pagina base cero.',
      example: 0,
   })
   @ApiQuery({
      name: 'limit',
      required: false,
      description: 'Cantidad maxima de ejercicios por pagina.',
      example: 10,
   })
   @ApiQuery({
      name: 'search',
      required: false,
      description: 'Cadena de busqueda para filtrar ejercicios por nombre.',
      example: 'press',
   })
   @ApiQuery({
      name: 'muscleGroup',
      required: false,
      description: 'Filtro de grupo muscular.',
      example: 'core',
   })
   @ApiQuery({
      name: 'category',
      required: false,
      description: 'Filtro de categoria de ejercicio.',
      example: 'strength',
   })
   @ApiOkResponse({
      description: 'Listado paginado de ejercicios.',
      type: ExercisesListResponseDto,
   })
   @Get()
   @Roles(UserRole.ADMIN, UserRole.COACH, UserRole.USER)
   findAll(
      @Query('page') page?: string,
      @Query('limit') limit?: string,
      @Query('search') search?: string,
      @Query('muscleGroup') groupMuscleFilter?: string,
      @Query('category') exerciseCategoryFilter?: string,
   ): Promise<ExercisesListResponse> {
      const parsedPage = Number.parseInt(page ?? '0', 10);
      const parsedLimit = Number.parseInt(limit ?? '10', 10);

      return this.exercisesService.findAll(
         Number.isNaN(parsedPage) ? 0 : Math.max(parsedPage, 0),
         Number.isNaN(parsedLimit)
            ? 10
            : Math.min(Math.max(parsedLimit, 1), 100),
         search ?? '',
         groupMuscleFilter as MuscleGroup,
         exerciseCategoryFilter as ExerciseCategory,
      );
   }

   /**
    * Busca un ejercicio por su identificador.
    *
    * @param id - Identificador del ejercicio
    * @returns Ejercicio encontrado
    */
   @ApiOperation({ summary: 'Obtener ejercicio por id' })
   @ApiOkResponse({
      description: 'Ejercicio encontrado.',
      type: ExerciseResponseDto,
   })
   @ApiNotFoundResponse({ description: 'Ejercicio no encontrado.' })
   @Get(':id')
   @Roles(UserRole.ADMIN, UserRole.COACH, UserRole.USER)
   findOne(@Param('id') id: string): Promise<ExerciseResponseDto> {
      return this.exercisesService.findOne(id);
   }

   /**
    * Crea un nuevo ejercicio.
    *
    * @param createExerciseDto - Datos de creacion del ejercicio
    * @returns Ejercicio creado
    */
   @ApiOperation({ summary: 'Crear ejercicio' })
   @ApiCreatedResponse({
      description: 'Ejercicio creado correctamente.',
      type: ExerciseResponseDto,
   })
   @ApiConflictResponse({
      description: 'Ya existe un ejercicio con el mismo nombre o slug.',
   })
   @Roles(UserRole.ADMIN, UserRole.COACH)
   @Post()
   create(
      @Body() createExerciseDto: CreateExerciseDto,
   ): Promise<ExerciseResponseDto> {
      return this.exercisesService.create(createExerciseDto);
   }

   /**
    * Actualiza parcialmente un ejercicio existente.
    *
    * @param id - Identificador del ejercicio
    * @param updateExerciseDto - Datos de actualizacion parcial
    * @returns Ejercicio actualizado
    */
   @ApiOperation({ summary: 'Actualizar ejercicio' })
   @ApiOkResponse({
      description: 'Ejercicio actualizado correctamente.',
      type: ExerciseResponseDto,
   })
   @ApiNotFoundResponse({ description: 'Ejercicio no encontrado.' })
   @ApiConflictResponse({
      description: 'Ya existe un ejercicio con el mismo nombre o slug.',
   })
   @Patch(':id')
   @Roles(UserRole.ADMIN, UserRole.COACH)
   update(
      @Param('id') id: string,
      @Body() updateExerciseDto: UpdateExerciseDto,
   ): Promise<ExerciseResponseDto> {
      return this.exercisesService.update(id, updateExerciseDto);
   }

   /**
    * Elimina un ejercicio por su identificador.
    *
    * @param id - Identificador del ejercicio
    * @returns Ejercicio eliminado
    */
   @ApiOperation({ summary: 'Eliminar ejercicio' })
   @ApiOkResponse({
      description: 'Ejercicio eliminado correctamente.',
      type: ExerciseResponseDto,
   })
   @ApiNotFoundResponse({ description: 'Ejercicio no encontrado.' })
   @Delete(':id')
   @Roles(UserRole.ADMIN, UserRole.COACH)
   remove(@Param('id') id: string): Promise<ExerciseResponseDto> {
      return this.exercisesService.remove(id);
   }
}
