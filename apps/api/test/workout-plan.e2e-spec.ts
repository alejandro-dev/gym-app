import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as cookieParser from 'cookie-parser';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('WorkoutPlansController (e2e)', () => {
	let app: INestApplication<App>;
	let prisma: PrismaService;
	let ownerUserId: string;

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

		ownerUserId = await createOwnerUser();
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
			.post('/workout-plans')
			.send(payload)
			.expect(201);

		expect(response.body).toEqual(
			expect.objectContaining({
				name: payload.name,
				description: payload.description,
				userId: payload.userId,
				isActive: payload.isActive,
				id: expect.any(String),
				createdAt: expect.any(String),
				updatedAt: expect.any(String),
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
			},
		});

		const response = await request(app.getHttpServer())
			.get('/workout-plans')
			.expect(200);

		expect(response.body).toHaveLength(2);
		expect(response.body[0]).toEqual(
			expect.objectContaining({
				id: secondPlan.id,
			}),
		);
		expect(response.body[1]).toEqual(
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
			},
		});

		const response = await request(app.getHttpServer())
			.get(`/workout-plans/${workoutPlan.id}`)
			.expect(200);

		expect(response.body).toEqual(
			expect.objectContaining({
				id: workoutPlan.id,
				name: workoutPlan.name,
				description: workoutPlan.description,
				userId: ownerUserId,
			}),
		);
	});

	it('returns 404 when the workout plan does not exist', async () => {
		await request(app.getHttpServer())
			.get('/workout-plans/missing-workout-plan-id')
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
			},
		});

		const response = await request(app.getHttpServer())
			.patch(`/workout-plans/${workoutPlan.id}`)
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
			},
		});

		await request(app.getHttpServer())
			.patch(`/workout-plans/${workoutPlan.id}`)
			.send({
				userId: 'another-user-id',
			})
			.expect(400);
	});

	it('returns 404 when updating a missing workout plan', async () => {
		await request(app.getHttpServer())
			.patch('/workout-plans/missing-workout-plan-id')
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
			},
		});

		const response = await request(app.getHttpServer())
			.delete(`/workout-plans/${workoutPlan.id}`)
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
			.delete('/workout-plans/missing-workout-plan-id')
			.expect(404);
	});

	async function createOwnerUser() {
		const user = await prisma.user.create({
			data: {
				email: `owner-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`,
				username: `owner-${Math.random().toString(36).slice(2, 10)}`,
				passwordHash: 'hashed-password',
			},
		});

		return user.id;
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
