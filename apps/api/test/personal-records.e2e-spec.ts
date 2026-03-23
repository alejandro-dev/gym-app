import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { MuscleGroup } from '@prisma/client';
import * as cookieParser from 'cookie-parser';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('PersonalRecordsController (e2e)', () => {
	let app: INestApplication<App>;
	let prisma: PrismaService;
	let ownerUserId: string;
	let exerciseId: string;

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

		const exercise = await prisma.exercise.create({
			data: {
				name: `Exercise record ${Date.now()}`,
				slug: `exercise-record-${Date.now()}`,
				muscleGroup: MuscleGroup.CHEST,
			},
		});

		exerciseId = exercise.id;
	});

	afterAll(async () => {
		await cleanDatabase();
		await app.close();
	});

	it('creates a personal record', async () => {
		const payload = {
			userId: ownerUserId,
			exerciseId,
			metric: 'estimated-1rm',
			value: 120,
			achievedAt: '2026-03-23T10:00:00.000Z',
		};

		const response = await request(app.getHttpServer())
			.post('/personal-records')
			.send(payload)
			.expect(201);

		expect(response.body).toEqual(
			expect.objectContaining({
				userId: ownerUserId,
				exerciseId,
				metric: payload.metric,
				value: payload.value,
				id: expect.any(String),
			}),
		);
	});

	it('lists personal records', async () => {
		const record = await prisma.personalRecord.create({
			data: {
				user: { connect: { id: ownerUserId } },
				exercise: { connect: { id: exerciseId } },
				metric: 'estimated-1rm',
				value: 120,
				achievedAt: new Date('2026-03-23T10:00:00.000Z'),
			},
		});

		const response = await request(app.getHttpServer())
			.get('/personal-records')
			.expect(200);

		expect(response.body).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					id: record.id,
				}),
			]),
		);
	});

	it('returns a personal record by id', async () => {
		const record = await prisma.personalRecord.create({
			data: {
				user: { connect: { id: ownerUserId } },
				exercise: { connect: { id: exerciseId } },
				metric: 'estimated-1rm',
				value: 120,
				achievedAt: new Date('2026-03-23T10:00:00.000Z'),
			},
		});

		const response = await request(app.getHttpServer())
			.get(`/personal-records/${record.id}`)
			.expect(200);

		expect(response.body).toEqual(
			expect.objectContaining({
				id: record.id,
				userId: ownerUserId,
				exerciseId,
				metric: 'estimated-1rm',
			}),
		);
	});

	it('returns 404 when the personal record does not exist', async () => {
		await request(app.getHttpServer())
			.get('/personal-records/missing-personal-record-id')
			.expect(404);
	});

	it('updates a personal record', async () => {
		const record = await prisma.personalRecord.create({
			data: {
				user: { connect: { id: ownerUserId } },
				exercise: { connect: { id: exerciseId } },
				metric: 'estimated-1rm',
				value: 120,
				achievedAt: new Date('2026-03-23T10:00:00.000Z'),
			},
		});

		const response = await request(app.getHttpServer())
			.patch(`/personal-records/${record.id}`)
			.send({
				value: 125,
				metric: 'one-rep-max',
			})
			.expect(200);

		expect(response.body).toEqual(
			expect.objectContaining({
				id: record.id,
				value: 125,
				metric: 'one-rep-max',
			}),
		);
	});

	it('returns 400 when trying to update userId or exerciseId', async () => {
		const record = await prisma.personalRecord.create({
			data: {
				user: { connect: { id: ownerUserId } },
				exercise: { connect: { id: exerciseId } },
				metric: 'estimated-1rm',
				value: 120,
				achievedAt: new Date('2026-03-23T10:00:00.000Z'),
			},
		});

		await request(app.getHttpServer())
			.patch(`/personal-records/${record.id}`)
			.send({
				userId: 'another-user-id',
				exerciseId: 'another-exercise-id',
			})
			.expect(400);
	});

	it('returns 404 when updating a missing personal record', async () => {
		await request(app.getHttpServer())
			.patch('/personal-records/missing-personal-record-id')
			.send({ value: 110 })
			.expect(404);
	});

	it('deletes a personal record', async () => {
		const record = await prisma.personalRecord.create({
			data: {
				user: { connect: { id: ownerUserId } },
				exercise: { connect: { id: exerciseId } },
				metric: 'estimated-1rm',
				value: 120,
				achievedAt: new Date('2026-03-23T10:00:00.000Z'),
			},
		});

		const response = await request(app.getHttpServer())
			.delete(`/personal-records/${record.id}`)
			.expect(200);

		expect(response.body).toEqual(
			expect.objectContaining({
				id: record.id,
				metric: record.metric,
			}),
		);
	});

	it('returns 404 when deleting a missing personal record', async () => {
		await request(app.getHttpServer())
			.delete('/personal-records/missing-personal-record-id')
			.expect(404);
	});

	async function createOwnerUser() {
		const user = await prisma.user.create({
			data: {
				email: `owner-record-${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`,
				username: `owner-record-${Math.random().toString(36).slice(2, 10)}`,
				passwordHash: 'hashed-password',
			},
		});

		return user.id;
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
