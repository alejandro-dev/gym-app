import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { handlePrismaError } from '../prisma/prisma-error.util';

/**
 * Servicio de dominio para operaciones CRUD de usuarios.
 * Centraliza el acceso a Prisma y transforma errores de base de datos
 * en excepciones HTTP de NestJS.
 */
@Injectable()
export class UsersService {
   constructor(private readonly prisma: PrismaService) {}

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
    * Crea un usuario y devuelve la version publica del registro.
    *
    * @param createUserDto - Datos de creacion del usuario
    * @returns Usuario creado
    */
   async create(createUserDto: CreateUserDto) {
      try {
         return await this.prisma.user.create({
            data: this.toCreateData(createUserDto),
            select: this.userSelect,
         });
      } catch (error) {
         handlePrismaError(error, 'user');
      }
   }

   /**
    * Obtiene todos los usuarios ordenados por fecha de creacion descendente.
    *
    * @returns Listado de usuarios
    */
   async findAll() {
      return this.prisma.user.findMany({
         select: this.userSelect,
         orderBy: {
            createdAt: 'desc',
         },
      });
   }

   /**
    * Obtiene un usuario por id.
    *
    * @param id - Identificador del usuario
    * @returns Usuario encontrado
    * @throws NotFoundException si no existe
    */
   async findOne(id: string) {
      const user = await this.prisma.user.findUnique({
         where: { id },
         select: this.userSelect,
      });

      // Si no existe lanza NotFoundException
      if (!user) throw new NotFoundException(`User with id "${id}" not found`);

      return user;
   }

   /**
    * Actualiza un usuario existente.
    *
    * @param id - Identificador del usuario
    * @param updateUserDto - Datos de actualizacion parcial
    * @returns Usuario actualizado
    * @throws NotFoundException si el usuario no existe
    */
   async update(id: string, updateUserDto: UpdateUserDto) {
      await this.ensureUserExists(id);

      try {
         return await this.prisma.user.update({
            where: { id },
            data: this.toUpdateData(updateUserDto),
            select: this.userSelect,
         });
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
   async remove(id: string) {
      await this.ensureUserExists(id);

      return this.prisma.user.delete({
         where: { id },
         select: this.userSelect,
      });
   }

   /**
    * Convierte el DTO de creacion al formato esperado por Prisma.
    *
    * @param createUserDto - Datos de creacion del usuario
    * @returns Datos adaptados a Prisma
    */
   private toCreateData(createUserDto: CreateUserDto): Prisma.UserCreateInput {
      return {
         email: createUserDto.email,
         username: createUserDto.username,
         passwordHash: createUserDto.passwordHash,
         firstName: createUserDto.firstName,
         lastName: createUserDto.lastName,
         role: createUserDto.role ?? UserRole.USER,
         weightKg: createUserDto.weightKg,
         heightCm: createUserDto.heightCm,
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
}
