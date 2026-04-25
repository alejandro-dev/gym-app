import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as cookieParser from 'cookie-parser';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

type LoginResponseBody = {
   user: {
      id: string;
      email: string;
   };
   accessToken: string;
};

describe('Auth rate limit (e2e)', () => {
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

   it('returns 429 after exceeding the login limit from the same ip', async () => {
      const email = `ratelimit-${Date.now()}-${Math.random()
         .toString(36)
         .slice(2)}@example.com`;
      const password = 'supersecreto123';

      await request(app.getHttpServer())
         .post(apiPath('/auth/register'))
         .send({
            email,
            password,
            username: email.split('@')[0],
            firstName: 'Rate',
         })
         .expect(201);

      await prisma.user.update({
         where: { email },
         data: {
            emailVerifiedAt: new Date(),
            emailVerificationTokenHash: null,
            emailVerificationExpiresAt: null,
         },
      });

      for (let attempt = 0; attempt < 5; attempt += 1) {
         await request(app.getHttpServer())
            .post(apiPath('/auth/login'))
            .send({ email, password: 'incorrecta' })
            .expect(401);
      }

      const response = await request(app.getHttpServer())
         .post(apiPath('/auth/login'))
         .send({ email, password: 'incorrecta' })
         .expect(429);

      expect(response.body).toEqual({
         statusCode: 429,
         message: 'ThrottlerException: Too Many Requests',
      });
   });

   it('does not throttle repeated requests to the authenticated profile endpoint', async () => {
      const { accessToken } = await createVerifiedUser();

      for (let attempt = 0; attempt < 7; attempt += 1) {
         await request(app.getHttpServer())
            .get(apiPath('/auth/me'))
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(200);
      }
   });

   it('does not throttle repeated requests to the authenticated logout endpoint', async () => {
      const { accessToken } = await createVerifiedUser();

      for (let attempt = 0; attempt < 7; attempt += 1) {
         await request(app.getHttpServer())
            .post(apiPath('/auth/logout'))
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(201);
      }
   });

   async function createVerifiedUser() {
      const email = `verified-${Date.now()}-${Math.random()
         .toString(36)
         .slice(2)}@example.com`;
      const password = 'supersecreto123';

      await request(app.getHttpServer())
         .post(apiPath('/auth/register'))
         .send({
            email,
            password,
            username: email.split('@')[0],
            firstName: 'Rate',
         })
         .expect(201);

      const user = await prisma.user.update({
         where: { email },
         data: {
            emailVerifiedAt: new Date(),
            emailVerificationTokenHash: null,
            emailVerificationExpiresAt: null,
         },
      });

      const loginResponse = await request(app.getHttpServer())
         .post(apiPath('/auth/login'))
         .send({ email, password })
         .expect(201);
      const loginBody = loginResponse.body as LoginResponseBody;

      expect(loginBody.user).toEqual(
         expect.objectContaining({
            id: user.id,
            email,
         }),
      );
      expect(typeof loginBody.accessToken).toBe('string');

      return {
         email,
         password,
         accessToken: loginBody.accessToken,
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
