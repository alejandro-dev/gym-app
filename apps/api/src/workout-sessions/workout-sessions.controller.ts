import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import {
   ApiConflictResponse,
   ApiCreatedResponse,
   ApiNotFoundResponse,
   ApiOkResponse,
   ApiOperation,
   ApiTags,
} from '@nestjs/swagger';
import { WorkoutSessionsService } from './workout-sessions.service';
import { WorkoutSessionResponseDto } from './dto/workout-session-response.dto';
import { UpdateWorkoutSessionDto } from './dto/update-workout-session.dto';
import { CreateWorkoutSessionDto } from './dto/create-workout-session.dto';

/**
 * Controlador base para exponer endpoints del dominio de sesiones de entrenamiento.
 */
@ApiTags('workout-sessions')
@Controller('workout-sessions')
export class WorkoutSessionsController {
   /**
    * Crea una nueva instancia del controlador de sesiones de entrenamiento.
    *
    * @param workoutSessionsService - Servicio de dominio de sesiones de entrenamiento
    */
   constructor(private readonly workoutSessionsService: WorkoutSessionsService) {}

   /**
    * Devuelve el listado de sesiones de entrenamiento.
   */
   @ApiOperation({ summary: 'Listar sesiones de entrenamiento' })
   @ApiOkResponse({
      description: 'Listado de sesiones de entrenamiento.',
      type: WorkoutSessionResponseDto,
      isArray: true,
   })
   @Get()
   findAll(): Promise<WorkoutSessionResponseDto[]> {
      return this.workoutSessionsService.findAll();
   }

   /**
    * Busca una sesion de entrenamiento por su identificador.
    */
   @ApiOperation({ summary: 'Obtener sesion de entrenamiento por id' })
   @ApiOkResponse({
      description: 'Sesion de entrenamiento encontrada.',
      type: WorkoutSessionResponseDto,
   })
   @ApiNotFoundResponse({ description: 'Sesion de entrenamiento no encontrada.' })
   @Get(':id')
   findOne(@Param('id') id: string): Promise<WorkoutSessionResponseDto> {
      return this.workoutSessionsService.findOne(id);
   }

   /**
    * Crea una nueva sesion de entrenamiento.
    */
   @ApiOperation({ summary: 'Crear sesion de entrenamiento' })
   @ApiCreatedResponse({
      description: 'Sesion de entrenamiento creada correctamente.',
      type: WorkoutSessionResponseDto,
   })
   @ApiConflictResponse({
      description: 'Ya existe un recurso relacionado que entra en conflicto.',
   })
   @Post()
   create(@Body() createWorkoutSessionDto: CreateWorkoutSessionDto): Promise<WorkoutSessionResponseDto> {
      return this.workoutSessionsService.create(createWorkoutSessionDto);
   }

   /**
    * Actualiza parcialmente una sesion de entrenamiento existente.
    */
   @ApiOperation({ summary: 'Actualizar sesion de entrenamiento' })
   @ApiOkResponse({
      description: 'Sesion de entrenamiento actualizada correctamente.',
      type: WorkoutSessionResponseDto,
   })
   @ApiNotFoundResponse({ description: 'Sesion de entrenamiento no encontrada.' })
   @ApiConflictResponse({
      description: 'Ya existe un recurso relacionado que entra en conflicto.',
   })
   @Patch(':id')
   update(@Param('id') id: string, @Body() updateWorkoutSessionDto: UpdateWorkoutSessionDto): Promise<WorkoutSessionResponseDto> {
      return this.workoutSessionsService.update(id, updateWorkoutSessionDto);
   }

   /**
    * Elimina una sesion de entrenamiento por su identificador.
    */
   @ApiOperation({ summary: 'Eliminar sesion de entrenamiento' })
   @ApiOkResponse({
      description: 'Sesion de entrenamiento eliminada correctamente.',
      type: WorkoutSessionResponseDto,
   })
   @ApiNotFoundResponse({ description: 'Sesion de entrenamiento no encontrada.' })
   @Delete(':id')
   remove(@Param('id') id: string): Promise<WorkoutSessionResponseDto> {
      return this.workoutSessionsService.remove(id);
   }
}
