import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, UserRole } from '@prisma/client';
import { AccountOnboardingService } from '../auth/account-onboarding.service';
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
   weightKg: number | null;
   heightCm: number | null;
   birthDate: Date | null;
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
      weightKg: true,
      heightCm: true,
      birthDate: true,
      createdAt: true,
      updatedAt: true,
   } satisfies Prisma.UserSelect;

   /**
    * Obtiene todos los usuarios ordenados por fecha de creacion descendente.
    *
    * @returns Listado de usuarios
    */
   async findAll(page: number, limit: number): Promise<UsersListResponse> {
      try {
         const [users, total] = await Promise.all([
            this.prisma.user.findMany({
               select: this.userSelect,
               orderBy: {
                  createdAt: 'desc',
               },
               skip: page * limit,
               take: limit,
            }),
            this.prisma.user.count(),
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
    * @param id - Identificador del usuario
    * @returns Usuario encontrado
    * @throws NotFoundException si no existe
    */
   async findOne(id: string): Promise<User> {
      const user = await this.prisma.user.findUnique({
         where: { id },
         select: this.userSelect,
      });

      // Si no existe lanza NotFoundException
      if (!user) throw new NotFoundException(`User with id "${id}" not found`);

      return this.toPublicUser(user);
   }

   /**
    * Crea un usuario y devuelve la version publica del registro.
    *
    * @param createUserDto - Datos de creacion del usuario
    * @returns Usuario creado
    */
   async create(createUserDto: CreateUserDto): Promise<User> {
      // Generamos una password temporal segura en backend para no depender
      // de una contraseña enviada desde el cliente.
      const temporaryPassword = generateRandomPassword();
      const passwordHash = await hashValue(temporaryPassword);

      try {
         const user = await this.prisma.user.create({
            data: this.toCreateData(createUserDto, {
               passwordHash,
               emailVerifiedAt: new Date(),
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
      await this.ensureUserExists(id);

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
    * @returns Promesa resuelta cuando el usuario existe
    * @throws NotFoundException si no existe
    */
   private async ensureUserExists(id: string) {
      const user = await this.prisma.user.findUnique({
         where: { id },
         select: { id: true },
      });

      // Si no existe lanza NotFoundException
      if (!user) throw new NotFoundException(`User with id "${id}" not found`);
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
      },
   ): Prisma.UserCreateInput {
      return {
         email: createUserDto.email,
         username: createUserDto.username,
         passwordHash: securityData.passwordHash,
         firstName: createUserDto.firstName,
         lastName: createUserDto.lastName,
         role: createUserDto.role ?? UserRole.USER,
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
      };
   }
}
