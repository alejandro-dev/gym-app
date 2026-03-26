import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { handlePrismaError } from '../prisma/prisma-error.util';
import { CreatePersonalRecordDto } from './dto/create-personal-record.dto';
import { UpdatePersonalRecordDto } from './dto/update-personal-record.dto';
import { AuthenticatedUser } from 'src/auth/interfaces/authenticated-user.interface';

/**
 * Servicio base para operaciones del dominio de records personales.
 */
@Injectable()
export class PersonalRecordsService {
   /**
    * Crea una nueva instancia del servicio de records personales.
    *
    * @param prisma - Cliente de Prisma compartido por la aplicacion
    */
   constructor(private readonly prisma: PrismaService) {}

   /**
    * Selecciona los campos publicos de un record personal.
    */
   private readonly personalRecordSelect = {
      id: true,
      userId: true,
      exerciseId: true,
      metric: true,
      value: true,
      achievedAt: true,
      createdAt: true,
   } satisfies Prisma.PersonalRecordSelect;

   /**
    * Obtiene todos los records personales ordenados por fecha de logro descendente.
    *
    * @param user - Usuario autenticado
    * @returns Listado de records accesibles para el usuario autenticado
    */
   async findAll(user: AuthenticatedUser) {
      return await this.prisma.personalRecord.findMany({
         select: this.personalRecordSelect,
         where: user.role === UserRole.USER ? { userId: user.sub } : undefined,
         orderBy: [{ achievedAt: 'desc' }, { createdAt: 'desc' }],
      });
   }

   /**
    * Obtiene un record personal por id.
    *
    * @param user - Usuario autenticado
    * @param id - Identificador del record
    * @returns Record encontrado
    * @throws NotFoundException si no existe
    */
   async findOne(user: AuthenticatedUser, id: string) {
      const personalRecord = await this.prisma.personalRecord.findUnique({
         where: {
            id,
            userId: user.role === UserRole.USER ? user.sub : undefined,
         },
         select: this.personalRecordSelect,
      });

      if (!personalRecord) {
         throw new NotFoundException(
            `Personal record with id "${id}" not found`,
         );
      }

      return personalRecord;
   }

   /**
    * Crea un record personal y devuelve su version publica.
    *
    * @param createPersonalRecordDto - Datos de creacion
    * @returns Record creado
    */
   async create(createPersonalRecordDto: CreatePersonalRecordDto) {
      try {
         return await this.prisma.personalRecord.create({
            data: this.toCreateData(createPersonalRecordDto),
            select: this.personalRecordSelect,
         });
      } catch (error) {
         handlePrismaError(error, 'personal record');
      }
   }

   /**
    * Actualiza un record personal existente.
    *
    * @param user - Usuario autenticado
    * @param id - Identificador del record
    * @param updatePersonalRecordDto - Datos de actualizacion parcial
    * @returns Record actualizado
    * @throws NotFoundException si no existe
    */
   async update(
      user: AuthenticatedUser,
      id: string,
      updatePersonalRecordDto: UpdatePersonalRecordDto,
   ) {
      await this.ensurePersonalRecordExists(user, id);

      try {
         return await this.prisma.personalRecord.update({
            where: { id },
            data: this.toUpdateData(updatePersonalRecordDto),
            select: this.personalRecordSelect,
         });
      } catch (error) {
         handlePrismaError(error, 'personal record');
      }
   }

   /**
    * Elimina un record personal existente.
    *
    * @param user - Usuario autenticado
    * @param id - Identificador del record
    * @returns Record eliminado
    * @throws NotFoundException si no existe
    */
   async remove(user: AuthenticatedUser, id: string) {
      await this.ensurePersonalRecordExists(user, id);

      return await this.prisma.personalRecord.delete({
         where: { id },
         select: this.personalRecordSelect,
      });
   }

   /**
    * Convierte el DTO de creacion al formato esperado por Prisma.
    *
    * @param createPersonalRecordDto - Datos de creacion
    * @returns Datos adaptados a Prisma
    */
   private toCreateData(
      createPersonalRecordDto: CreatePersonalRecordDto,
   ): Prisma.PersonalRecordCreateInput {
      return {
         user: {
            connect: {
               id: createPersonalRecordDto.userId,
            },
         },
         exercise: {
            connect: {
               id: createPersonalRecordDto.exerciseId,
            },
         },
         metric: createPersonalRecordDto.metric,
         value: createPersonalRecordDto.value,
         achievedAt: new Date(createPersonalRecordDto.achievedAt),
      };
   }

   /**
    * Convierte el DTO de actualizacion al formato de Prisma.
    *
    * @param updatePersonalRecordDto - Datos de actualizacion parcial
    * @returns Datos adaptados a Prisma
    */
   private toUpdateData(
      updatePersonalRecordDto: UpdatePersonalRecordDto,
   ): Prisma.PersonalRecordUpdateInput {
      return {
         metric: updatePersonalRecordDto.metric,
         value: updatePersonalRecordDto.value,
         achievedAt:
            updatePersonalRecordDto.achievedAt === undefined
               ? undefined
               : new Date(updatePersonalRecordDto.achievedAt),
      };
   }

   /**
    * Verifica si el record existe antes de actualizar o eliminar.
    *
    * @param user - Usuario autenticado
    * @param id - Identificador del record
    * @returns Promesa resuelta cuando el record existe y es accesible para el usuario
    * @throws NotFoundException si no existe
    */
   private async ensurePersonalRecordExists(
      user: AuthenticatedUser,
      id: string,
   ) {
      const personalRecord = await this.prisma.personalRecord.findUnique({
         where: {
            id,
            userId: user.role === UserRole.USER ? user.sub : undefined,
         },
         select: { id: true },
      });

      if (!personalRecord) {
         throw new NotFoundException(
            `Personal record with id "${id}" not found`,
         );
      }
   }
}
