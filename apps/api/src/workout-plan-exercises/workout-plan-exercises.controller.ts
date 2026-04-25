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
   ApiQuery,
   ApiBearerAuth,
   ApiConflictResponse,
   ApiCreatedResponse,
   ApiNotFoundResponse,
   ApiOkResponse,
   ApiOperation,
   ApiTags,
   ApiTooManyRequestsResponse,
} from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { WorkoutPlanExerciseService } from './workout-plan-exercises.service';
import { CreateWorkoutPlanExerciseDto } from './dto/create-workout-plan-exercise.dto';
import { WorkoutPlanExerciseResponseDto } from './dto/workout-plan-exercise-response.dto';
import { UpdateWorkoutPlanExerciseDto } from './dto/update-workout-plan-exercise.dto';
import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { UserRole } from '@prisma/client';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { AuthenticatedUser } from 'src/auth/interfaces/authenticated-user.interface';
import { WRITE_ENDPOINT_RATE_LIMIT } from '../rate-limit/rate-limit.constants';

/**
 * Controlador base para exponer endpoints del dominio de ejercicios en plan de trabajo.
 */
@ApiTags('workout-plan-exercises')
@ApiBearerAuth()
@UseGuards(AccessTokenGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.COACH, UserRole.USER)
@Controller('workout-plan-exercises')
export class WorkoutPlanExerciseController {
   /**
    * Crea una nueva instancia del controlador de ejercicios en plan de trabajo.
    *
    * @param workoutPlanExerciseService - Servicio de dominio de ejercicios en plan de trabajo
    */
   constructor(
      private readonly workoutPlanExerciseService: WorkoutPlanExerciseService,
   ) {}

   /**
    * Devuelve el listado de ejercicios en plan de trabajo.
    *
    * @param user - Usuario autenticado
    * @param userId - Identificador opcional del usuario por el que filtrar cuando el rol lo permite
    * @param workoutPlanId - Identificador opcional del plan por el que filtrar
    * @returns Listado de ejercicios en planes de entrenamiento
    */
   @ApiOperation({ summary: 'Listar ejercicios de planes de entrenamiento' })
   @ApiQuery({
      name: 'userId',
      required: false,
      type: String,
      description:
         'Filtra por identificador de usuario. Solo aplica para roles con acceso ampliado.',
   })
   @ApiQuery({
      name: 'workoutPlanId',
      required: false,
      type: String,
      description: 'Filtra por identificador de plan de entrenamiento.',
   })
   @ApiOkResponse({
      description: 'Listado de ejercicios en planes de entrenamiento.',
      type: WorkoutPlanExerciseResponseDto,
      isArray: true,
   })
   @Get()
   findAll(
      @CurrentUser() user: AuthenticatedUser,
      @Query('userId') userId?: string,
      @Query('workoutPlanId') workoutPlanId?: string,
   ): Promise<WorkoutPlanExerciseResponseDto[]> {
      return this.workoutPlanExerciseService.findAll(
         user,
         userId,
         workoutPlanId,
      );
   }

   /**
    * Busca un ejercicio en plan de trabajo por su identificador.
    *
    * @param user - Usuario autenticado
    * @param id - Identificador del ejercicio en plan de entrenamiento
    * @returns Ejercicio en plan de entrenamiento encontrado
    */
   @ApiOperation({
      summary: 'Obtener ejercicio de plan de entrenamiento por id',
   })
   @ApiOkResponse({
      description: 'Ejercicio en plan de entrenamiento encontrado.',
      type: WorkoutPlanExerciseResponseDto,
   })
   @ApiNotFoundResponse({
      description: 'Ejercicio en plan de entrenamiento no encontrado.',
   })
   @Get(':id')
   findOne(
      @CurrentUser() user: AuthenticatedUser,
      @Param('id') id: string,
   ): Promise<WorkoutPlanExerciseResponseDto> {
      return this.workoutPlanExerciseService.findOne(user, id);
   }

