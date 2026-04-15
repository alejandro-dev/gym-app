import {
   BadRequestException,
   Injectable,
   NotFoundException,
} from '@nestjs/common';
import { Prisma, UserRole } from '@prisma/client';
import { AccountOnboardingService } from '../auth/account-onboarding.service';
import { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { handlePrismaError } from '../prisma/prisma-error.util';
import type { User, UsersListResponse } from '@gym-app/types';
import { generateRandomPassword } from './utils/generate-random-password.util';
import { hashValue } from '../auth/utils/hash-value.utils';

type SelectedUserRecord = {
   id: string;
   email: string;
   username: string | null;
   firstName: string | null;
   lastName: string | null;
   role: UserRole;
   coachId: string | null;
   weightKg: number | null;
   heightCm: number | null;
   birthDate: Date | null;
   emailVerifiedAt: Date | null;
   createdAt: Date;
   updatedAt: Date;
};

/**
 * Servicio de dominio para operaciones CRUD de usuarios.
 * Centraliza el acceso a Prisma y transforma errores de base de datos
 * en excepciones HTTP de NestJS.
 */
@Injectable()
export class UsersService {
   /**
    * Inyecta el servicio de Prisma para acceso a la base de datos.
    *
    * @param prisma - Cliente de Prisma para consultas a la base de datos
    * @param accountOnboardingService - Servicio compartido para onboarding de cuentas
    */
   constructor(
      private readonly prisma: PrismaService,
      private readonly accountOnboardingService: AccountOnboardingService,
   ) {}

   /**
    * Selecciona los campos de un usuario para la consulta.
    */
   private readonly userSelect = {
      id: true,
      email: true,
      username: true,
      firstName: true,
      lastName: true,
      role: true,
      coachId: true,
      weightKg: true,
      heightCm: true,
      birthDate: true,
      emailVerifiedAt: true,
      createdAt: true,
      updatedAt: true,
   } satisfies Prisma.UserSelect;

   /**
    * Obtiene todos los usuarios ordenados por fecha de creacion descendente.
    *
    * @param currentUser - Usuario autenticado que determina el alcance de acceso
    * @param page - Numero de pagina base cero
    * @param limit - Cantidad maxima de usuarios por pagina
    * @param search - Cadena de búsqueda para filtrar usuarios
    * @param roleFilter - Rol de usuario para filtrar cuando el acceso lo permite
    *
    * @returns Listado de usuarios
    */
   async findAll(
      currentUser: AuthenticatedUser,
      page: number,
      limit: number,
      search: string,
      roleFilter?: UserRole,
   ): Promise<UsersListResponse> {
      try {
         // Si hay una cadena de búsqueda, filtramos los usuarios por email, nombre de usuario, nombre y apellidos. Si hay un filtro de rol, filtramos por el rol especificado.
         const where: Prisma.UserWhereInput = {
            ...this.buildUserAccessWhere(currentUser, roleFilter),
            ...(search?.trim() && {
               // mode: 'insensitive',ignora mayúsculas/minúsculas
               OR: [
                  { email: { contains: search, mode: 'insensitive' } },
                  { username: { contains: search, mode: 'insensitive' } },
                  { firstName: { contains: search, mode: 'insensitive' } },
                  { lastName: { contains: search, mode: 'insensitive' } },
               ],
            }),
         };

         const [users, total] = await Promise.all([
            this.prisma.user.findMany({
               select: this.userSelect,
               where,
               orderBy: {
                  createdAt: 'desc',
               },
               skip: page * limit,
               take: limit,
            }),
            this.prisma.user.count({
               where,
            }),
         ]);

         return {
            items: users.map((user) => this.toPublicUser(user)),
            total,
            page,
            limit,
         };
      } catch (error) {
         handlePrismaError(error, 'user');
      }
   }

   /**
    * Obtiene un usuario por id.
    *
    * @param currentUser - Usuario autenticado que solicita el recurso
    * @param id - Identificador del usuario
    * @returns Usuario encontrado
    * @throws NotFoundException si no existe
    */
   async findOne(currentUser: AuthenticatedUser, id: string): Promise<User> {
      const user = await this.prisma.user.findUnique({
         where: { id },
         select: this.userSelect,
      });

      // Si no existe lanza NotFoundException
      if (!user) throw new NotFoundException(`User with id "${id}" not found`);
      this.assertCanAccessUser(currentUser, user);

      return this.toPublicUser(user);
   }

   /**
    * Crea un usuario y devuelve la version publica del registro.
    *
    * @param userAuth - Usuario autenticado que solicita la creacion
    * @param createUserDto - Datos de creacion del usuario
    * @returns Usuario creado
    */
   async create(
      userAuth: AuthenticatedUser,
      createUserDto: CreateUserDto,
   ): Promise<User> {
      // Generamos una password temporal segura en backend para no depender
      // de una contraseña enviada desde el cliente.
      const temporaryPassword = generateRandomPassword();
      const passwordHash = await hashValue(temporaryPassword);

      // Resolvemos el coach asignado según las reglas de negocio y el usuario autenticado.
      const coachId = this.resolveCreateCoachId(userAuth, createUserDto);

      // Validamos que el coach asignado sea válido.
      await this.validateCoachAssignment(
         createUserDto.role ?? UserRole.USER,
         coachId,
      );

      try {
         const user = await this.prisma.user.create({
            data: this.toCreateData(createUserDto, {
               passwordHash,
               emailVerifiedAt: new Date(),
               coachId,
            }),
            select: this.userSelect,
         });

         await this.accountOnboardingService.enqueueWelcomeEmail({
            userId: user.id,
            email: user.email,
            firstName: user.firstName,
            temporaryPassword,
         });

         return this.toPublicUser(user);
      } catch (error) {
         handlePrismaError(error, 'user');
      }
   }

   /**
    * Actualiza un usuario existente.
    *
    * @param id - Identificador del usuario
    * @param updateUserDto - Datos de actualizacion parcial
    * @returns Usuario actualizado
    * @throws NotFoundException si el usuario no existe
    */
   async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
      const existingUser = await this.ensureUserExists(id);
      await this.validateCoachAssignment(
         updateUserDto.role ?? existingUser.role,
         updateUserDto.coachId,
      );

      try {
         const user = await this.prisma.user.update({
            where: { id },
            data: this.toUpdateData(updateUserDto),
            select: this.userSelect,
         });

         return this.toPublicUser(user);
      } catch (error) {
         handlePrismaError(error, 'user');
      }
   }

   /**
    * Elimina un usuario existente y devuelve el registro eliminado.
    *
    * @param id - Identificador del usuario
    * @returns Usuario eliminado
    * @throws NotFoundException si no existe
    */
   async remove(id: string): Promise<User> {
      await this.ensureUserExists(id);

      const user = await this.prisma.user.delete({
         where: { id },
         select: this.userSelect,
      });

      return this.toPublicUser(user);
   }

   /**
    * Verifica si el usuario existe antes de actualizar o eliminar.
    *
    * @param id - Identificador del usuario
    * @returns Usuario mínimo necesario para validaciones posteriores
    * @throws NotFoundException si no existe
    */
   private async ensureUserExists(id: string) {
      const user = await this.prisma.user.findUnique({
         where: { id },
         select: { id: true, role: true },
      });

      // Si no existe lanza NotFoundException
      if (!user) throw new NotFoundException(`User with id "${id}" not found`);

      return user;
   }

   /**
    * Convierte el DTO de creacion al formato esperado por Prisma.
    *
    * @param createUserDto - Datos de creacion del usuario
    * @param securityData - Datos internos de seguridad y verificación
    * @returns Datos adaptados a Prisma
    */
   private toCreateData(
      createUserDto: CreateUserDto,
      securityData: {
         passwordHash: string;
         emailVerifiedAt: Date;
         coachId?: string | null;
      },
   ): Prisma.UserCreateInput {
      return {
         email: createUserDto.email,
         username: createUserDto.username,
         passwordHash: securityData.passwordHash,
         firstName: createUserDto.firstName,
         lastName: createUserDto.lastName,
         role: createUserDto.role ?? UserRole.USER,
         coach: securityData.coachId
            ? {
                 connect: {
                    id: securityData.coachId,
                 },
              }
            : undefined,
         weightKg: createUserDto.weightKg,
         heightCm: createUserDto.heightCm,
         emailVerifiedAt: securityData.emailVerifiedAt,
         birthDate: createUserDto.birthDate
            ? new Date(createUserDto.birthDate)
            : undefined,
      };
   }

   /**
    * Convierte el DTO de actualizacion al formato de update parcial de Prisma.
    *
    * @param updateUserDto - Datos de actualizacion parcial
    * @returns Datos adaptados a Prisma
    */
   private toUpdateData(updateUserDto: UpdateUserDto): Prisma.UserUpdateInput {
      return {
         email: updateUserDto.email,
         username: updateUserDto.username,
         passwordHash: updateUserDto.passwordHash,
         firstName: updateUserDto.firstName,
         lastName: updateUserDto.lastName,
         role: updateUserDto.role,
         coach:
            updateUserDto.coachId === undefined
               ? undefined
               : updateUserDto.coachId === null
                 ? { disconnect: true }
                 : {
                      connect: {
                         id: updateUserDto.coachId,
                      },
                   },
         weightKg: updateUserDto.weightKg,
         heightCm: updateUserDto.heightCm,
         birthDate:
            updateUserDto.birthDate === undefined
               ? undefined
               : updateUserDto.birthDate === null
                 ? null
                 : new Date(updateUserDto.birthDate),
      };
   }

   /**
    * Convierte un registro de Prisma al contrato publico serializable de la API.
    *
    * @param user - Usuario seleccionado desde Prisma
    * @returns Usuario listo para respuesta JSON
    */
   private toPublicUser(user: SelectedUserRecord): User {
      return {
         ...user,
         birthDate: user.birthDate?.toISOString() ?? null,
         createdAt: user.createdAt.toISOString(),
         updatedAt: user.updatedAt.toISOString(),
         emailVerifiedAt: user.emailVerifiedAt?.toISOString() ?? null,
      };
   }

   /**
    * Construye el filtro base de acceso para el listado de usuarios.
    * Los administradores pueden filtrar por rol libremente y los coaches
    * solo ven atletas asignados a su propia cartera.
    *
    * @param currentUser - Usuario autenticado que realiza la consulta
    * @param roleFilter - Rol solicitado desde la capa HTTP
    * @returns Clausula `where` base para Prisma
    */
   private buildUserAccessWhere(
      currentUser: AuthenticatedUser,
      roleFilter?: UserRole,
   ): Prisma.UserWhereInput {
      if (currentUser.role === UserRole.COACH) {
         return {
            role: UserRole.USER,
            coachId: currentUser.sub,
         };
      }

      return {
         ...(roleFilter && {
            role: roleFilter,
         }),
      };
   }

   /**
    * Resuelve el coach asignado al crear usuarios.
    * Los coaches solo pueden crear atletas dentro de su propia cartera.
    *
    * @param currentUser - Usuario autenticado que solicita la creacion
    * @param createUserDto - Datos de creacion recibidos
    * @returns Identificador de coach a conectar, si aplica
    * @throws BadRequestException si un coach intenta crear otro rol o asignar otro coach
    */
   private resolveCreateCoachId(
      currentUser: AuthenticatedUser,
      createUserDto: CreateUserDto,
   ): string | null | undefined {
      if (currentUser.role !== UserRole.COACH) {
         return createUserDto.coachId;
      }

      const role = createUserDto.role ?? UserRole.USER;

      if (role !== UserRole.USER) {
         throw new BadRequestException(
            'Coaches can only create users with role USER.',
         );
      }

      if (createUserDto.coachId && createUserDto.coachId !== currentUser.sub) {
         throw new BadRequestException(
            'Coaches can only assign athletes to themselves.',
         );
      }

      return currentUser.sub;
   }

   /**
    * Comprueba si el usuario autenticado puede acceder al registro solicitado.
    * En el caso de un coach, el usuario debe ser un atleta asignado a ese coach.
    *
    * @param currentUser - Usuario autenticado que intenta acceder al recurso
    * @param user - Registro mínimo del usuario objetivo
    * @throws NotFoundException si el recurso queda fuera de su ámbito de acceso
    */
   private assertCanAccessUser(
      currentUser: AuthenticatedUser,
      user: Pick<SelectedUserRecord, 'id' | 'role' | 'coachId'>,
   ) {
      if (currentUser.role !== UserRole.COACH) {
         return;
      }

      if (user.role !== UserRole.USER || user.coachId !== currentUser.sub) {
         throw new NotFoundException(`User with id "${user.id}" not found`);
      }
   }

   /**
    * Valida que la asignación de coach sea coherente con las reglas de negocio.
    * Solo los usuarios con rol `USER` pueden tener coach asignado y ese coach
    * debe existir en base de datos con rol `COACH`.
    *
    * @param role - Rol final que tendrá el usuario tras la operación
    * @param coachId - Identificador opcional del coach a asignar
    * @throws BadRequestException si la asignación no es válida
    */
   private async validateCoachAssignment(
      role: UserRole,
      coachId?: string | null,
   ) {
      if (coachId === undefined || coachId === null) {
         return;
      }

      if (role !== UserRole.USER) {
         throw new BadRequestException(
            'Only users with role USER can be assigned to a coach.',
         );
      }

      const coach = await this.prisma.user.findUnique({
         where: { id: coachId },
         select: { id: true, role: true },
      });

      if (!coach || coach.role !== UserRole.COACH) {
         throw new BadRequestException(
            'The assigned coach must be an existing user with role COACH.',
         );
      }
   }
}
