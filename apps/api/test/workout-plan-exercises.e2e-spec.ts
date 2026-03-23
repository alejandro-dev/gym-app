import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { MuscleGroup } from '@prisma/client';
import * as cookieParser from 'cookie-parser';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('WorkoutPlanExerciseController (e2e)', () => {
	let app: INestApplication<App>;
	let prisma: PrismaService;
	let ownerUserId: string;
	let workoutPlanId: string;
	let firstExerciseId: string;
	let secondExerciseId: string;

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
		await prisma.exercise.deleteMany();

		const dependencies = await createBaseDependencies();
		workoutPlanId = dependencies.workoutPlanId;
		firstExerciseId = dependencies.firstExerciseId;
		secondExerciseId = dependencies.secondExerciseId;
	});

	afterAll(async () => {
		await cleanDatabase();
		await app.close();
	});

	it('creates a workout plan exercise', async () => {
		const payload = buildCreateWorkoutPlanExercisePayload({
			exerciseId: firstExerciseId,
			order: 1,
		});

		const response = await request(app.getHttpServer())
			.post('/workout-plan-exercises')
			.send(payload)
			.expect(201);

		expect(response.body).toEqual(
			expect.objectContaining({
				workoutPlanId: payload.workoutPlanId,
				exerciseId: payload.exerciseId,
				order: payload.order,
				targetSets: payload.targetSets,
				targetRepsMin: payload.targetRepsMin,
				targetRepsMax: payload.targetRepsMax,
				targetWeightKg: payload.targetWeightKg,
				restSeconds: payload.restSeconds,
				notes: payload.notes,
				id: expect.any(String),
			}),
		);
	});

	it('returns 409 when creating a duplicate order within the same workout plan', async () => {
		await prisma.workoutPlanExercise.create({
			data: {
				workoutPlan: { connect: { id: workoutPlanId } },
				exercise: { connect: { id: firstExerciseId } },
				order: 1,
			},
		});

		await request(app.getHttpServer())
			.post('/workout-plan-exercises')
			.send(
				buildCreateWorkoutPlanExercisePayload({
					exerciseId: secondExerciseId,
					order: 1,
				}),
			)
			.expect(409);
	});

	it('lists workout plan exercises ordered by workout plan and order', async () => {
		const firstRecord = await prisma.workoutPlanExercise.create({
			data: {
				workoutPlan: { connect: { id: workoutPlanId } },
				exercise: { connect: { id: firstExerciseId } },
				order: 1,
			},
		});

		const secondRecord = await prisma.workoutPlanExercise.create({
			data: {
				workoutPlan: { connect: { id: workoutPlanId } },
				exercise: { connect: { id: secondExerciseId } },
				order: 2,
			},
		});

		const response = await request(app.getHttpServer())
			.get('/workout-plan-exercises')
			.expect(200);

		expect(response.body).toHaveLength(2);
		expect(response.body[0]).toEqual(
			expect.objectContaining({
				id: firstRecord.id,
			}),
		);
		expect(response.body[1]).toEqual(
			expect.objectContaining({
				id: secondRecord.id,
			}),
		);
	});

	it('returns a workout plan exercise by id', async () => {
		const workoutPlanExercise = await prisma.workoutPlanExercise.create({
			data: {
				workoutPlan: { connect: { id: workoutPlanId } },
				exercise: { connect: { id: firstExerciseId } },
				order: 1,
				targetSets: 4,
			},
		});

		const response = await request(app.getHttpServer())
			.get(`/workout-plan-exercises/${workoutPlanExercise.id}`)
			.expect(200);

		expect(response.body).toEqual(
			expect.objectContaining({
				id: workoutPlanExercise.id,
				workoutPlanId,
				exerciseId: firstExerciseId,
				order: 1,
				targetSets: 4,
			}),
		);
	});

	it('returns 404 when the workout plan exercise does not exist', async () => {
		await request(app.getHttpServer())
			.get('/workout-plan-exercises/missing-workout-plan-exercise-id')
			.expect(404);
	});

	it('updates a workout plan exercise', async () => {
		const workoutPlanExercise = await prisma.workoutPlanExercise.create({
			data: {
				workoutPlan: { connect: { id: workoutPlanId } },
				exercise: { connect: { id: firstExerciseId } },
				order: 1,
				targetSets: 4,
				notes: 'Initial notes',
			},
		});

		const response = await request(app.getHttpServer())
			.patch(`/workout-plan-exercises/${workoutPlanExercise.id}`)
			.send({
				order: 2,
				targetSets: 5,
				notes: 'Updated notes',
			})
			.expect(200);

		expect(response.body).toEqual(
			expect.objectContaining({
				id: workoutPlanExercise.id,
				order: 2,
				targetSets: 5,
				notes: 'Updated notes',
			}),
		);
	});

	it('returns 400 when trying to update workoutPlanId or exerciseId', async () => {
		const workoutPlanExercise = await prisma.workoutPlanExercise.create({
			data: {
				workoutPlan: { connect: { id: workoutPlanId } },
				exercise: { connect: { id: firstExerciseId } },
				order: 1,
			},
		});

		await request(app.getHttpServer())
			.patch(`/workout-plan-exercises/${workoutPlanExercise.id}`)
			.send({
				workoutPlanId: 'another-plan-id',
				exerciseId: 'another-exercise-id',
			})
			.expect(400);
	});

	it('returns 404 when updating a missing workout plan exercise', async () => {
		await request(app.getHttpServer())
			.patch('/workout-plan-exercises/missing-workout-plan-exercise-id')
			.send({ notes: 'Does not exist' })
			.expect(404);
	});

	it('returns 409 when updating to a duplicate order within the same workout plan', async () => {
		const firstRecord = await prisma.workoutPlanExercise.create({
			data: {
				workoutPlan: { connect: { id: workoutPlanId } },
				exercise: { connect: { id: firstExerciseId } },
				order: 1,
			},
		});

		await prisma.workoutPlanExercise.create({
			data: {
				workoutPlan: { connect: { id: workoutPlanId } },
				exercise: { connect: { id: secondExerciseId } },
				order: 2,
			},
		});

		await request(app.getHttpServer())
			.patch(`/workout-plan-exercises/${firstRecord.id}`)
			.send({ order: 2 })
			.expect(409);
	});

	it('deletes a workout plan exercise', async () => {
		const workoutPlanExercise = await prisma.workoutPlanExercise.create({
			data: {
				workoutPlan: { connect: { id: workoutPlanId } },
				exercise: { connect: { id: firstExerciseId } },
				order: 1,
			},
		});

		const response = await request(app.getHttpServer())
			.delete(`/workout-plan-exercises/${workoutPlanExercise.id}`)
			.expect(200);

		expect(response.body).toEqual(
			expect.objectContaining({
				id: workoutPlanExercise.id,
				order: workoutPlanExercise.order,
			}),
		);

		await expect(
			prisma.workoutPlanExercise.findUnique({
				where: { id: workoutPlanExercise.id },
			}),
		).resolves.toBeNull();
	});

	it('returns 404 when deleting a missing workout plan exercise', async () => {
		await request(app.getHttpServer())
			.delete('/workout-plan-exercises/missing-workout-plan-exercise-id')
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

	async function createBaseDependencies() {
		const workoutPlan = await prisma.workoutPlan.create({
			data: {
				name: `Workout Plan ${Date.now()}`,
				description: 'Plan for exercise assignments',
				isActive: true,
				user: {
					connect: {
						id: ownerUserId,
					},
				},
			},
		});

		const firstExercise = await prisma.exercise.create({
			data: {
				name: `Exercise ${Date.now()}-a`,
				slug: `exercise-${Date.now()}-a`,
				muscleGroup: MuscleGroup.LEGS,
				description: 'First exercise',
				isCompound: true,
			},
		});

		const secondExercise = await prisma.exercise.create({
			data: {
				name: `Exercise ${Date.now()}-b`,
				slug: `exercise-${Date.now()}-b`,
				muscleGroup: MuscleGroup.BACK,
				description: 'Second exercise',
				isCompound: false,
			},
		});

		return {
			workoutPlanId: workoutPlan.id,
			firstExerciseId: firstExercise.id,
			secondExerciseId: secondExercise.id,
		};
	}

	function buildCreateWorkoutPlanExercisePayload({
		exerciseId,
		order,
	}: {
		exerciseId: string;
		order: number;
	}) {
		return {
			workoutPlanId,
			exerciseId,
			order,
			targetSets: 4,
			targetRepsMin: 8,
			targetRepsMax: 12,
			targetWeightKg: 80,
			restSeconds: 90,
			notes: 'Mantener tecnica estricta.',
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
