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
} from '@nestjs/swagger';
import { WorkoutPlansService } from './workout-plans.service';
import { CreateWorkoutPlanDto } from './dto/create-workout-plan.dto';
import { UpdateWorkoutPlanDto } from './dto/update-workout-plan.dto';
import { WorkoutPlanResponseDto } from './dto/workout-plan-response.dto';
import { AccessTokenGuard } from 'src/auth/guards/access-token.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { UserRole } from '@prisma/client';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { AuthenticatedUser } from 'src/auth/interfaces/authenticated-user.interface';

/**
 * Controlador base para exponer endpoints del dominio de planes de entrenamiento.
 */
@ApiTags('workout-plans')
@ApiBearerAuth()
@UseGuards(AccessTokenGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.COACH, UserRole.USER)
@Controller('workout-plans')
export class WorkoutPlansController {
   /**
    * Crea una nueva instancia del controlador de planes de entrenamiento.
    *
    * @param workoutPlansService - Servicio de dominio de planes de entrenamiento
    */
   constructor(private readonly workoutPlansService: WorkoutPlansService) {}

   /**
    * Devuelve el listado de planes de trabajo.
    *
    * @param user - Usuario autenticado
    * @param userId - Identificador opcional del usuario por el que filtrar cuando el rol lo permite
    * @returns Listado de planes de entrenamiento
    */
   @ApiOperation({ summary: 'Listar planes de entrenamiento' })
   @ApiQuery({
      name: 'userId',
      required: false,
      type: String,
      description:
         'Filtra por identificador de usuario. Solo aplica para roles con acceso ampliado.',
   })
   @ApiOkResponse({
      description: 'Listado de planes de entrenamiento.',
      type: WorkoutPlanResponseDto,
      isArray: true,
   })
   @Get()
   findAll(
      @CurrentUser() user: AuthenticatedUser,
      @Query('userId') userId?: string,
   ): Promise<WorkoutPlanResponseDto[]> {
      return this.workoutPlansService.findAll(user, userId);
   }

   /**
    * Busca un plan de trabajo por su identificador.
    *
    * @param user - Usuario autenticado
    * @param id - Identificador del plan de entrenamiento
    * @returns Plan de entrenamiento encontrado
    */
   @ApiOperation({ summary: 'Obtener plan de entrenamiento por id' })
   @ApiOkResponse({
      description: 'Plan de entrenamiento encontrado.',
      type: WorkoutPlanResponseDto,
   })
   @ApiNotFoundResponse({ description: 'Plan de entrenamiento no encontrado.' })
   @Get(':id')
   findOne(
      @CurrentUser() user: AuthenticatedUser,
      @Param('id') id: string,
   ): Promise<WorkoutPlanResponseDto> {
      return this.workoutPlansService.findOne(user, id);
   }

   /**
    * Crea un nuevo plan de trabajo.
    *
    * @param createWorkoutPlanDto - Datos de creacion del plan de entrenamiento
    * @returns Plan de entrenamiento creado
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
    * Actualiza parcialmente un plan de trabajo existente.
    *
    * @param user - Usuario autenticado
    * @param id - Identificador del plan de entrenamiento
    * @param updateWorkoutPlanDto - Datos de actualizacion parcial
    * @returns Plan de entrenamiento actualizado
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
      @CurrentUser() user: AuthenticatedUser,
      @Param('id') id: string,
      @Body() updateWorkoutPlanDto: UpdateWorkoutPlanDto,
   ): Promise<WorkoutPlanResponseDto> {
      return this.workoutPlansService.update(user, id, updateWorkoutPlanDto);
   }

   /**
    * Elimina un plan de trabajo por su identificador.
    *
    * @param user - Usuario autenticado
    * @param id - Identificador del plan de entrenamiento
    * @returns Plan de entrenamiento eliminado
    */
   @ApiOperation({ summary: 'Eliminar plan de entrenamiento' })
   @ApiOkResponse({
      description: 'Plan de entrenamiento eliminado correctamente.',
      type: WorkoutPlanResponseDto,
   })
   @ApiNotFoundResponse({ description: 'Plan de entrenamiento no encontrado.' })
   @Delete(':id')
   remove(
      @CurrentUser() user: AuthenticatedUser,
      @Param('id') id: string,
   ): Promise<WorkoutPlanResponseDto> {
      return this.workoutPlansService.remove(user, id);
   }
}
