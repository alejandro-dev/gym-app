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
import { WorkoutPlan, WorkoutPlansListResponse } from '@gym-app/types';

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
   @ApiQuery({
      name: 'page',
      required: false,
      description: 'Numero de pagina base cero.',
      example: 0,
   })
   @ApiQuery({
      name: 'limit',
      required: false,
      description: 'Cantidad maxima de planes por pagina.',
      example: 10,
   })
   @ApiOkResponse({
      description: 'Listado de planes de entrenamiento.',
      type: WorkoutPlanResponseDto,
      isArray: true,
   })
   @Get()
   findAll(
      @CurrentUser() user: AuthenticatedUser,
      @Query('page') page?: string,
      @Query('limit') limit?: string,
      @Query('search') search?: string,
      @Query('userId') userId?: string,
   ): Promise<WorkoutPlansListResponse> {
      const parsedPage = Number.parseInt(page ?? '0', 10);
      const parsedLimit = Number.parseInt(limit ?? '10', 10);

      return this.workoutPlansService.findAll(
         user,
         Number.isNaN(parsedPage) ? 0 : Math.max(parsedPage, 0),
         Number.isNaN(parsedLimit)
            ? 10
            : Math.min(Math.max(parsedLimit, 1), 100),
         search ?? '',
         userId,
      );
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
   ): Promise<WorkoutPlan> {
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
      @CurrentUser() user: AuthenticatedUser,
      @Body() createWorkoutPlanDto: CreateWorkoutPlanDto,
   ): Promise<WorkoutPlan> {
      return this.workoutPlansService.create(user, createWorkoutPlanDto);
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
   ): Promise<WorkoutPlan> {
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
   ): Promise<WorkoutPlan> {
      return this.workoutPlansService.remove(user, id);
   }
}
