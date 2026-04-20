import { Test, TestingModule } from '@nestjs/testing';
import { ExerciseCategory, MuscleGroup } from '@prisma/client';
import type { ExercisesListResponse } from '@gym-app/types';
import { unlink } from 'node:fs/promises';
import { ExercisesController } from './exercises.controller';
import { ExercisesService } from './exercises.service';

jest.mock('node:fs/promises', () => ({
   unlink: jest.fn(),
}));

type CreateExerciseDto = {
   name: string;
   slug: string;
   description: string | null;
   instructions: string | null;
   muscleGroup: MuscleGroup;
   category: ExerciseCategory;
   equipment: string | null;
   isCompound: boolean;
   videoUrl: string | null;
};

type UpdateExerciseDto = Partial<CreateExerciseDto>;

type ExerciseRecord = CreateExerciseDto & {
   id: string;
   imageUrl: string | null;
   createdAt: Date;
   updatedAt: Date;
};

describe('ExercisesController', () => {
   let controller: ExercisesController;

   const exercisesListResponse: ExercisesListResponse = {
      items: [],
      total: 0,
      page: 0,
      limit: 10,
   };

   const exercisesServiceMock: {
      create: jest.Mock<Promise<ExerciseRecord>, [CreateExerciseDto]>;
      findAll: jest.Mock<
         Promise<ExercisesListResponse>,
         [
            number,
            number,
            string,
            MuscleGroup | undefined,
            ExerciseCategory | undefined,
         ]
      >;
      findOne: jest.Mock<Promise<ExerciseRecord>, [string]>;
      update: jest.Mock<Promise<ExerciseRecord>, [string, UpdateExerciseDto]>;
      updateImage: jest.Mock<Promise<ExerciseRecord>, [string, string]>;
      remove: jest.Mock<Promise<ExerciseRecord>, [string]>;
   } = {
      create: jest.fn<Promise<ExerciseRecord>, [CreateExerciseDto]>(),
      findAll: jest.fn<
         Promise<ExercisesListResponse>,
         [
            number,
            number,
            string,
            MuscleGroup | undefined,
            ExerciseCategory | undefined,
         ]
      >(),
      findOne: jest.fn<Promise<ExerciseRecord>, [string]>(),
      update: jest.fn<Promise<ExerciseRecord>, [string, UpdateExerciseDto]>(),
      updateImage: jest.fn<Promise<ExerciseRecord>, [string, string]>(),
      remove: jest.fn<Promise<ExerciseRecord>, [string]>(),
   };

   const createExerciseDto: CreateExerciseDto = {
      name: 'Barbell Bench Press',
      slug: 'barbell-bench-press',
      description: 'Horizontal pressing movement.',
      instructions: 'Lower under control and press to lockout.',
      muscleGroup: MuscleGroup.CHEST,
      category: ExerciseCategory.STRENGTH,
      equipment: 'Barbell',
      isCompound: true,
      videoUrl: 'https://example.com/videos/barbell-bench-press.mp4',
   };

   const updateExerciseDto: UpdateExerciseDto = {
      description: 'Updated pressing movement description.',
   };

   const exerciseRecord: ExerciseRecord = {
      id: 'exercise_456',
      ...createExerciseDto,
      imageUrl: null,
      createdAt: new Date('2026-03-21T10:00:00.000Z'),
      updatedAt: new Date('2026-03-21T10:00:00.000Z'),
   };

   beforeEach(async () => {
      jest.clearAllMocks();

      const module: TestingModule = await Test.createTestingModule({
         controllers: [ExercisesController],
         providers: [
            {
               provide: ExercisesService,
               useValue: exercisesServiceMock,
            },
         ],
      }).compile();

      controller = module.get<ExercisesController>(ExercisesController);
   });

   describe('create', () => {
      it('delegates to exercisesService.create', async () => {
         exercisesServiceMock.create.mockResolvedValue(exerciseRecord);

         const result = await controller.create(createExerciseDto);

         expect(exercisesServiceMock.create).toHaveBeenCalledWith(
            createExerciseDto,
         );
         expect(result).toEqual(exerciseRecord);
      });
   });

   describe('findAll', () => {
      it('uses default pagination values when query params are missing', async () => {
         exercisesServiceMock.findAll.mockResolvedValue(exercisesListResponse);

         const result = await controller.findAll();

         expect(exercisesServiceMock.findAll).toHaveBeenCalledWith(
            0,
            10,
            '',
            undefined,
            undefined,
         );
         expect(result).toEqual(exercisesListResponse);
      });

      it('sanitizes invalid pagination values', async () => {
         exercisesServiceMock.findAll.mockResolvedValue({
            ...exercisesListResponse,
            limit: 100,
         });

         await controller.findAll('-3', '1000');

         expect(exercisesServiceMock.findAll).toHaveBeenCalledWith(
            0,
            100,
            '',
            undefined,
            undefined,
         );
      });

      it('forwards the search term to the service', async () => {
         exercisesServiceMock.findAll.mockResolvedValue(exercisesListResponse);

         await controller.findAll('2', '25', 'press');

         expect(exercisesServiceMock.findAll).toHaveBeenCalledWith(
            2,
            25,
            'press',
            undefined,
            undefined,
         );
      });

      it('forwards optional muscle group and category filters to the service', async () => {
         exercisesServiceMock.findAll.mockResolvedValue(exercisesListResponse);

         await controller.findAll(
            '1',
            '20',
            'row',
            MuscleGroup.BACK,
            ExerciseCategory.STRENGTH,
         );

         expect(exercisesServiceMock.findAll).toHaveBeenCalledWith(
            1,
            20,
            'row',
            MuscleGroup.BACK,
            ExerciseCategory.STRENGTH,
         );
      });
   });

   describe('findOne', () => {
      it('delegates to exercisesService.findOne', async () => {
         exercisesServiceMock.findOne.mockResolvedValue(exerciseRecord);

         const result = await controller.findOne(exerciseRecord.id);

         expect(exercisesServiceMock.findOne).toHaveBeenCalledWith(
            exerciseRecord.id,
         );
         expect(result).toEqual(exerciseRecord);
      });
   });

   describe('update', () => {
      it('delegates to exercisesService.update', async () => {
         exercisesServiceMock.update.mockResolvedValue({
            ...exerciseRecord,
            ...updateExerciseDto,
         });

         const result = await controller.update(
            exerciseRecord.id,
            updateExerciseDto,
         );

         expect(exercisesServiceMock.update).toHaveBeenCalledWith(
            exerciseRecord.id,
            updateExerciseDto,
         );
         expect(result).toEqual({
            ...exerciseRecord,
            ...updateExerciseDto,
         });
      });
   });

   describe('remove', () => {
      it('delegates to exercisesService.remove', async () => {
         exercisesServiceMock.remove.mockResolvedValue(exerciseRecord);

         const result = await controller.remove(exerciseRecord.id);

         expect(exercisesServiceMock.remove).toHaveBeenCalledWith(
            exerciseRecord.id,
         );
         expect(result).toEqual(exerciseRecord);
      });
   });

   describe('updateImage', () => {
      it('updates exercise image with the uploaded file name', async () => {
         const uploadedFile = {
            filename: 'exercise-exercise_456-image.png',
            path: '/tmp/exercise-exercise_456-image.png',
         } as Express.Multer.File;

         exercisesServiceMock.updateImage.mockResolvedValue({
            ...exerciseRecord,
            imageUrl: `/uploads/exercises/${uploadedFile.filename}`,
         });

         const result = await controller.updateImage(
            exerciseRecord.id,
            uploadedFile,
         );

         expect(exercisesServiceMock.updateImage).toHaveBeenCalledWith(
            exerciseRecord.id,
            `/uploads/exercises/${uploadedFile.filename}`,
         );
         expect(result).toEqual({
            ...exerciseRecord,
            imageUrl: `/uploads/exercises/${uploadedFile.filename}`,
         });
      });

      it('removes the uploaded file when the service fails', async () => {
         const uploadedFile = {
            filename: 'exercise-exercise_456-image.png',
            path: '/tmp/exercise-exercise_456-image.png',
         } as Express.Multer.File;
         const error = new Error('service failed');

         exercisesServiceMock.updateImage.mockRejectedValue(error);
         (unlink as jest.Mock).mockResolvedValue(undefined);

         await expect(
            controller.updateImage(exerciseRecord.id, uploadedFile),
         ).rejects.toThrow(error);

         expect(unlink).toHaveBeenCalledWith(uploadedFile.path);
      });
   });
});
