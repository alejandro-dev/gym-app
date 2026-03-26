import { Test, TestingModule } from '@nestjs/testing';
import { PersonalRecordMetric, Prisma, UserRole } from '@prisma/client';
import { PersonalRecordsService } from './personal-records.service';
import { PrismaService } from '../prisma/prisma.service';
import {
   InternalServerErrorException,
   NotFoundException,
} from '@nestjs/common';

describe('PersonalRecordsService', () => {
   let service: PersonalRecordsService;
   const currentUser = {
      sub: 'user_123',
      email: 'user@example.com',
      role: UserRole.USER,
      tokenType: 'access' as const,
   };

   type PersonalRecordRecord = {
      id: string;
      userId: string;
      exerciseId: string;
      metric: PersonalRecordMetric;
      value: number;
      achievedAt: Date;
      createdAt: Date;
   };

   const prismaMock = {
      personalRecord: {
         create: jest.fn<
            Promise<PersonalRecordRecord>,
            [Prisma.PersonalRecordCreateArgs]
         >(),
         findMany: jest.fn<
            Promise<PersonalRecordRecord[]>,
            [Prisma.PersonalRecordFindManyArgs]
         >(),
         findUnique: jest.fn<
            Promise<PersonalRecordRecord | { id: string } | null>,
            [Prisma.PersonalRecordFindUniqueArgs]
         >(),
         update: jest.fn<
            Promise<PersonalRecordRecord>,
            [Prisma.PersonalRecordUpdateArgs]
         >(),
         delete: jest.fn<
            Promise<PersonalRecordRecord>,
            [Prisma.PersonalRecordDeleteArgs]
         >(),
      },
   };

   const createPersonalRecordDto = {
      userId: 'user_123',
      exerciseId: 'exercise_123',
      metric: PersonalRecordMetric.ESTIMATED_1RM,
      value: 120,
      achievedAt: '2026-03-23T10:00:00.000Z',
   };

   const personalRecordRecord: PersonalRecordRecord = {
      id: 'personalRecord_123',
      userId: 'user_123',
      exerciseId: 'exercise_123',
      metric: PersonalRecordMetric.ESTIMATED_1RM,
      value: 120,
      achievedAt: new Date('2026-03-23T10:00:00.000Z'),
      createdAt: new Date('2026-03-23T10:05:00.000Z'),
   };

   beforeEach(async () => {
      jest.clearAllMocks();

      const module: TestingModule = await Test.createTestingModule({
         providers: [
            PersonalRecordsService,
            {
               provide: PrismaService,
               useValue: prismaMock,
            },
         ],
      }).compile();

      service = module.get<PersonalRecordsService>(PersonalRecordsService);
   });

   it('creates a personal record and returns the public record', async () => {
      prismaMock.personalRecord.create.mockResolvedValue(personalRecordRecord);

      const result = await service.create(createPersonalRecordDto);
      const [createArgs] = prismaMock.personalRecord.create.mock.calls[0];

      expect(createArgs.data).toEqual({
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
      });
      expect(createArgs.select).toMatchObject({
         id: true,
         userId: true,
         exerciseId: true,
         metric: true,
         value: true,
         achievedAt: true,
         createdAt: true,
      });
      expect(result).toEqual(personalRecordRecord);
   });

   it('translates unexpected database errors into InternalServerErrorException', async () => {
      prismaMock.personalRecord.create.mockRejectedValue(
         new Error('db unavailable'),
      );

      await expect(
         service.create(createPersonalRecordDto),
      ).rejects.toBeInstanceOf(InternalServerErrorException);
   });

   it('returns the personal record list in stable read order', async () => {
      prismaMock.personalRecord.findMany.mockResolvedValue([
         personalRecordRecord,
      ]);

      const result = await service.findAll(currentUser);
      const [findManyArgs] = prismaMock.personalRecord.findMany.mock.calls[0];

      expect(findManyArgs.select).toMatchObject({
         id: true,
         userId: true,
         exerciseId: true,
         metric: true,
         value: true,
         achievedAt: true,
         createdAt: true,
      });
      expect(findManyArgs.orderBy).toEqual([
         { achievedAt: 'desc' },
         { createdAt: 'desc' },
      ]);
      expect(findManyArgs.where).toEqual({ userId: currentUser.sub });
      expect(result).toEqual([personalRecordRecord]);
   });

   it('returns the personal record when it exists', async () => {
      prismaMock.personalRecord.findUnique.mockResolvedValue(
         personalRecordRecord,
      );

      const result = await service.findOne(
         currentUser,
         personalRecordRecord.id,
      );
      const [findUniqueArgs] =
         prismaMock.personalRecord.findUnique.mock.calls[0];

      expect(findUniqueArgs.where).toEqual({
         id: personalRecordRecord.id,
         userId: currentUser.sub,
      });
      expect(findUniqueArgs.select).toBeDefined();
      expect(result).toEqual(personalRecordRecord);
   });

   it('throws NotFoundException when the personal record does not exist', async () => {
      prismaMock.personalRecord.findUnique.mockResolvedValue(null);

      await expect(
         service.findOne(currentUser, 'missing_personalRecord'),
      ).rejects.toBeInstanceOf(NotFoundException);
   });

   it('updates the personal record and returns the updated record', async () => {
      prismaMock.personalRecord.findUnique.mockResolvedValue({
         id: personalRecordRecord.id,
      });
      prismaMock.personalRecord.update.mockResolvedValue({
         ...personalRecordRecord,
         value: 125,
      });
      const result = await service.update(
         currentUser,
         personalRecordRecord.id,
         {
            value: 125,
         },
      );
      const [findUniqueArgs] =
         prismaMock.personalRecord.findUnique.mock.calls[0];
      const [updateArgs] = prismaMock.personalRecord.update.mock.calls[0];

      expect(findUniqueArgs).toEqual({
         where: { id: personalRecordRecord.id, userId: currentUser.sub },
         select: { id: true },
      });
      expect(updateArgs.where).toEqual({ id: personalRecordRecord.id });
      expect(updateArgs.data).toEqual({
         metric: undefined,
         value: 125,
         achievedAt: undefined,
      });
      expect(updateArgs.select).toBeDefined();
      expect(result).toEqual({
         ...personalRecordRecord,
         value: 125,
      });
   });

   it('throws NotFoundException when removing a missing personal record', async () => {
      prismaMock.personalRecord.findUnique.mockResolvedValue(null);

      await expect(
         service.remove(currentUser, 'missing_personalRecord'),
      ).rejects.toBeInstanceOf(NotFoundException);
   });
});
