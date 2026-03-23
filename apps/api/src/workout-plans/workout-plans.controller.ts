import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import {
   ApiConflictResponse,
   ApiCreatedResponse,
   ApiNotFoundResponse,
   ApiOkResponse,
   ApiOperation,
   ApiTags,
} from '@nestjs/swagger';
import { WorkoutPlansService } from './workout-plans.service';
import { CreateWorkoutPlanDto } from './dto/create-workout-plan.dto';
import { UpdateWorkoutPlanDto } from './dto/update-workout-plan.dto';
import { WorkoutPlanResponseDto } from './dto/workout-plan-response.dto';

/**
 * Controlador base para exponer endpoints del dominio de planes de entrenamiento.
 */
@ApiTags('workout-plans')
@Controller('workout-plans')
export class WorkoutPlansController {
   /**
    * Crea una nueva instancia del controlador de planes de entrenamiento.
    *
    * @param workoutPlansService - Servicio de dominio de planes de entrenamiento
    */
   constructor(private readonly workoutPlansService: WorkoutPlansService) {}

   /**
    * Crea un nuevo plan de trabajo.
    */
   @ApiOperation({ summary: 'Crear plan de entrenamiento' })
   @ApiCreatedResponse({
      description: 'Plan de entrenamiento creado correctamente.',
      type: WorkoutPlanResponseDto,
   })
   @ApiConflictResponse({
      description: 'Ya existe un recurso relacionado que entra en conflicto.',
   })
   @Post()
   create(
      @Body() createWorkoutPlanDto: CreateWorkoutPlanDto,
   ): Promise<WorkoutPlanResponseDto> {
      return this.workoutPlansService.create(createWorkoutPlanDto);
   }

   /**
    * Devuelve el listado de planes de trabajo.
    */
   @ApiOperation({ summary: 'Listar planes de entrenamiento' })
   @ApiOkResponse({
      description: 'Listado de planes de entrenamiento.',
      type: WorkoutPlanResponseDto,
      isArray: true,
   })
   @Get()
   findAll(): Promise<WorkoutPlanResponseDto[]> {
      return this.workoutPlansService.findAll();
   }

   /**
    * Busca un plan de trabajo por su identificador.
    */
   @ApiOperation({ summary: 'Obtener plan de entrenamiento por id' })
   @ApiOkResponse({
      description: 'Plan de entrenamiento encontrado.',
      type: WorkoutPlanResponseDto,
   })
   @ApiNotFoundResponse({ description: 'Plan de entrenamiento no encontrado.' })
   @Get(':id')
   findOne(@Param('id') id: string): Promise<WorkoutPlanResponseDto> {
      return this.workoutPlansService.findOne(id);
   }

   /**
    * Actualiza parcialmente un plan de trabajo existente.
    */
   @ApiOperation({ summary: 'Actualizar plan de entrenamiento' })
   @ApiOkResponse({
      description: 'Plan de entrenamiento actualizado correctamente.',
      type: WorkoutPlanResponseDto,
   })
   @ApiNotFoundResponse({ description: 'Plan de entrenamiento no encontrado.' })
   @ApiConflictResponse({
      description: 'Ya existe un recurso relacionado que entra en conflicto.',
   })
   @Patch(':id')
   update(
      @Param('id') id: string,
      @Body() updateWorkoutPlanDto: UpdateWorkoutPlanDto,
   ): Promise<WorkoutPlanResponseDto> {
      return this.workoutPlansService.update(id, updateWorkoutPlanDto);
   }

   /**
    * Elimina un plan de trabajo por su identificador.
    */
   @ApiOperation({ summary: 'Eliminar plan de entrenamiento' })
   @ApiOkResponse({
      description: 'Plan de entrenamiento eliminado correctamente.',
      type: WorkoutPlanResponseDto,
   })
   @ApiNotFoundResponse({ description: 'Plan de entrenamiento no encontrado.' })
   @Delete(':id')
   remove(@Param('id') id: string): Promise<WorkoutPlanResponseDto> {
      return this.workoutPlansService.remove(id);
   }
}
