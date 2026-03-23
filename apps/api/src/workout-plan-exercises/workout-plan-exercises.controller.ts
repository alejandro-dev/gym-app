import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import {
   ApiConflictResponse,
   ApiCreatedResponse,
   ApiNotFoundResponse,
   ApiOkResponse,
   ApiOperation,
   ApiTags,
} from '@nestjs/swagger';
import { WorkoutPlanExerciseService } from './workout-plan-exercises.service';
import { CreateWorkoutPlanExerciseDto } from './dto/create-workout-plan-exercise.dto';
import { WorkoutPlanExerciseResponseDto } from './dto/workout-plan-exercise-response.dto';
import { UpdateWorkoutPlanExerciseDto } from './dto/update-workout-plan-exercise.dto';

/**
 * Controlador base para exponer endpoints del dominio de ejercicios en plan de trabajo.
 */
@ApiTags('workout-plan-exercises')
@Controller('workout-plan-exercises')
export class WorkoutPlanExerciseController {
   /**
    * Crea una nueva instancia del controlador de ejercicios en plan de trabajo.
    *
    * @param workoutPlanExerciseService - Servicio de dominio de ejercicios en plan de trabajo
    */
   constructor(private readonly workoutPlanExerciseService: WorkoutPlanExerciseService) {}

   /**
    * Devuelve el listado de ejercicios en plan de trabajo.
    */
   @ApiOperation({ summary: 'Listar ejercicios de planes de entrenamiento' })
   @ApiOkResponse({
      description: 'Listado de ejercicios en planes de entrenamiento.',
      type: WorkoutPlanExerciseResponseDto,
      isArray: true,
   })
   @Get()
   findAll(): Promise<WorkoutPlanExerciseResponseDto[]> {
      return this.workoutPlanExerciseService.findAll();
   }

   /**
    * Busca un ejercicio en plan de trabajo por su identificador.
    */
   @ApiOperation({ summary: 'Obtener ejercicio de plan de entrenamiento por id' })
   @ApiOkResponse({
      description: 'Ejercicio en plan de entrenamiento encontrado.',
      type: WorkoutPlanExerciseResponseDto,
   })
   @ApiNotFoundResponse({
      description: 'Ejercicio en plan de entrenamiento no encontrado.',
   })
   @Get(':id')
   findOne(@Param('id') id: string): Promise<WorkoutPlanExerciseResponseDto> {
      return this.workoutPlanExerciseService.findOne(id);
   }

   /**
    * Crea un nuevo ejercicio en plan de trabajo.
    */
   @ApiOperation({ summary: 'Crear ejercicio en plan de entrenamiento' })
   @ApiCreatedResponse({
      description: 'Ejercicio en plan de entrenamiento creado correctamente.',
      type: WorkoutPlanExerciseResponseDto,
   })
   @ApiConflictResponse({
      description: 'Ya existe un ejercicio en esa posicion para el plan indicado.',
   })
   @Post()
   create(
      @Body() createWorkoutPlanExerciseDto: CreateWorkoutPlanExerciseDto,
   ): Promise<WorkoutPlanExerciseResponseDto> {
      return this.workoutPlanExerciseService.create(createWorkoutPlanExerciseDto);
   }

   /**
    * Actualiza parcialmente un ejercicio en plan de trabajo existente.
    */
   @ApiOperation({ summary: 'Actualizar ejercicio en plan de entrenamiento' })
   @ApiOkResponse({
      description: 'Ejercicio en plan de entrenamiento actualizado correctamente.',
      type: WorkoutPlanExerciseResponseDto,
   })
   @ApiNotFoundResponse({
      description: 'Ejercicio en plan de entrenamiento no encontrado.',
   })
   @ApiConflictResponse({
      description: 'Ya existe un ejercicio en esa posicion para el plan indicado.',
   })
   @Patch(':id')
   update(
      @Param('id') id: string,
      @Body() updateWorkoutPlanExerciseDto: UpdateWorkoutPlanExerciseDto,
   ): Promise<WorkoutPlanExerciseResponseDto> {
      return this.workoutPlanExerciseService.update(id, updateWorkoutPlanExerciseDto);
   }

   /**
    * Elimina un ejercicio en plan de trabajo por su identificador.
    */
   @ApiOperation({ summary: 'Eliminar ejercicio de plan de entrenamiento' })
   @ApiOkResponse({
      description: 'Ejercicio en plan de entrenamiento eliminado correctamente.',
      type: WorkoutPlanExerciseResponseDto,
   })
   @ApiNotFoundResponse({
      description: 'Ejercicio en plan de entrenamiento no encontrado.',
   })
   @Delete(':id')
   remove(@Param('id') id: string): Promise<WorkoutPlanExerciseResponseDto> {
      return this.workoutPlanExerciseService.remove(id);
   }
}
