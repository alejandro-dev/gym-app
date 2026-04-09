import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UserRole } from '@prisma/client';
import * as cookieParser from 'cookie-parser';
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

type WorkoutSessionListItem = {
   id: string;
   workoutPlanId: string | null;
};

describe('WorkoutSessionsController (e2e)', () => {
   let app: INestApplication<App>;
   let prisma: PrismaService;
   let ownerUserId: string;
   let userAccessToken: string;
   let workoutPlanId: string;
   const apiPath = (path: string) => `/api${path}`;
   const anyString = expect.any(String) as unknown as string;

   beforeAll(async () => {
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

      userAccessToken = await createAuthenticatedUser(UserRole.USER);
      const user = await prisma.user.findFirstOrThrow({
         where: { email: { contains: 'user-' } },
         orderBy: { createdAt: 'desc' },
      });
      ownerUserId = user.id;
   });

   beforeEach(async () => {
      await prisma.personalRecord.deleteMany();
      await prisma.workoutSet.deleteMany();
      await prisma.workoutPlanExercise.deleteMany();
      await prisma.workoutSession.deleteMany();
      await prisma.workoutPlan.deleteMany();
      await prisma.exercise.deleteMany();

      const workoutPlan = await prisma.workoutPlan.create({
         data: {
            name: `Workout Plan ${Date.now()}`,
            description: 'Plan asociado a sesiones',
            isActive: true,
            user: {
               connect: {
                  id: ownerUserId,
               },
            },
            createdBy: {
               connect: {
                  id: ownerUserId,
               },
            },
         },
      });

      workoutPlanId = workoutPlan.id;
   });

   afterAll(async () => {
      await cleanDatabase();
      await app.close();
   });

   it('creates a workout session without a plan', async () => {
      const payload = {
         userId: ownerUserId,
         name: 'Cardio libre',
         notes: null,
         startedAt: '2026-03-23T18:00:00.000Z',
         endedAt: null,
      };

      const response = await request(app.getHttpServer())
         .post(apiPath('/workout-sessions'))
         .set('Authorization', `Bearer ${userAccessToken}`)
         .send(payload)
         .expect(201);
      const createdSession = response.body as Record<string, unknown>;

      expect(createdSession).toEqual(
         expect.objectContaining({
            userId: ownerUserId,
            workoutPlanId: null,
            name: payload.name,
            notes: null,
            id: anyString,
         }),
      );
   });

   it('creates a workout session with a plan', async () => {
      const payload = {
         userId: ownerUserId,
         workoutPlanId,
         name: 'Pierna pesada',
         notes: 'Sesion planificada',
         startedAt: '2026-03-23T10:00:00.000Z',
         endedAt: '2026-03-23T11:15:00.000Z',
      };

      const response = await request(app.getHttpServer())
         .post(apiPath('/workout-sessions'))
         .set('Authorization', `Bearer ${userAccessToken}`)
         .send(payload)
         .expect(201);
      const createdSession = response.body as Record<string, unknown>;

      expect(createdSession).toEqual(
         expect.objectContaining({
            userId: ownerUserId,
            workoutPlanId,
            name: payload.name,
            notes: payload.notes,
            id: anyString,
         }),
      );
   });

   it('lists workout sessions showing workoutPlanId as string or null', async () => {
      const withoutPlan = await prisma.workoutSession.create({
         data: {
            user: { connect: { id: ownerUserId } },
            name: 'Libre',
            startedAt: new Date('2026-03-23T18:00:00.000Z'),
         },
      });

      const withPlan = await prisma.workoutSession.create({
         data: {
            user: { connect: { id: ownerUserId } },
            workoutPlan: { connect: { id: workoutPlanId } },
            name: 'Con plan',
            startedAt: new Date('2026-03-23T10:00:00.000Z'),
         },
      });

      const response = await request(app.getHttpServer())
         .get(apiPath('/workout-sessions'))
         .set('Authorization', `Bearer ${userAccessToken}`)
         .expect(200);
      const sessions = response.body as WorkoutSessionListItem[];

      expect(sessions).toHaveLength(2);
      expect(sessions.map((session) => session.id)).toEqual(
         expect.arrayContaining([withoutPlan.id, withPlan.id]),
      );
      expect(sessions).toEqual(
         expect.arrayContaining([
            expect.objectContaining({
               id: withoutPlan.id,
               workoutPlanId: null,
            }),
            expect.objectContaining({ id: withPlan.id, workoutPlanId }),
         ]),
      );
   });

   it('returns a workout session by id', async () => {
      const workoutSession = await prisma.workoutSession.create({
         data: {
            user: { connect: { id: ownerUserId } },
            name: 'Upper body',
            startedAt: new Date('2026-03-23T10:00:00.000Z'),
         },
      });

      const response = await request(app.getHttpServer())
         .get(apiPath(`/workout-sessions/${workoutSession.id}`))
         .set('Authorization', `Bearer ${userAccessToken}`)
         .expect(200);

      expect(response.body).toEqual(
         expect.objectContaining({
            id: workoutSession.id,
            userId: ownerUserId,
            workoutPlanId: null,
            name: workoutSession.name,
         }),
      );
   });

   it('returns 404 when the workout session does not exist', async () => {
      await request(app.getHttpServer())
         .get(apiPath('/workout-sessions/missing-workout-session-id'))
         .set('Authorization', `Bearer ${userAccessToken}`)
         .expect(404);
   });

   it('updates a workout session to attach a plan', async () => {
      const workoutSession = await prisma.workoutSession.create({
         data: {
            user: { connect: { id: ownerUserId } },
            name: 'Libre',
            startedAt: new Date('2026-03-23T18:00:00.000Z'),
         },
      });

      const response = await request(app.getHttpServer())
         .patch(apiPath(`/workout-sessions/${workoutSession.id}`))
         .set('Authorization', `Bearer ${userAccessToken}`)
         .send({ workoutPlanId })
         .expect(200);

      expect(response.body).toEqual(
         expect.objectContaining({
            id: workoutSession.id,
            workoutPlanId,
         }),
      );
   });

   it('updates a workout session to change plan', async () => {
      const anotherPlan = await prisma.workoutPlan.create({
         data: {
            name: `Workout Plan alt ${Date.now()}`,
            description: 'Plan alternativo',
            isActive: true,
            user: {
               connect: {
                  id: ownerUserId,
               },
            },
            createdBy: {
               connect: {
                  id: ownerUserId,
               },
            },
         },
      });

      const workoutSession = await prisma.workoutSession.create({
         data: {
            user: { connect: { id: ownerUserId } },
            workoutPlan: { connect: { id: workoutPlanId } },
            name: 'Sesion vinculada',
            startedAt: new Date('2026-03-23T10:00:00.000Z'),
         },
      });

      const response = await request(app.getHttpServer())
         .patch(apiPath(`/workout-sessions/${workoutSession.id}`))
         .set('Authorization', `Bearer ${userAccessToken}`)
         .send({ workoutPlanId: anotherPlan.id })
         .expect(200);

      expect(response.body).toEqual(
         expect.objectContaining({
            id: workoutSession.id,
            workoutPlanId: anotherPlan.id,
         }),
      );
   });

   it('updates a workout session to detach the plan with null', async () => {
      const workoutSession = await prisma.workoutSession.create({
         data: {
            user: { connect: { id: ownerUserId } },
            workoutPlan: { connect: { id: workoutPlanId } },
            name: 'Sesion vinculada',
            startedAt: new Date('2026-03-23T10:00:00.000Z'),
         },
      });

      const response = await request(app.getHttpServer())
         .patch(apiPath(`/workout-sessions/${workoutSession.id}`))
         .set('Authorization', `Bearer ${userAccessToken}`)
         .send({ workoutPlanId: null })
         .expect(200);

      expect(response.body).toEqual(
         expect.objectContaining({
            id: workoutSession.id,
            workoutPlanId: null,
         }),
      );
   });

   it('returns 400 for invalid payloads', async () => {
      await request(app.getHttpServer())
         .post(apiPath('/workout-sessions'))
         .set('Authorization', `Bearer ${userAccessToken}`)
         .send({
            userId: ownerUserId,
            name: 'Sesion invalida',
            startedAt: 'not-a-date',
         })
         .expect(400);
   });

   it('returns 404 when updating a missing workout session', async () => {
      await request(app.getHttpServer())
         .patch(apiPath('/workout-sessions/missing-workout-session-id'))
         .set('Authorization', `Bearer ${userAccessToken}`)
         .send({ notes: 'Does not exist' })
         .expect(404);
   });

   it('deletes a workout session', async () => {
      const workoutSession = await prisma.workoutSession.create({
         data: {
            user: { connect: { id: ownerUserId } },
            name: 'Sesion a borrar',
            startedAt: new Date('2026-03-23T10:00:00.000Z'),
         },
      });

      const response = await request(app.getHttpServer())
         .delete(apiPath(`/workout-sessions/${workoutSession.id}`))
         .set('Authorization', `Bearer ${userAccessToken}`)
         .expect(200);

      expect(response.body).toEqual(
         expect.objectContaining({
            id: workoutSession.id,
            name: workoutSession.name,
         }),
      );

      await expect(
         prisma.workoutSession.findUnique({ where: { id: workoutSession.id } }),
      ).resolves.toBeNull();
   });

   it('returns 404 when deleting a missing workout session', async () => {
      await request(app.getHttpServer())
         .delete(apiPath('/workout-sessions/missing-workout-session-id'))
         .set('Authorization', `Bearer ${userAccessToken}`)
         .expect(404);
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
