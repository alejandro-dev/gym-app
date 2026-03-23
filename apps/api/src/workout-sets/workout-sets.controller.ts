import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import {
   ApiConflictResponse,
   ApiCreatedResponse,
   ApiNotFoundResponse,
   ApiOkResponse,
   ApiOperation,
   ApiTags,
} from '@nestjs/swagger';
import { WorkoutSetsService } from './workout-sets.service';
import { CreateWorkoutSetDto } from './dto/create-workout-set.dto';
import { UpdateWorkoutSetDto } from './dto/update-workout-set.dto';
import { WorkoutSetResponseDto } from './dto/workout-set-response.dto';

/**
 * Controlador base para exponer endpoints del dominio de series de entrenamiento.
 */
@ApiTags('workout-sets')
@Controller('workout-sets')
export class WorkoutSetsController {
   /**
    * Crea una nueva instancia del controlador de series de entrenamiento.
    *
    * @param workoutSetsService - Servicio de dominio de series de entrenamiento
    */
   constructor(private readonly workoutSetsService: WorkoutSetsService) {}

   /**
    * Devuelve el listado de series de entrenamiento.
    */
   @ApiOperation({ summary: 'Listar series de entrenamiento' })
   @ApiOkResponse({
      description: 'Listado de series de entrenamiento.',
      type: WorkoutSetResponseDto,
      isArray: true,
   })
   @Get()
   findAll(): Promise<WorkoutSetResponseDto[]> {
      return this.workoutSetsService.findAll();
   }

   /**
    * Busca una serie de entrenamiento por su identificador.
    */
   @ApiOperation({ summary: 'Obtener serie de entrenamiento por id' })
   @ApiOkResponse({
      description: 'Serie de entrenamiento encontrada.',
      type: WorkoutSetResponseDto,
   })
   @ApiNotFoundResponse({ description: 'Serie de entrenamiento no encontrada.' })
   @Get(':id')
   findOne(@Param('id') id: string): Promise<WorkoutSetResponseDto> {
      return this.workoutSetsService.findOne(id);
   }

   /**
    * Crea una nueva serie de entrenamiento.
    */
   @ApiOperation({ summary: 'Crear serie de entrenamiento' })
   @ApiCreatedResponse({
      description: 'Serie de entrenamiento creada correctamente.',
      type: WorkoutSetResponseDto,
   })
   @ApiConflictResponse({
      description: 'Ya existe una serie con la misma sesion, ejercicio y numero.',
   })
   @Post()
   create(@Body() createWorkoutSetDto: CreateWorkoutSetDto): Promise<WorkoutSetResponseDto> {
      return this.workoutSetsService.create(createWorkoutSetDto);
   }

   /**
    * Actualiza parcialmente una serie de entrenamiento existente.
    */
   @ApiOperation({ summary: 'Actualizar serie de entrenamiento' })
   @ApiOkResponse({
      description: 'Serie de entrenamiento actualizada correctamente.',
      type: WorkoutSetResponseDto,
   })
   @ApiNotFoundResponse({ description: 'Serie de entrenamiento no encontrada.' })
   @ApiConflictResponse({
      description: 'Ya existe una serie con la misma sesion, ejercicio y numero.',
   })
   @Patch(':id')
   update(
      @Param('id') id: string,
      @Body() updateWorkoutSetDto: UpdateWorkoutSetDto,
   ): Promise<WorkoutSetResponseDto> {
      return this.workoutSetsService.update(id, updateWorkoutSetDto);
   }

   /**
    * Elimina una serie de entrenamiento por su identificador.
    */
   @ApiOperation({ summary: 'Eliminar serie de entrenamiento' })
   @ApiOkResponse({
      description: 'Serie de entrenamiento eliminada correctamente.',
      type: WorkoutSetResponseDto,
   })
   @ApiNotFoundResponse({ description: 'Serie de entrenamiento no encontrada.' })
   @Delete(':id')
   remove(@Param('id') id: string): Promise<WorkoutSetResponseDto> {
      return this.workoutSetsService.remove(id);
   }
}
