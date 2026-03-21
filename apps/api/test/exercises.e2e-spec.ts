import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { MuscleGroup, UserRole } from '@prisma/client';
import * as cookieParser from 'cookie-parser';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('ExercisesController (e2e)', () => {
	let app: INestApplication<App>;
	let prisma: PrismaService;
	let adminAccessToken: string;
	let userAccessToken: string;

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

		prisma = moduleFixture.get(PrismaService);

		await app.init();
		await cleanDatabase();

		adminAccessToken = await createAuthenticatedUser(UserRole.ADMIN);
		userAccessToken = await createAuthenticatedUser(UserRole.USER);
	});

	beforeEach(async () => {
		await prisma.personalRecord.deleteMany();
		await prisma.workoutSet.deleteMany();
		await prisma.workoutPlanExercise.deleteMany();
		await prisma.workoutSession.deleteMany();
		await prisma.workoutPlan.deleteMany();
		await prisma.exercise.deleteMany();
	});

	afterAll(async () => {
		await cleanDatabase();
		await app.close();
	});

	it('rejects requests without an access token', async () => {
		await request(app.getHttpServer()).get('/exercises').expect(401);
	});

	it('rejects requests from authenticated users without the required role', async () => {
		await request(app.getHttpServer())
			.get('/exercises')
			.set('Authorization', `Bearer ${userAccessToken}`)
			.expect(403);
	});

	it('creates an exercise', async () => {
		const payload = buildCreateExercisePayload('back-squat');

		const response = await request(app.getHttpServer())
			.post('/exercises')
			.set('Authorization', `Bearer ${adminAccessToken}`)
			.send(payload)
			.expect(201);

		expect(response.body).toEqual(
			expect.objectContaining({
				name: payload.name,
				slug: payload.slug,
				description: payload.description,
				instructions: payload.instructions,
				muscleGroup: payload.muscleGroup,
				equipment: payload.equipment,
				isCompound: payload.isCompound,
				id: expect.any(String),
				createdAt: expect.any(String),
				updatedAt: expect.any(String),
			}),
		);
	});

	it('returns 409 when creating an exercise with duplicate name or slug', async () => {
		const payload = buildCreateExercisePayload('deadlift');

		await prisma.exercise.create({
			data: payload,
		});

		await request(app.getHttpServer())
			.post('/exercises')
			.set('Authorization', `Bearer ${adminAccessToken}`)
			.send(payload)
			.expect(409);
	});

	it('lists exercises', async () => {
		const firstExercise = await prisma.exercise.create({
			data: buildCreateExercisePayload('bench-press'),
		});
		const secondExercise = await prisma.exercise.create({
			data: buildCreateExercisePayload('pull-up'),
		});

		const response = await request(app.getHttpServer())
			.get('/exercises')
			.set('Authorization', `Bearer ${adminAccessToken}`)
			.expect(200);

		expect(response.body).toHaveLength(2);
		expect(response.body.map((exercise: { id: string }) => exercise.id)).toEqual(
			expect.arrayContaining([firstExercise.id, secondExercise.id]),
		);
	});

	it('returns an exercise by id', async () => {
		const exercise = await prisma.exercise.create({
			data: buildCreateExercisePayload('romanian-deadlift'),
		});

		const response = await request(app.getHttpServer())
			.get(`/exercises/${exercise.id}`)
			.set('Authorization', `Bearer ${adminAccessToken}`)
			.expect(200);

		expect(response.body).toEqual(
			expect.objectContaining({
				id: exercise.id,
				name: exercise.name,
				slug: exercise.slug,
			}),
		);
	});

	it('returns 404 when the exercise does not exist', async () => {
		await request(app.getHttpServer())
			.get('/exercises/missing-exercise-id')
			.set('Authorization', `Bearer ${adminAccessToken}`)
			.expect(404);
	});

	it('updates an exercise', async () => {
		const exercise = await prisma.exercise.create({
			data: buildCreateExercisePayload('overhead-press'),
		});

		const response = await request(app.getHttpServer())
			.patch(`/exercises/${exercise.id}`)
			.set('Authorization', `Bearer ${adminAccessToken}`)
			.send({
				description: 'Updated overhead pressing exercise.',
				equipment: 'Dumbbells',
			})
			.expect(200);

		expect(response.body).toEqual(
			expect.objectContaining({
				id: exercise.id,
				description: 'Updated overhead pressing exercise.',
				equipment: 'Dumbbells',
			}),
		);
	});

	it('returns 404 when updating a missing exercise', async () => {
		await request(app.getHttpServer())
			.patch('/exercises/missing-exercise-id')
			.set('Authorization', `Bearer ${adminAccessToken}`)
			.send({ description: 'Does not exist' })
			.expect(404);
	});

	it('returns 409 when updating to a duplicate slug', async () => {
		const firstExercise = await prisma.exercise.create({
			data: buildCreateExercisePayload('front-squat'),
		});
		await prisma.exercise.create({
			data: buildCreateExercisePayload('leg-press'),
		});

		await request(app.getHttpServer())
			.patch(`/exercises/${firstExercise.id}`)
			.set('Authorization', `Bearer ${adminAccessToken}`)
			.send({ slug: 'leg-press' })
			.expect(409);
	});

	it('deletes an exercise', async () => {
		const exercise = await prisma.exercise.create({
			data: buildCreateExercisePayload('hip-thrust'),
		});

		const response = await request(app.getHttpServer())
			.delete(`/exercises/${exercise.id}`)
			.set('Authorization', `Bearer ${adminAccessToken}`)
			.expect(200);

		expect(response.body).toEqual(
			expect.objectContaining({
				id: exercise.id,
				name: exercise.name,
			}),
		);

		await expect(
			prisma.exercise.findUnique({ where: { id: exercise.id } }),
		).resolves.toBeNull();
	});

	it('returns 404 when deleting a missing exercise', async () => {
		await request(app.getHttpServer())
			.delete('/exercises/missing-exercise-id')
			.set('Authorization', `Bearer ${adminAccessToken}`)
			.expect(404);
	});

	async function createAuthenticatedUser(role: UserRole) {
		const email = `${role.toLowerCase()}-${Date.now()}-${Math.random()
			.toString(36)
			.slice(2)}@example.com`;
		const password = 'supersecreto123';

		await request(app.getHttpServer())
			.post('/auth/register')
			.send({
				email,
				password,
				username: email.split('@')[0],
				firstName: role,
			})
			.expect(201);

		const user = await prisma.user.update({
			where: { email },
			data: { role },
		});

		const loginResponse = await request(app.getHttpServer())
			.post('/auth/login')
			.send({
				email,
				password,
			})
			.expect(201);

		expect(loginResponse.body.user).toEqual(
			expect.objectContaining({
				id: user.id,
				email,
				role,
			}),
		);

		return loginResponse.body.accessToken as string;
	}

	function buildCreateExercisePayload(suffix: string) {
		return {
			name: `Exercise ${suffix}`,
			slug: `exercise-${suffix}`,
			description: `Description for ${suffix}`,
			instructions: `Instructions for ${suffix}`,
			muscleGroup: MuscleGroup.LEGS,
			equipment: 'Barbell',
			isCompound: true,
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
