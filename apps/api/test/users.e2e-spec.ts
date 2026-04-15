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

describe('UsersController (e2e)', () => {
   let app: INestApplication<App>;
   let prisma: PrismaService;
   let adminAccessToken: string;
   let coachAccessToken: string;
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

      adminAccessToken = await createAuthenticatedUser(UserRole.ADMIN);
      coachAccessToken = await createAuthenticatedUser(UserRole.COACH);

      const coach = await prisma.user.findFirstOrThrow({
         where: { email: { contains: 'coach-' } },
         orderBy: { createdAt: 'desc' },
      });
      coachUserId = coach.id;
   });

   afterAll(async () => {
      await cleanDatabase();
      await app.close();
   });

   it('lets admins create athletes assigned to an explicit coach', async () => {
      const payload = buildCreateUserPayload('admin-created-athlete', {
         coachId: coachUserId,
      });

      const response = await request(app.getHttpServer())
         .post(apiPath('/users'))
         .set('Authorization', `Bearer ${adminAccessToken}`)
         .send(payload)
         .expect(201);

      expect(response.body).toEqual(
         expect.objectContaining({
            id: anyString,
            email: payload.email,
            role: UserRole.USER,
            coachId: coachUserId,
            emailVerifiedAt: anyString,
            createdAt: anyString,
            updatedAt: anyString,
         }),
      );
   });

   it('assigns coach-created athletes to the authenticated coach', async () => {
      const payload = buildCreateUserPayload('coach-created-athlete');

      const response = await request(app.getHttpServer())
         .post(apiPath('/users'))
         .set('Authorization', `Bearer ${coachAccessToken}`)
         .send(payload)
         .expect(201);

      expect(response.body).toEqual(
         expect.objectContaining({
            id: anyString,
            email: payload.email,
            role: UserRole.USER,
            coachId: coachUserId,
         }),
      );
   });

   it('rejects coach attempts to create non-athlete users', async () => {
      const payload = buildCreateUserPayload('coach-created-admin', {
         role: UserRole.ADMIN,
      });

      await request(app.getHttpServer())
         .post(apiPath('/users'))
         .set('Authorization', `Bearer ${coachAccessToken}`)
         .send(payload)
         .expect(400);
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

   function buildCreateUserPayload(
      suffix: string,
      overrides: Partial<{
         role: UserRole;
         coachId: string;
      }> = {},
   ) {
      return {
         email: `${suffix}-${Date.now()}-${Math.random()
            .toString(36)
            .slice(2)}@example.com`,
         firstName: 'Test',
         lastName: 'User',
         role: UserRole.USER,
         ...overrides,
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
