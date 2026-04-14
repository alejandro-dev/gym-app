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

type WorkoutPlanListItem = {
   id: string;
   createdById: string;
};

type WorkoutPlanListResponseBody = {
   items: WorkoutPlanListItem[];
   total: number;
   page: number;
   limit: number;
};

describe('WorkoutPlansController (e2e)', () => {
   let app: INestApplication<App>;
   let prisma: PrismaService;
   let ownerUserId: string;
   let userAccessToken: string;
   let coachAccessToken: string;
   let adminAccessToken: string;
   let coachUserId: string;
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
      coachAccessToken = await createAuthenticatedUser(UserRole.COACH);
      adminAccessToken = await createAuthenticatedUser(UserRole.ADMIN);
      const user = await prisma.user.findFirstOrThrow({
         where: { email: { contains: 'user-' } },
         orderBy: { createdAt: 'desc' },
      });
      const coach = await prisma.user.findFirstOrThrow({
         where: { email: { contains: 'coach-' } },
         orderBy: { createdAt: 'desc' },
      });
      ownerUserId = user.id;
      coachUserId = coach.id;
   });

   beforeEach(async () => {
      await prisma.personalRecord.deleteMany();
      await prisma.workoutSet.deleteMany();
      await prisma.workoutPlanExercise.deleteMany();
      await prisma.workoutSession.deleteMany();
      await prisma.workoutPlan.deleteMany();
   });

   afterAll(async () => {
      await cleanDatabase();
      await app.close();
   });

   it('creates a workout plan', async () => {
      const payload = buildCreateWorkoutPlanPayload('push-pull-legs');

      const response = await request(app.getHttpServer())
         .post(apiPath('/workout-plans'))
         .set('Authorization', `Bearer ${userAccessToken}`)
         .send(payload)
         .expect(201);
      const createdPlan = response.body as Record<string, unknown>;

      expect(createdPlan).toEqual(
         expect.objectContaining({
            name: payload.name,
            description: payload.description,
            userId: payload.userId,
            createdById: ownerUserId,
            isActive: payload.isActive,
            id: anyString,
            createdAt: anyString,
            updatedAt: anyString,
         }),
      );
   });

   it('lists workout plans in descending creation order', async () => {
      const firstPlan = await prisma.workoutPlan.create({
         data: {
            name: 'Workout Plan first',
            description: 'First plan',
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

      const secondPlan = await prisma.workoutPlan.create({
         data: {
            name: 'Workout Plan second',
            description: 'Second plan',
            isActive: false,
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

      const response = await request(app.getHttpServer())
         .get(apiPath('/workout-plans'))
         .set('Authorization', `Bearer ${userAccessToken}`)
         .expect(200);
      const workoutPlans = response.body as WorkoutPlanListResponseBody;

      expect(workoutPlans).toEqual(
         expect.objectContaining({
            total: 2,
            page: 0,
            limit: 10,
         }),
      );
      expect(workoutPlans.items).toHaveLength(2);
      expect(workoutPlans.items[0]).toEqual(
         expect.objectContaining({
            id: secondPlan.id,
         }),
      );
      expect(workoutPlans.items[1]).toEqual(
         expect.objectContaining({
            id: firstPlan.id,
         }),
      );
   });

   it('returns a workout plan by id', async () => {
      const workoutPlan = await prisma.workoutPlan.create({
         data: {
            name: 'Workout Plan upper-lower',
            description: 'Upper lower split',
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

      const response = await request(app.getHttpServer())
         .get(apiPath(`/workout-plans/${workoutPlan.id}`))
         .set('Authorization', `Bearer ${userAccessToken}`)
         .expect(200);

      expect(response.body).toEqual(
         expect.objectContaining({
            id: workoutPlan.id,
            name: workoutPlan.name,
            description: workoutPlan.description,
            userId: ownerUserId,
            createdById: ownerUserId,
         }),
      );
   });

   it('returns 404 when the workout plan does not exist', async () => {
      await request(app.getHttpServer())
         .get(apiPath('/workout-plans/missing-workout-plan-id'))
         .set('Authorization', `Bearer ${userAccessToken}`)
         .expect(404);
   });

   it('updates a workout plan', async () => {
      const workoutPlan = await prisma.workoutPlan.create({
         data: {
            name: 'Workout Plan full-body',
            description: 'Initial description',
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

      const response = await request(app.getHttpServer())
         .patch(apiPath(`/workout-plans/${workoutPlan.id}`))
         .set('Authorization', `Bearer ${userAccessToken}`)
         .send({
            description: 'Updated full-body description',
            isActive: false,
         })
         .expect(200);

      expect(response.body).toEqual(
         expect.objectContaining({
            id: workoutPlan.id,
            description: 'Updated full-body description',
            isActive: false,
            userId: ownerUserId,
            createdById: ownerUserId,
         }),
      );
   });

   it('returns 400 when trying to update the userId', async () => {
      const workoutPlan = await prisma.workoutPlan.create({
         data: {
            name: 'Workout Plan immutable-owner',
            description: 'Owner cannot change',
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

      await request(app.getHttpServer())
         .patch(apiPath(`/workout-plans/${workoutPlan.id}`))
         .set('Authorization', `Bearer ${userAccessToken}`)
         .send({
            userId: 'another-user-id',
         })
         .expect(400);
   });

   it('returns 404 when updating a missing workout plan', async () => {
      await request(app.getHttpServer())
         .patch(apiPath('/workout-plans/missing-workout-plan-id'))
         .set('Authorization', `Bearer ${userAccessToken}`)
         .send({ description: 'Does not exist' })
         .expect(404);
   });

   it('deletes a workout plan', async () => {
      const workoutPlan = await prisma.workoutPlan.create({
         data: {
            name: 'Workout Plan delete-me',
            description: 'To be deleted',
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

      const response = await request(app.getHttpServer())
         .delete(apiPath(`/workout-plans/${workoutPlan.id}`))
         .set('Authorization', `Bearer ${userAccessToken}`)
         .expect(200);

      expect(response.body).toEqual(
         expect.objectContaining({
            id: workoutPlan.id,
            name: workoutPlan.name,
         }),
      );

      await expect(
         prisma.workoutPlan.findUnique({ where: { id: workoutPlan.id } }),
      ).resolves.toBeNull();
   });

   it('returns 404 when deleting a missing workout plan', async () => {
      await request(app.getHttpServer())
         .delete(apiPath('/workout-plans/missing-workout-plan-id'))
         .set('Authorization', `Bearer ${userAccessToken}`)
         .expect(404);
   });

   it('prevents a user from creating a workout plan for another user', async () => {
      await request(app.getHttpServer())
         .post(apiPath('/workout-plans'))
         .set('Authorization', `Bearer ${userAccessToken}`)
         .send({
            name: 'Workout Plan forbidden',
            description: 'Should not be allowed',
            userId: coachUserId,
            isActive: true,
         })
         .expect(400);
   });

   it('prevents a user from creating a template workout plan', async () => {
      await request(app.getHttpServer())
         .post(apiPath('/workout-plans'))
         .set('Authorization', `Bearer ${userAccessToken}`)
         .send({
            name: 'Workout Plan user-template',
            description: 'Users cannot create templates',
            userId: null,
            isActive: true,
         })
         .expect(400);
   });

   it('allows a coach to create a workout plan for another user', async () => {
      const response = await request(app.getHttpServer())
         .post(apiPath('/workout-plans'))
         .set('Authorization', `Bearer ${coachAccessToken}`)
         .send({
            name: 'Workout Plan by coach',
            description: 'Assigned by coach',
            userId: ownerUserId,
            isActive: true,
         })
         .expect(201);

      expect(response.body).toEqual(
         expect.objectContaining({
            userId: ownerUserId,
            createdById: coachUserId,
            name: 'Workout Plan by coach',
         }),
      );
   });

   it('allows a coach to create a template workout plan', async () => {
      const response = await request(app.getHttpServer())
         .post(apiPath('/workout-plans'))
         .set('Authorization', `Bearer ${coachAccessToken}`)
         .send({
            name: 'Workout Plan coach-template',
            description: 'Template created by coach',
            userId: null,
            isActive: true,
         })
         .expect(201);

      expect(response.body).toEqual(
         expect.objectContaining({
            userId: null,
            user: null,
            createdById: coachUserId,
            name: 'Workout Plan coach-template',
         }),
      );
   });

   it('prevents a user from reading a template workout plan', async () => {
      const workoutPlan = await prisma.workoutPlan.create({
         data: {
            name: 'Workout Plan hidden-template',
            description: 'Template should not be visible to regular users',
            isActive: true,
            createdBy: {
               connect: {
                  id: coachUserId,
               },
            },
         },
      });

      await request(app.getHttpServer())
         .get(apiPath(`/workout-plans/${workoutPlan.id}`))
         .set('Authorization', `Bearer ${userAccessToken}`)
         .expect(404);
   });

   it('prevents a user from updating a coach-authored workout plan', async () => {
      const workoutPlan = await prisma.workoutPlan.create({
         data: {
            name: 'Workout Plan by coach',
            description: 'Coach authored',
            isActive: true,
            user: {
               connect: {
                  id: ownerUserId,
               },
            },
            createdBy: {
               connect: {
                  id: coachUserId,
               },
            },
         },
      });

      await request(app.getHttpServer())
         .patch(apiPath(`/workout-plans/${workoutPlan.id}`))
         .set('Authorization', `Bearer ${userAccessToken}`)
         .send({
            description: 'User should not edit this',
         })
         .expect(404);
   });

   it('prevents a user from updating a template workout plan', async () => {
      const workoutPlan = await prisma.workoutPlan.create({
         data: {
            name: 'Workout Plan template-update',
            description: 'Templates cannot be managed by users',
            isActive: true,
            createdBy: {
               connect: {
                  id: coachUserId,
               },
            },
         },
      });

      await request(app.getHttpServer())
         .patch(apiPath(`/workout-plans/${workoutPlan.id}`))
         .set('Authorization', `Bearer ${userAccessToken}`)
         .send({
            description: 'User should not edit templates',
         })
         .expect(404);
   });

   it('allows an admin to update any workout plan', async () => {
      const workoutPlan = await prisma.workoutPlan.create({
         data: {
            name: 'Workout Plan admin-managed',
            description: 'Admin can update this plan',
            isActive: true,
            user: {
               connect: {
                  id: ownerUserId,
               },
            },
            createdBy: {
               connect: {
                  id: coachUserId,
               },
            },
         },
      });

      const response = await request(app.getHttpServer())
         .patch(apiPath(`/workout-plans/${workoutPlan.id}`))
         .set('Authorization', `Bearer ${adminAccessToken}`)
         .send({
            description: 'Updated by admin',
         })
         .expect(200);

      expect(response.body).toEqual(
         expect.objectContaining({
            id: workoutPlan.id,
            description: 'Updated by admin',
            userId: ownerUserId,
            createdById: coachUserId,
         }),
      );
   });

   it('allows an admin to delete any workout plan', async () => {
      const workoutPlan = await prisma.workoutPlan.create({
         data: {
            name: 'Workout Plan admin-deleted',
            description: 'Admin can delete this plan',
            isActive: true,
            user: {
               connect: {
                  id: ownerUserId,
               },
            },
            createdBy: {
               connect: {
                  id: coachUserId,
               },
            },
         },
      });

      await request(app.getHttpServer())
         .delete(apiPath(`/workout-plans/${workoutPlan.id}`))
         .set('Authorization', `Bearer ${adminAccessToken}`)
         .expect(200);

      await expect(
         prisma.workoutPlan.findUnique({ where: { id: workoutPlan.id } }),
      ).resolves.toBeNull();
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

   function buildCreateWorkoutPlanPayload(suffix: string) {
      return {
         name: `Workout Plan ${suffix}`,
         description: `Description for ${suffix}`,
         userId: ownerUserId,
         isActive: true,
      };
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
