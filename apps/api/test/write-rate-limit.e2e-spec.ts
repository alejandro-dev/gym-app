import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import {
   ExerciseCategory,
   MuscleGroup,
   PersonalRecordMetric,
   UserRole,
} from '@prisma/client';
import * as cookieParser from 'cookie-parser';
import { unlink } from 'node:fs/promises';
import { join } from 'node:path';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

type AuthResponseBody = {
   user: {
      id: string;
      email: string;
      role: UserRole;
   };
   accessToken: string;
};

describe('Write rate limits (e2e)', () => {
   let app: INestApplication<App>;
   let prisma: PrismaService;
   const apiPath = (path: string) => `/api${path}`;

   beforeEach(async () => {
      const moduleFixture: TestingModule = await Test.createTestingModule({
         imports: [AppModule],
      }).compile();

      app = moduleFixture.createNestApplication();
      app.use(cookieParser());
      app.useGlobalPipes(
         new ValidationPipe({
            transform: true,
            whitelist: true,
            forbidNonWhitelisted: true,
         }),
      );
      app.setGlobalPrefix('api');

      prisma = moduleFixture.get(PrismaService);

      await app.init();
      await cleanDatabase();
   });

   afterEach(async () => {
      await cleanDatabase();
      await app.close();
   });

   it('returns 429 after exceeding the users write limit', async () => {
      const adminAccessToken = await createAuthenticatedUser(UserRole.ADMIN);

      for (let attempt = 0; attempt < 20; attempt += 1) {
         await request(app.getHttpServer())
            .post(apiPath('/users'))
            .set('Authorization', `Bearer ${adminAccessToken}`)
            .send(buildCreateUserPayload(`rate-limit-user-${attempt}`))
            .expect(201);
      }

      await request(app.getHttpServer())
         .post(apiPath('/users'))
         .set('Authorization', `Bearer ${adminAccessToken}`)
         .send(buildCreateUserPayload('rate-limit-user-overflow'))
         .expect(429);
   });

   it('returns 429 after exceeding the workout plans write limit', async () => {
      const userAccessToken = await createAuthenticatedUser(UserRole.USER);
      const ownerUserId = await findLatestUserId('user-');

      for (let attempt = 0; attempt < 20; attempt += 1) {
         await request(app.getHttpServer())
            .post(apiPath('/workout-plans'))
            .set('Authorization', `Bearer ${userAccessToken}`)
            .send(buildCreateWorkoutPlanPayload(ownerUserId, `plan-${attempt}`))
            .expect(201);
      }

      await request(app.getHttpServer())
         .post(apiPath('/workout-plans'))
         .set('Authorization', `Bearer ${userAccessToken}`)
         .send(buildCreateWorkoutPlanPayload(ownerUserId, 'plan-overflow'))
         .expect(429);
   });

   it('returns 429 after exceeding the workout sessions write limit', async () => {
      const userAccessToken = await createAuthenticatedUser(UserRole.USER);
      const ownerUserId = await findLatestUserId('user-');

      for (let attempt = 0; attempt < 20; attempt += 1) {
         await request(app.getHttpServer())
            .post(apiPath('/workout-sessions'))
            .set('Authorization', `Bearer ${userAccessToken}`)
            .send(buildCreateWorkoutSessionPayload(ownerUserId, attempt))
            .expect(201);
      }

      await request(app.getHttpServer())
         .post(apiPath('/workout-sessions'))
         .set('Authorization', `Bearer ${userAccessToken}`)
         .send(buildCreateWorkoutSessionPayload(ownerUserId, 999))
         .expect(429);
   });

   it('returns 429 after exceeding the exercise image upload limit', async () => {
      const adminAccessToken = await createAuthenticatedUser(UserRole.ADMIN);
      const exercise = await prisma.exercise.create({
         data: buildCreateExercisePayload('upload-rate-limit'),
      });
      const imageBuffer = Buffer.from(
         'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMB/6X7L6sAAAAASUVORK5CYII=',
         'base64',
      );

      let latestImageUrl: string | null = null;

      for (let attempt = 0; attempt < 5; attempt += 1) {
         const response = await request(app.getHttpServer())
            .patch(apiPath(`/exercises/${exercise.id}/image`))
            .set('Authorization', `Bearer ${adminAccessToken}`)
            .attach('image', imageBuffer, {
               filename: `exercise-${attempt}.png`,
               contentType: 'image/png',
            })
            .expect(200);

         latestImageUrl = (response.body as { imageUrl: string }).imageUrl;
      }

      await request(app.getHttpServer())
         .patch(apiPath(`/exercises/${exercise.id}/image`))
         .set('Authorization', `Bearer ${adminAccessToken}`)
         .attach('image', imageBuffer, {
            filename: 'exercise-overflow.png',
            contentType: 'image/png',
         })
         .expect(429);

      if (latestImageUrl) {
         const uploadedImagePath = join(
            process.cwd(),
            latestImageUrl.replace(/^\//, ''),
         );
         await unlink(uploadedImagePath).catch(() => undefined);
      }
   });

   it('returns 429 after exceeding the workout plan exercises write limit', async () => {
      const userAccessToken = await createAuthenticatedUser(UserRole.USER);
      const ownerUserId = await findLatestUserId('user-');
      const { workoutPlanId, exerciseIds } =
         await createWorkoutPlanExerciseDependencies(ownerUserId, 21);

      for (let attempt = 0; attempt < 20; attempt += 1) {
         await request(app.getHttpServer())
            .post(apiPath('/workout-plan-exercises'))
            .set('Authorization', `Bearer ${userAccessToken}`)
            .send(
               buildCreateWorkoutPlanExercisePayload(
                  workoutPlanId,
                  exerciseIds[attempt],
                  attempt + 1,
               ),
            )
            .expect(201);
      }

      await request(app.getHttpServer())
         .post(apiPath('/workout-plan-exercises'))
         .set('Authorization', `Bearer ${userAccessToken}`)
         .send(
            buildCreateWorkoutPlanExercisePayload(
               workoutPlanId,
               exerciseIds[20],
               21,
            ),
         )
         .expect(429);
   });

   it('returns 429 after exceeding the workout sets write limit', async () => {
      const userAccessToken = await createAuthenticatedUser(UserRole.USER);
      const ownerUserId = await findLatestUserId('user-');
      const { workoutSessionId, exerciseIds } =
         await createWorkoutSetDependencies(ownerUserId, 21);

      for (let attempt = 0; attempt < 20; attempt += 1) {
         await request(app.getHttpServer())
            .post(apiPath('/workout-sets'))
            .set('Authorization', `Bearer ${userAccessToken}`)
            .send(
               buildCreateWorkoutSetPayload(
                  workoutSessionId,
                  exerciseIds[attempt],
                  1,
               ),
            )
            .expect(201);
      }

      await request(app.getHttpServer())
         .post(apiPath('/workout-sets'))
         .set('Authorization', `Bearer ${userAccessToken}`)
         .send(
            buildCreateWorkoutSetPayload(workoutSessionId, exerciseIds[20], 1),
         )
         .expect(429);
   });

   it('returns 429 after exceeding the personal records write limit', async () => {
      const userAccessToken = await createAuthenticatedUser(UserRole.USER);
      const ownerUserId = await findLatestUserId('user-');
      const exerciseIds = await createExerciseRecords(21, 'personal-record');

      for (let attempt = 0; attempt < 20; attempt += 1) {
         await request(app.getHttpServer())
            .post(apiPath('/personal-records'))
            .set('Authorization', `Bearer ${userAccessToken}`)
            .send(
               buildCreatePersonalRecordPayload(
                  ownerUserId,
                  exerciseIds[attempt],
                  attempt,
               ),
            )
            .expect(201);
      }

      await request(app.getHttpServer())
         .post(apiPath('/personal-records'))
         .set('Authorization', `Bearer ${userAccessToken}`)
         .send(
            buildCreatePersonalRecordPayload(ownerUserId, exerciseIds[20], 20),
         )
         .expect(429);
   });

   async function createAuthenticatedUser(role: UserRole) {
      const email = `${role.toLowerCase()}-${Date.now()}-${Math.random()
         .toString(36)
         .slice(2)}@example.com`;
      const password = 'supersecreto123';

      await request(app.getHttpServer())
         .post(apiPath('/auth/register'))
         .send({
            email,
            password,
            username: email.split('@')[0],
            firstName: role,
         })
         .expect(201);

      const user = await prisma.user.update({
         where: { email },
         data: {
            role,
            emailVerifiedAt: new Date(),
            emailVerificationTokenHash: null,
            emailVerificationExpiresAt: null,
         },
      });

      const loginResponse = await request(app.getHttpServer())
         .post(apiPath('/auth/login'))
         .send({ email, password })
         .expect(201);
      const loginBody = loginResponse.body as AuthResponseBody;

      expect(loginBody.user).toEqual(
         expect.objectContaining({ id: user.id, email, role }),
      );

      return loginBody.accessToken;
   }

   async function findLatestUserId(prefix: string) {
      const user = await prisma.user.findFirstOrThrow({
         where: { email: { contains: prefix } },
         orderBy: { createdAt: 'desc' },
      });

      return user.id;
   }

   function buildCreateUserPayload(suffix: string) {
      return {
         email: `${suffix}-${Date.now()}-${Math.random()
            .toString(36)
            .slice(2)}@example.com`,
         firstName: 'Rate',
         lastName: 'Limited',
         role: UserRole.USER,
      };
   }

   function buildCreateWorkoutPlanPayload(userId: string, suffix: string) {
      return {
         name: `Workout Plan ${suffix}`,
         description: `Description for ${suffix}`,
         userId,
         isActive: true,
      };
   }

   function buildCreateWorkoutSessionPayload(userId: string, attempt: number) {
      return {
         userId,
         name: `Session ${attempt}`,
         notes: `Rate limit session ${attempt}`,
         startedAt: new Date(
            Date.UTC(2026, 2, 23, 10, attempt, 0),
         ).toISOString(),
         endedAt: null,
      };
   }

   function buildCreateExercisePayload(suffix: string) {
      return {
         name: `Exercise ${suffix}`,
         slug: `exercise-${suffix}`,
         description: `Description for ${suffix}`,
         instructions: `Instructions for ${suffix}`,
         muscleGroup: MuscleGroup.LEGS,
         category: ExerciseCategory.STRENGTH,
         equipment: 'Barbell',
         isCompound: true,
      };
   }

   function buildCreateWorkoutPlanExercisePayload(
      workoutPlanId: string,
      exerciseId: string,
      order: number,
   ) {
      return {
         workoutPlanId,
         exerciseId,
         day: null,
         order,
         targetSets: 4,
         targetRepsMin: 8,
         targetRepsMax: 10,
         targetWeightKg: 60,
         restSeconds: 90,
         notes: `Exercise order ${order}`,
      };
   }

   function buildCreateWorkoutSetPayload(
      workoutSessionId: string,
      exerciseId: string,
      setNumber: number,
   ) {
      return {
         workoutSessionId,
         exerciseId,
         setNumber,
         reps: 10,
         weightKg: 80,
         durationSeconds: null,
         distanceMeters: null,
         rir: 2,
         isWarmup: false,
         isCompleted: true,
      };
   }

   function buildCreatePersonalRecordPayload(
      userId: string,
      exerciseId: string,
      offset: number,
   ) {
      return {
         userId,
         exerciseId,
         metric: PersonalRecordMetric.ESTIMATED_1RM,
         value: 100 + offset,
         achievedAt: new Date(
            Date.UTC(2026, 2, 23, 10, offset, 0),
         ).toISOString(),
      };
   }

   async function createExerciseRecords(count: number, prefix: string) {
      const exercises = await Promise.all(
         Array.from({ length: count }, async (_, index) =>
            prisma.exercise.create({
               data: buildCreateExercisePayload(`${prefix}-${index}`),
            }),
         ),
      );

      return exercises.map((exercise) => exercise.id);
   }

   async function createWorkoutPlanExerciseDependencies(
      ownerUserId: string,
      count: number,
   ) {
      const workoutPlan = await prisma.workoutPlan.create({
         data: {
            name: `Workout Plan rate-limit-${Date.now()}`,
            description: 'Plan para probar rate limits de ejercicios de plan',
            isActive: true,
            user: { connect: { id: ownerUserId } },
            createdBy: { connect: { id: ownerUserId } },
         },
      });
      const exerciseIds = await createExerciseRecords(count, 'plan-exercise');

      return { workoutPlanId: workoutPlan.id, exerciseIds };
   }

   async function createWorkoutSetDependencies(
      ownerUserId: string,
      count: number,
   ) {
      const workoutSession = await prisma.workoutSession.create({
         data: {
            user: { connect: { id: ownerUserId } },
            name: `Workout Session rate-limit-${Date.now()}`,
            startedAt: new Date('2026-03-23T10:00:00.000Z'),
         },
      });
      const exerciseIds = await createExerciseRecords(count, 'workout-set');

      return { workoutSessionId: workoutSession.id, exerciseIds };
   }

   async function cleanDatabase() {
      await prisma.personalRecord.deleteMany();
      await prisma.workoutSet.deleteMany();
      await prisma.workoutPlanExercise.deleteMany();
      await prisma.workoutSession.deleteMany();
      await prisma.workoutPlan.deleteMany();
      await prisma.exercise.deleteMany();
      await prisma.user.deleteMany();
   }
});
