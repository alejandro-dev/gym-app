import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { MuscleGroup } from '@prisma/client';
import * as cookieParser from 'cookie-parser';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('WorkoutSetsController (e2e)', () => {
	let app: INestApplication<App>;
	let prisma: PrismaService;
	let ownerUserId: string;
	let workoutSessionId: string;
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

		const deps = await createBaseDependencies();
		workoutSessionId = deps.workoutSessionId;
		firstExerciseId = deps.firstExerciseId;
		secondExerciseId = deps.secondExerciseId;
	});

	afterAll(async () => {
		await cleanDatabase();
		await app.close();
	});

	it('creates a workout set', async () => {
		const payload = buildCreateWorkoutSetPayload(firstExerciseId, 1);

		const response = await request(app.getHttpServer())
			.post('/workout-sets')
			.send(payload)
			.expect(201);

		expect(response.body).toEqual(
			expect.objectContaining({
				workoutSessionId,
				exerciseId: firstExerciseId,
				setNumber: 1,
				reps: 10,
				id: expect.any(String),
			}),
		);
	});

	it('returns 409 when creating a duplicate set number for the same session and exercise', async () => {
		await prisma.workoutSet.create({
			data: {
				workoutSession: { connect: { id: workoutSessionId } },
				exercise: { connect: { id: firstExerciseId } },
				setNumber: 1,
			},
		});

		await request(app.getHttpServer())
			.post('/workout-sets')
			.send(buildCreateWorkoutSetPayload(firstExerciseId, 1))
			.expect(409);
	});

	it('lists workout sets', async () => {
		const firstSet = await prisma.workoutSet.create({
			data: {
				workoutSession: { connect: { id: workoutSessionId } },
				exercise: { connect: { id: firstExerciseId } },
				setNumber: 1,
			},
		});
		const secondSet = await prisma.workoutSet.create({
			data: {
				workoutSession: { connect: { id: workoutSessionId } },
				exercise: { connect: { id: secondExerciseId } },
				setNumber: 1,
			},
		});

		const response = await request(app.getHttpServer())
			.get('/workout-sets')
			.expect(200);

		expect(response.body.map((set: { id: string }) => set.id)).toEqual(
			expect.arrayContaining([firstSet.id, secondSet.id]),
		);
	});

	it('returns a workout set by id', async () => {
		const workoutSet = await prisma.workoutSet.create({
			data: {
				workoutSession: { connect: { id: workoutSessionId } },
				exercise: { connect: { id: firstExerciseId } },
				setNumber: 1,
				reps: 10,
			},
		});

		const response = await request(app.getHttpServer())
			.get(`/workout-sets/${workoutSet.id}`)
			.expect(200);

		expect(response.body).toEqual(
			expect.objectContaining({
				id: workoutSet.id,
				workoutSessionId,
				exerciseId: firstExerciseId,
				reps: 10,
			}),
		);
	});

	it('returns 404 when the workout set does not exist', async () => {
		await request(app.getHttpServer())
			.get('/workout-sets/missing-workout-set-id')
			.expect(404);
	});

	it('updates a workout set', async () => {
		const workoutSet = await prisma.workoutSet.create({
			data: {
				workoutSession: { connect: { id: workoutSessionId } },
				exercise: { connect: { id: firstExerciseId } },
				setNumber: 1,
				reps: 10,
			},
		});

		const response = await request(app.getHttpServer())
			.patch(`/workout-sets/${workoutSet.id}`)
			.send({ reps: 8, weightKg: 82.5 })
			.expect(200);

		expect(response.body).toEqual(
			expect.objectContaining({
				id: workoutSet.id,
				reps: 8,
				weightKg: 82.5,
			}),
		);
	});

	it('returns 400 when trying to update workoutSessionId or exerciseId', async () => {
		const workoutSet = await prisma.workoutSet.create({
			data: {
				workoutSession: { connect: { id: workoutSessionId } },
				exercise: { connect: { id: firstExerciseId } },
				setNumber: 1,
			},
		});

		await request(app.getHttpServer())
			.patch(`/workout-sets/${workoutSet.id}`)
			.send({
				workoutSessionId: 'another-session-id',
				exerciseId: 'another-exercise-id',
			})
			.expect(400);
	});

	it('returns 404 when updating a missing workout set', async () => {
		await request(app.getHttpServer())
			.patch('/workout-sets/missing-workout-set-id')
			.send({ reps: 6 })
			.expect(404);
	});

	it('returns 409 when updating to a duplicate set number within the same session and exercise', async () => {
		const firstSet = await prisma.workoutSet.create({
			data: {
				workoutSession: { connect: { id: workoutSessionId } },
				exercise: { connect: { id: firstExerciseId } },
				setNumber: 1,
			},
		});
		await prisma.workoutSet.create({
			data: {
				workoutSession: { connect: { id: workoutSessionId } },
				exercise: { connect: { id: firstExerciseId } },
				setNumber: 2,
			},
		});

		await request(app.getHttpServer())
			.patch(`/workout-sets/${firstSet.id}`)
			.send({ setNumber: 2 })
			.expect(409);
	});

	it('deletes a workout set', async () => {
		const workoutSet = await prisma.workoutSet.create({
			data: {
				workoutSession: { connect: { id: workoutSessionId } },
				exercise: { connect: { id: firstExerciseId } },
				setNumber: 1,
			},
		});

		const response = await request(app.getHttpServer())
			.delete(`/workout-sets/${workoutSet.id}`)
			.expect(200);

		expect(response.body).toEqual(
			expect.objectContaining({
				id: workoutSet.id,
				setNumber: workoutSet.setNumber,
			}),
		);
	});

	it('returns 404 when deleting a missing workout set', async () => {
		await request(app.getHttpServer())
			.delete('/workout-sets/missing-workout-set-id')
			.expect(404);
	});

	async function createOwnerUser() {
		const user = await prisma.user.create({
			data: {
				email: `owner-set-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`,
				username: `owner-set-${Math.random().toString(36).slice(2, 10)}`,
				passwordHash: 'hashed-password',
			},
		});

		return user.id;
	}

	async function createBaseDependencies() {
		const firstExercise = await prisma.exercise.create({
			data: {
				name: `Exercise set ${Date.now()}-a`,
				slug: `exercise-set-${Date.now()}-a`,
				muscleGroup: MuscleGroup.LEGS,
			},
		});
		const secondExercise = await prisma.exercise.create({
			data: {
				name: `Exercise set ${Date.now()}-b`,
				slug: `exercise-set-${Date.now()}-b`,
				muscleGroup: MuscleGroup.BACK,
			},
		});
		const workoutSession = await prisma.workoutSession.create({
			data: {
				user: { connect: { id: ownerUserId } },
				name: `Workout Session ${Date.now()}`,
				startedAt: new Date('2026-03-23T10:00:00.000Z'),
			},
		});

		return {
			workoutSessionId: workoutSession.id,
			firstExerciseId: firstExercise.id,
			secondExerciseId: secondExercise.id,
		};
	}

	function buildCreateWorkoutSetPayload(exerciseId: string, setNumber: number) {
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