   /**
    * Crea un nuevo ejercicio en plan de trabajo.
    *
    * @param createWorkoutPlanExerciseDto - Datos de creacion del ejercicio en plan de entrenamiento
    * @returns Ejercicio en plan de entrenamiento creado
    */
   @ApiOperation({ summary: 'Crear ejercicio en plan de entrenamiento' })
   @ApiCreatedResponse({
      description: 'Ejercicio en plan de entrenamiento creado correctamente.',
      type: WorkoutPlanExerciseResponseDto,
   })
   @ApiConflictResponse({
      description:
         'Ya existe un ejercicio en esa posicion para el plan indicado.',
   })
   @ApiTooManyRequestsResponse({
      description:
         'Se superó el límite temporal para operaciones de escritura.',
   })
   @UseGuards(ThrottlerGuard)
   @Throttle(WRITE_ENDPOINT_RATE_LIMIT)
   @Post()
   create(
      @Body() createWorkoutPlanExerciseDto: CreateWorkoutPlanExerciseDto,
   ): Promise<WorkoutPlanExerciseResponseDto> {
      return this.workoutPlanExerciseService.create(
         createWorkoutPlanExerciseDto,
      );
   }

   /**
    * Actualiza parcialmente un ejercicio en plan de trabajo existente.
    *
    * @param user - Usuario autenticado
    * @param id - Identificador del ejercicio en plan de entrenamiento
    * @param updateWorkoutPlanExerciseDto - Datos de actualizacion parcial
    * @returns Ejercicio en plan de entrenamiento actualizado
    */
   @ApiOperation({ summary: 'Actualizar ejercicio en plan de entrenamiento' })
   @ApiOkResponse({
      description:
         'Ejercicio en plan de entrenamiento actualizado correctamente.',
      type: WorkoutPlanExerciseResponseDto,
   })
   @ApiNotFoundResponse({
      description: 'Ejercicio en plan de entrenamiento no encontrado.',
   })
   @ApiConflictResponse({
      description:
         'Ya existe un ejercicio en esa posicion para el plan indicado.',
   })
   @ApiTooManyRequestsResponse({
      description:
         'Se superó el límite temporal para operaciones de escritura.',
   })
   @UseGuards(ThrottlerGuard)
   @Throttle(WRITE_ENDPOINT_RATE_LIMIT)
   @Patch(':id')
   update(
      @CurrentUser() user: AuthenticatedUser,
      @Param('id') id: string,
      @Body() updateWorkoutPlanExerciseDto: UpdateWorkoutPlanExerciseDto,
   ): Promise<WorkoutPlanExerciseResponseDto> {
      return this.workoutPlanExerciseService.update(
         user,
         id,
         updateWorkoutPlanExerciseDto,
      );
   }

   /**
    * Elimina un ejercicio en plan de trabajo por su identificador.
    *
    * @param user - Usuario autenticado
    * @param id - Identificador del ejercicio en plan de entrenamiento
    * @returns Ejercicio en plan de entrenamiento eliminado
    */
   @ApiOperation({ summary: 'Eliminar ejercicio de plan de entrenamiento' })
   @ApiOkResponse({
      description:
         'Ejercicio en plan de entrenamiento eliminado correctamente.',
      type: WorkoutPlanExerciseResponseDto,
   })
   @ApiNotFoundResponse({
      description: 'Ejercicio en plan de entrenamiento no encontrado.',
   })
   @ApiTooManyRequestsResponse({
      description:
         'Se superó el límite temporal para operaciones de escritura.',
   })
   @UseGuards(ThrottlerGuard)
   @Throttle(WRITE_ENDPOINT_RATE_LIMIT)
   @Delete(':id')
   remove(
      @CurrentUser() user: AuthenticatedUser,
      @Param('id') id: string,
   ): Promise<WorkoutPlanExerciseResponseDto> {
      return this.workoutPlanExerciseService.remove(user, id);
   }
}
