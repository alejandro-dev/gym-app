import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ExerciseCategory, MuscleGroup, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ExercisesService } from './exercises.service';

type CreateExerciseDto = {
   name: string;
   slug: string;
   description: string | null;
   instructions: string | null;
   muscleGroup: MuscleGroup;
   category: ExerciseCategory;
   equipment: string | null;
   isCompound: boolean;
};

type UpdateExerciseDto = Partial<CreateExerciseDto>;

type ExerciseRecord = {
   id: string;
   name: string;
   slug: string;
   description: string | null;
   instructions: string | null;
   muscleGroup: MuscleGroup;
   category: ExerciseCategory;
   equipment: string | null;
   isCompound: boolean;
   createdAt: Date;
   updatedAt: Date;
};

describe('ExercisesService', () => {
   let service: ExercisesService;

   const prismaMock: {
      exercise: {
         create: jest.Mock<
            Promise<ExerciseRecord>,
            [Prisma.ExerciseCreateArgs]
         >;
         findMany: jest.Mock<
            Promise<ExerciseRecord[]>,
            [Prisma.ExerciseFindManyArgs]
         >;
         count: jest.Mock<Promise<number>, [Prisma.ExerciseCountArgs?]>;
         findUnique: jest.Mock<
            Promise<ExerciseRecord | { id: string } | null>,
            [Prisma.ExerciseFindUniqueArgs]
         >;
         update: jest.Mock<
            Promise<ExerciseRecord>,
            [Prisma.ExerciseUpdateArgs]
         >;
         delete: jest.Mock<
            Promise<ExerciseRecord>,
            [Prisma.ExerciseDeleteArgs]
         >;
      };
   } = {
      exercise: {
         create: jest.fn<
            Promise<ExerciseRecord>,
            [Prisma.ExerciseCreateArgs]
         >(),
         findMany: jest.fn<
            Promise<ExerciseRecord[]>,
            [Prisma.ExerciseFindManyArgs]
         >(),
         count: jest.fn<Promise<number>, [Prisma.ExerciseCountArgs?]>(),
         findUnique: jest.fn<
            Promise<ExerciseRecord | { id: string } | null>,
            [Prisma.ExerciseFindUniqueArgs]
         >(),
         update: jest.fn<
            Promise<ExerciseRecord>,
            [Prisma.ExerciseUpdateArgs]
         >(),
         delete: jest.fn<
            Promise<ExerciseRecord>,
            [Prisma.ExerciseDeleteArgs]
         >(),
      },
   };

   const createExerciseDto: CreateExerciseDto = {
      name: 'Barbell Back Squat',
      slug: 'barbell-back-squat',
      description: 'Classic lower-body strength exercise.',
      instructions: 'Brace, descend below parallel, and drive up.',
      muscleGroup: MuscleGroup.LEGS,
      category: ExerciseCategory.STRENGTH,
      equipment: 'Barbell',
      isCompound: true,
   };

   const updatedExerciseDto: UpdateExerciseDto = {
      description: 'Updated description',
      equipment: 'Safety squat bar',
   };

   const exerciseRecord: ExerciseRecord = {
      id: 'exercise_123',
      ...createExerciseDto,
      createdAt: new Date('2026-03-21T10:00:00.000Z'),
      updatedAt: new Date('2026-03-21T10:00:00.000Z'),
   };

   const updatedExerciseRecord: ExerciseRecord = {
      ...exerciseRecord,
      ...updatedExerciseDto,
      updatedAt: new Date('2026-03-21T11:00:00.000Z'),
   };

   beforeEach(async () => {
      jest.clearAllMocks();

      const module: TestingModule = await Test.createTestingModule({
         providers: [
            ExercisesService,
            {
               provide: PrismaService,
               useValue: prismaMock,
            },
         ],
      }).compile();

      service = module.get<ExercisesService>(ExercisesService);
   });

   describe('create', () => {
      it('creates an exercise and returns the public record', async () => {
         prismaMock.exercise.create.mockResolvedValue(exerciseRecord);

         const result = await service.create(createExerciseDto);
         const [createArgs] = prismaMock.exercise.create.mock.calls[0];

         expect(createArgs.data).toEqual(createExerciseDto);
         expect(createArgs.select).toMatchObject({
            id: true,
            name: true,
            slug: true,
            description: true,
            instructions: true,
            muscleGroup: true,
            category: true,
            equipment: true,
            isCompound: true,
            createdAt: true,
            updatedAt: true,
         });
         expect(result).toEqual(exerciseRecord);
      });

      it('translates unique constraint errors into ConflictException', async () => {
         prismaMock.exercise.create.mockRejectedValue(
            new Prisma.PrismaClientKnownRequestError(
               'Unique constraint failed',
               {
                  code: 'P2002',
                  clientVersion: '6.19.2',
                  meta: {
                     target: ['name'],
                  },
               },
            ),
         );

         await expect(service.create(createExerciseDto)).rejects.toBeInstanceOf(
            ConflictException,
         );
      });
   });

   describe('findAll', () => {
      it('returns the paginated exercise list in stable read order', async () => {
         const orderedExercises = [updatedExerciseRecord, exerciseRecord];

         prismaMock.exercise.findMany.mockResolvedValue(orderedExercises);
         prismaMock.exercise.count.mockResolvedValue(2);

         const result = await service.findAll(
            1,
            5,
            'squat',
            undefined as never,
            undefined as never,
         );
         const [findManyArgs] = prismaMock.exercise.findMany.mock.calls[0];
         const [countArgs] = prismaMock.exercise.count.mock.calls[0];

         expect(findManyArgs.select).toMatchObject({
            id: true,
            name: true,
            slug: true,
            description: true,
            instructions: true,
            muscleGroup: true,
            category: true,
            equipment: true,
            isCompound: true,
            createdAt: true,
            updatedAt: true,
         });
         expect(findManyArgs.orderBy).toEqual([
            { createdAt: 'desc' },
            { id: 'desc' },
         ]);
         expect(findManyArgs.where).toEqual({
            name: { contains: 'squat', mode: 'insensitive' },
         });
         expect(findManyArgs.skip).toBe(5);
         expect(findManyArgs.take).toBe(5);
         expect(countArgs).toEqual({
            where: {
               name: { contains: 'squat', mode: 'insensitive' },
            },
         });
         expect(result).toEqual({
            items: [
               {
                  ...updatedExerciseRecord,
                  createdAt: updatedExerciseRecord.createdAt.toISOString(),
                  updatedAt: updatedExerciseRecord.updatedAt.toISOString(),
               },
               {
                  ...exerciseRecord,
                  createdAt: exerciseRecord.createdAt.toISOString(),
                  updatedAt: exerciseRecord.updatedAt.toISOString(),
               },
            ],
            total: 2,
            page: 1,
            limit: 5,
         });
      });

      it('omits the search filter when no search term is provided', async () => {
         prismaMock.exercise.findMany.mockResolvedValue([]);
         prismaMock.exercise.count.mockResolvedValue(0);

         await service.findAll(
            0,
            10,
            '',
            undefined as never,
            undefined as never,
         );

         const [findManyArgs] = prismaMock.exercise.findMany.mock.calls[0];
         const [countArgs] = prismaMock.exercise.count.mock.calls[0];

         expect(findManyArgs.where).toEqual({});
         expect(countArgs).toEqual({ where: {} });
      });

      it('adds muscle group and category filters when they are provided', async () => {
         prismaMock.exercise.findMany.mockResolvedValue([]);
         prismaMock.exercise.count.mockResolvedValue(0);

         await service.findAll(
            0,
            10,
            'press',
            MuscleGroup.CHEST,
            ExerciseCategory.STRENGTH,
         );

         const [findManyArgs] = prismaMock.exercise.findMany.mock.calls[0];
         const [countArgs] = prismaMock.exercise.count.mock.calls[0];

         expect(findManyArgs.where).toEqual({
            name: { contains: 'press', mode: 'insensitive' },
            muscleGroup: MuscleGroup.CHEST,
            category: ExerciseCategory.STRENGTH,
         });
         expect(countArgs).toEqual({
            where: {
               name: { contains: 'press', mode: 'insensitive' },
               muscleGroup: MuscleGroup.CHEST,
               category: ExerciseCategory.STRENGTH,
            },
         });
      });
   });

   describe('findOne', () => {
      it('returns the exercise when it exists', async () => {
         prismaMock.exercise.findUnique.mockResolvedValue(exerciseRecord);

         const result = await service.findOne(exerciseRecord.id);
         const [findUniqueArgs] = prismaMock.exercise.findUnique.mock.calls[0];

         expect(findUniqueArgs.where).toEqual({ id: exerciseRecord.id });
         expect(findUniqueArgs.select).toMatchObject({
            id: true,
            name: true,
            slug: true,
            description: true,
            instructions: true,
            muscleGroup: true,
            category: true,
            equipment: true,
            isCompound: true,
            createdAt: true,
            updatedAt: true,
         });
         expect(result).toEqual(exerciseRecord);
      });

      it('throws NotFoundException when the exercise does not exist', async () => {
         prismaMock.exercise.findUnique.mockResolvedValue(null);

         await expect(
            service.findOne('missing_exercise'),
         ).rejects.toBeInstanceOf(NotFoundException);
      });
   });

   describe('update', () => {
      it('verifies existence, updates the exercise, and returns the updated record', async () => {
         prismaMock.exercise.findUnique.mockResolvedValue({
            id: exerciseRecord.id,
         });
         prismaMock.exercise.update.mockResolvedValue(updatedExerciseRecord);

         const result = await service.update(
            exerciseRecord.id,
            updatedExerciseDto,
         );
         const [findUniqueArgs] = prismaMock.exercise.findUnique.mock.calls[0];
         const [updateArgs] = prismaMock.exercise.update.mock.calls[0];

         expect(findUniqueArgs).toEqual({
            where: { id: exerciseRecord.id },
            select: { id: true },
         });
         expect(updateArgs.where).toEqual({ id: exerciseRecord.id });
         expect(updateArgs.data).toEqual({
            name: undefined,
            slug: undefined,
            description: updatedExerciseDto.description,
            instructions: undefined,
            muscleGroup: undefined,
            category: undefined,
            equipment: updatedExerciseDto.equipment,
            isCompound: undefined,
         });
         expect(updateArgs.select).toMatchObject({
            id: true,
            name: true,
            slug: true,
            description: true,
            instructions: true,
            muscleGroup: true,
            category: true,
            equipment: true,
            isCompound: true,
            createdAt: true,
            updatedAt: true,
         });
         expect(result).toEqual(updatedExerciseRecord);
      });

      it('throws NotFoundException when updating a missing exercise', async () => {
         prismaMock.exercise.findUnique.mockResolvedValue(null);

         await expect(
            service.update('missing_exercise', updatedExerciseDto),
         ).rejects.toBeInstanceOf(NotFoundException);
         expect(prismaMock.exercise.update).not.toHaveBeenCalled();
      });

      it('translates unique constraint errors into ConflictException', async () => {
         prismaMock.exercise.findUnique.mockResolvedValue({
            id: exerciseRecord.id,
         });
         prismaMock.exercise.update.mockRejectedValue(
            new Prisma.PrismaClientKnownRequestError(
               'Unique constraint failed',
               {
                  code: 'P2002',
                  clientVersion: '6.19.2',
                  meta: {
                     target: ['slug'],
                  },
               },
            ),
         );

         await expect(
            service.update(exerciseRecord.id, updatedExerciseDto),
         ).rejects.toBeInstanceOf(ConflictException);
      });
   });

   describe('remove', () => {
      it('verifies existence and returns the deleted exercise', async () => {
         prismaMock.exercise.findUnique.mockResolvedValue({
            id: exerciseRecord.id,
         });
         prismaMock.exercise.delete.mockResolvedValue(exerciseRecord);

         const result = await service.remove(exerciseRecord.id);
         const [findUniqueArgs] = prismaMock.exercise.findUnique.mock.calls[0];
         const [deleteArgs] = prismaMock.exercise.delete.mock.calls[0];

         expect(findUniqueArgs).toEqual({
            where: { id: exerciseRecord.id },
            select: { id: true },
         });
         expect(deleteArgs.where).toEqual({ id: exerciseRecord.id });
         expect(deleteArgs.select).toMatchObject({
            id: true,
            name: true,
            slug: true,
            description: true,
            instructions: true,
            muscleGroup: true,
            equipment: true,
            isCompound: true,
            createdAt: true,
            updatedAt: true,
         });
         expect(result).toEqual(exerciseRecord);
      });

      it('throws NotFoundException when removing a missing exercise', async () => {
         prismaMock.exercise.findUnique.mockResolvedValue(null);

         await expect(
            service.remove('missing_exercise'),
         ).rejects.toBeInstanceOf(NotFoundException);
         expect(prismaMock.exercise.delete).not.toHaveBeenCalled();
      });
   });
});
