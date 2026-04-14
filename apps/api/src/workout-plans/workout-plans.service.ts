import {
   BadRequestException,
   Injectable,
   NotFoundException,
} from '@nestjs/common';
import {
   Prisma,
   UserRole,
   WorkoutPlanGoal,
   WorkoutPlanLevel,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { WorkoutPlan } from '@gym-app/types';
import { CreateWorkoutPlanDto } from './dto/create-workout-plan.dto';
import { UpdateWorkoutPlanDto } from './dto/update-workout-plan.dto';
import { handlePrismaError } from '../prisma/prisma-error.util';
import { AuthenticatedUser } from 'src/auth/interfaces/authenticated-user.interface';

type SelectedWorkoutPlanRecord = {
   id: string;
   userId: string | null;
   user: {
      email: string;
      firstName: string | null;
      lastName: string | null;
   } | null;
   createdById: string;
   name: string;
   description: string | null;
   goal: WorkoutPlanGoal | null;
   level: WorkoutPlanLevel | null;
   durationWeeks: number | null;
   isActive: boolean;
   createdAt: Date;
   updatedAt: Date;
};

/**
 * Servicio base para operaciones del dominio de planes de trabajo.
 */
@Injectable()
export class WorkoutPlansService {
   /**
    * Crea una nueva instancia del servicio de planes de trabajo.
    *
    * @param prisma - Cliente de Prisma compartido por la aplicación
    */
   constructor(private readonly prisma: PrismaService) {}

   /**
    * Selecciona los campos de un plan de trabajo para la consulta.
    */
   private readonly workoutPlanSelect = {
      id: true,
      userId: true,
      user: {
         select: {
            email: true,
            firstName: true,
            lastName: true,
         },
      },
      createdById: true,
      name: true,
      description: true,
      goal: true,
      level: true,
      durationWeeks: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
   } satisfies Prisma.WorkoutPlanSelect;

   /**
    * Obtiene todos los planes de trabajo ordenados por fecha de creacion descendente.
    *
    * @param user - Usuario autenticado
    * @param page - Numero de pagina base cero
    * @param limit - Cantidad maxima de planes por pagina
    * @param search - Cadena de búsqueda para filtrar planes por nombre
    * @param userId - Identificador opcional del usuario por el que filtrar cuando el rol lo permite
    * @returns Listado de planes de trabajo accesibles para el usuario autenticado
    */
   async findAll(
      user: AuthenticatedUser,
      page: number,
      limit: number,
      search: string,
      userId?: string,
   ) {
      try {
         const where: Prisma.WorkoutPlanWhereInput = {
            ...this.buildAccessiblePlansWhere(user, userId),
            ...(search?.trim() && {
               // mode: 'insensitive',ignora mayúsculas/minúsculas
               OR: [{ name: { contains: search, mode: 'insensitive' } }],
            }),
         };

         const [workoutPlans, total] = await Promise.all([
            this.prisma.workoutPlan.findMany({
               select: this.workoutPlanSelect,
               where,
               orderBy: {
                  createdAt: 'desc',
               },
               skip: page * limit,
               take: limit,
            }),
            this.prisma.workoutPlan.count({
               where,
            }),
         ]);

         return {
            items: workoutPlans.map((workoutPlan) =>
               this.toPublicWorkoutPlan(workoutPlan),
            ),
            total,
            page,
            limit,
         };
      } catch (error) {
         handlePrismaError(error, 'workout plan');
      }
   }

   /**
    * Obtiene un plan de trabajo por id.
    *
    * @param user - Usuario autenticado
    * @param id - Identificador del plan de trabajo
    * @returns Plan de trabajo encontrado
    * @throws NotFoundException si no existe
    */
   async findOne(user: AuthenticatedUser, id: string) {
      const workoutPlan = await this.prisma.workoutPlan.findUnique({
         where: { id },
         select: this.workoutPlanSelect,
      });

      // Si no existe lanza NotFoundException
      if (!workoutPlan)
         throw new NotFoundException(`Workout plan with id "${id}" not found`);

      this.assertCanAccessWorkoutPlan(user, workoutPlan);

      return this.toPublicWorkoutPlan(workoutPlan);
   }

   /**
    * Crea un plan de trabajo y devuelve la version publica del registro.
    *
    * @param createWorkoutPlanDto - Datos de creacion del plan de trabajo
    * @returns Plan de trabajo creado
    */
   async create(
      user: AuthenticatedUser,
      createWorkoutPlanDto: CreateWorkoutPlanDto,
   ) {
      this.assertCanCreateWorkoutPlan(
         user,
         createWorkoutPlanDto.userId ?? null,
      );

      try {
         const workoutPlan = await this.prisma.workoutPlan.create({
            data: this.toCreateData(user, createWorkoutPlanDto),
            select: this.workoutPlanSelect,
         });

         return this.toPublicWorkoutPlan(workoutPlan);
      } catch (error) {
         handlePrismaError(error, 'workout plan');
      }
   }

   /**
    * Actualiza un plan de trabajo existente.
    *
    * @param user - Usuario autenticado
    * @param id - Identificador del plan de trabajo
    * @param updateWorkoutPlanDto - Datos de actualizacion parcial
    * @returns Plan de trabajo actualizado
    * @throws NotFoundException si el plan de trabajo no existe
    */
   async update(
      user: AuthenticatedUser,
      id: string,
      updateWorkoutPlanDto: UpdateWorkoutPlanDto,
   ) {
      // Verificamos si el plan de trabajo existe
      await this.ensureWorkoutPlanExists(user, id);

      try {
         const workoutPlan = await this.prisma.workoutPlan.update({
            where: { id },
            data: this.toUpdateData(updateWorkoutPlanDto),
            select: this.workoutPlanSelect,
         });

         return this.toPublicWorkoutPlan(workoutPlan);
      } catch (error) {
         handlePrismaError(error, 'workout plan');
      }
   }

   /**
    * Elimina un plan de trabajo existente y devuelve el registro eliminado.
    *
    * @param user - Usuario autenticado
    * @param id - Identificador del plan de trabajo
    * @returns Plan de trabajo eliminado
    * @throws NotFoundException si no existe
    */
   async remove(user: AuthenticatedUser, id: string) {
      // Verificamos si el plan de trabajo existe
      await this.ensureWorkoutPlanExists(user, id);

      const workoutPlan = await this.prisma.workoutPlan.delete({
         where: { id },
         select: this.workoutPlanSelect,
      });

      return this.toPublicWorkoutPlan(workoutPlan);
   }

   /**
    * Convierte el DTO de creacion al formato esperado por Prisma.
    *
    * @param createWorkoutPlanDto - Datos de creacion del plan de trabajo
    * @returns Datos adaptados a Prisma
    */
   private toCreateData(
      user: AuthenticatedUser,
      createWorkoutPlanDto: CreateWorkoutPlanDto,
   ): Prisma.WorkoutPlanCreateInput {
      const data: Prisma.WorkoutPlanCreateInput = {
         name: createWorkoutPlanDto.name,
         description: createWorkoutPlanDto.description,
         isActive: createWorkoutPlanDto.isActive,
         goal: createWorkoutPlanDto.goal,
         level: createWorkoutPlanDto.level,
         durationWeeks: createWorkoutPlanDto.durationWeeks,
         createdBy: {
            connect: {
               id: user.sub,
            },
         },
      };

      // Si el plan tiene un usuario asociado
      if (createWorkoutPlanDto.userId) {
         data.user = {
            connect: {
               id: createWorkoutPlanDto.userId,
            },
         };
      }

      return data;
   }

   /**
    * Convierte el DTO de actualizacion al formato de update parcial de Prisma.
    *
    * @param updateWorkoutPlanDto - Datos de actualizacion parcial
    * @returns Datos adaptados a Prisma
    */
   private toUpdateData(
      updateWorkoutPlanDto: UpdateWorkoutPlanDto,
   ): Prisma.WorkoutPlanUpdateInput {
      return {
         name: updateWorkoutPlanDto.name,
         description: updateWorkoutPlanDto.description,
         isActive: updateWorkoutPlanDto.isActive,
         goal: updateWorkoutPlanDto.goal,
         level: updateWorkoutPlanDto.level,
         durationWeeks: updateWorkoutPlanDto.durationWeeks,
      };
   }

   /**
    * Convierte un registro de Prisma al contrato publico serializable de la API.
    *
    * @param workoutPlan - Registro de plan de trabajo obtenido de Prisma
    * @returns Plan de trabajo listo para respuesta JSON
    */
   private toPublicWorkoutPlan(
      workoutPlan: SelectedWorkoutPlanRecord,
   ): WorkoutPlan {
      const data = {
         ...workoutPlan,
         createdAt: workoutPlan.createdAt.toISOString(),
         updatedAt: workoutPlan.updatedAt.toISOString(),
      };

      if (workoutPlan.userId && workoutPlan.user) {
         data.userId = workoutPlan.userId;
         data.user = {
            email: workoutPlan.user.email,
            firstName: workoutPlan.user.firstName ?? '',
            lastName: workoutPlan.user.lastName ?? '',
         };
      } else {
         data.userId = null;
         data.user = null;
      }

      return data;
   }

   /**
    * Verifica si el plan de trabajo existe antes de actualizar o eliminar.
    *
    * @param user - Usuario autenticado
    * @param id - Identificador del plan de trabajo
    * @returns Promesa resuelta cuando el plan existe y es accesible para el usuario
    * @throws NotFoundException si no existe
    */
   private async ensureWorkoutPlanExists(user: AuthenticatedUser, id: string) {
      const workoutPlan = await this.prisma.workoutPlan.findUnique({
         where: { id },
         select: { id: true, userId: true, createdById: true },
      });

      // Si no existe lanza NotFoundException
      if (!workoutPlan)
         throw new NotFoundException(`Workout plan with id "${id}" not found`);

      this.assertCanManageWorkoutPlan(user, workoutPlan);
   }

   private buildAccessiblePlansWhere(
      user: AuthenticatedUser,
      userId?: string,
   ): Prisma.WorkoutPlanWhereInput | undefined {
      if (user.role === UserRole.USER) {
         return { userId: user.sub };
      }

      if (user.role === UserRole.COACH) {
         return userId ? { userId } : { createdById: user.sub };
      }

      return userId ? { userId } : undefined;
   }

   /**
    * Comprueba si el usuario autenticado puede crear un plan de trabajo.
    *
    * @param user - Usuario autenticado que intenta crear el recurso
    * @throws BadRequestException si el usuario no tiene permiso para crear el plan
    */
   private assertCanCreateWorkoutPlan(
      user: AuthenticatedUser,
      targetUserId: string | null,
   ) {
      if (user.role === UserRole.USER && targetUserId !== user.sub) {
         throw new BadRequestException(
            'A user can only create workout plans for themselves.',
         );
      }
   }

   private assertCanAccessWorkoutPlan(
      user: AuthenticatedUser,
      workoutPlan: {
         userId: string | null;
         createdById: string;
      },
   ) {
      if (user.role === UserRole.ADMIN) {
         return;
      }

      if (
         user.role === UserRole.COACH &&
         workoutPlan.createdById !== user.sub
      ) {
         throw new NotFoundException('Workout plan not found');
      }

      if (user.role === UserRole.USER && workoutPlan.userId !== user.sub) {
         throw new NotFoundException('Workout plan not found');
      }
   }

   private assertCanManageWorkoutPlan(
      user: AuthenticatedUser,
      workoutPlan: {
         id: string;
         userId: string | null;
         createdById: string;
      },
   ) {
      if (user.role === UserRole.ADMIN) {
         return;
      }

      if (
         workoutPlan.userId !== user.sub ||
         workoutPlan.createdById !== user.sub
      ) {
         throw new NotFoundException(
            `Workout plan with id "${workoutPlan.id}" not found`,
         );
      }
   }
}
