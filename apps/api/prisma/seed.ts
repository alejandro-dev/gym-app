import {
	ExerciseCategory,
	MuscleGroup,
	PersonalRecordMetric,
	PrismaClient,
	UserRole,
} from '@prisma/client';
import { randomBytes, scrypt as scryptCallback } from 'crypto';
import { promisify } from 'util';

const prisma = new PrismaClient();
const scrypt = promisify(scryptCallback);

/**
 * Hash compatible con el flujo de autenticacion de la API.
 */
async function hashValue(value: string) {
	const salt = randomBytes(16).toString('hex');
	const derivedKey = (await scrypt(value, salt, 64)) as Buffer;
	return `${salt}:${derivedKey.toString('hex')}`;
}

async function main() {
	const defaultPassword = 'Demo1234!';
	const passwordHash = await hashValue(defaultPassword);

	const admin = await prisma.user.upsert({
		where: { email: 'admin@gym.local' },
		update: {
			username: 'admin_gym',
			firstName: 'Admin',
			lastName: 'Gym',
			role: UserRole.ADMIN,
			passwordHash,
		},
		create: {
			email: 'admin@gym.local',
			username: 'admin_gym',
			firstName: 'Admin',
			lastName: 'Gym',
			role: UserRole.ADMIN,
			passwordHash,
		},
	});

	const coach = await prisma.user.upsert({
		where: { email: 'coach@gym.local' },
		update: {
			username: 'coach_gym',
			firstName: 'Carlos',
			lastName: 'Entrenador',
			role: UserRole.COACH,
			passwordHash,
		},
		create: {
			email: 'coach@gym.local',
			username: 'coach_gym',
			firstName: 'Carlos',
			lastName: 'Entrenador',
			role: UserRole.COACH,
			passwordHash,
		},
	});

	const athlete = await prisma.user.upsert({
		where: { email: 'usuario@gym.local' },
		update: {
			username: 'usuario_gym',
			firstName: 'Laura',
			lastName: 'Atleta',
			role: UserRole.USER,
			weightKg: 64,
			heightCm: 168,
			passwordHash,
		},
		create: {
			email: 'usuario@gym.local',
			username: 'usuario_gym',
			firstName: 'Laura',
			lastName: 'Atleta',
			role: UserRole.USER,
			weightKg: 64,
			heightCm: 168,
			passwordHash,
		},
	});

	const exercises = [
		{
			name: 'Sentadilla con barra',
			slug: 'sentadilla-con-barra',
			description: 'Ejercicio basico para desarrollar fuerza y masa en el tren inferior.',
			instructions: 'Mantener el torso firme, bajar controlando y subir empujando con todo el pie.',
			muscleGroup: MuscleGroup.LEGS,
			category: ExerciseCategory.STRENGTH,
			equipment: 'Barra',
			isCompound: true,
		},
		{
			name: 'Press de banca plano',
			slug: 'press-de-banca-plano',
			description: 'Movimiento clasico para pecho, hombros y triceps.',
			instructions: 'Escapulas retraidas, pies firmes y recorrido controlado.',
			muscleGroup: MuscleGroup.CHEST,
			category: ExerciseCategory.STRENGTH,
			equipment: 'Barra',
			isCompound: true,
		},
		{
			name: 'Peso muerto rumano',
			slug: 'peso-muerto-rumano',
			description: 'Trabajo dominante de cadera para femorales y gluteos.',
			instructions: 'Cadera atras, espalda neutra y barra cerca del cuerpo.',
			muscleGroup: MuscleGroup.GLUTES,
			category: ExerciseCategory.STRENGTH,
			equipment: 'Barra',
			isCompound: true,
		},
		{
			name: 'Dominadas pronas',
			slug: 'dominadas-pronas',
			description: 'Ejercicio de tiron vertical para espalda y brazos.',
			instructions: 'Evitar balanceos y llevar el pecho hacia la barra.',
			muscleGroup: MuscleGroup.BACK,
			category: ExerciseCategory.BODYWEIGHT,
			equipment: 'Barra de dominadas',
			isCompound: true,
		},
		{
			name: 'Remo con barra',
			slug: 'remo-con-barra',
			description: 'Movimiento de tiron horizontal para ganar densidad en la espalda.',
			instructions: 'Torso inclinado estable y codos hacia atras.',
			muscleGroup: MuscleGroup.BACK,
			category: ExerciseCategory.STRENGTH,
			equipment: 'Barra',
			isCompound: true,
		},
		{
			name: 'Press militar de pie',
			slug: 'press-militar-de-pie',
			description: 'Ejercicio de empuje vertical para hombros y triceps.',
			instructions: 'Gluteos y abdomen activos durante todo el recorrido.',
			muscleGroup: MuscleGroup.SHOULDERS,
			category: ExerciseCategory.STRENGTH,
			equipment: 'Barra',
			isCompound: true,
		},
		{
			name: 'Zancadas con mancuernas',
			slug: 'zancadas-con-mancuernas',
			description: 'Trabajo unilateral para piernas y gluteos.',
			instructions: 'Dar una zancada amplia y mantener estabilidad en la cadera.',
			muscleGroup: MuscleGroup.LEGS,
			category: ExerciseCategory.STRENGTH,
			equipment: 'Mancuernas',
			isCompound: true,
		},
		{
			name: 'Hip thrust con barra',
			slug: 'hip-thrust-con-barra',
			description: 'Ejercicio enfocado en gluteos con alta activacion en extension de cadera.',
			instructions: 'Pausa arriba y barbilla ligeramente recogida.',
			muscleGroup: MuscleGroup.GLUTES,
			category: ExerciseCategory.STRENGTH,
			equipment: 'Barra',
			isCompound: true,
		},
		{
			name: 'Curl femoral tumbado',
			slug: 'curl-femoral-tumbado',
			description: 'Aislamiento para femorales en maquina.',
			instructions: 'Mover solo la rodilla y controlar la fase negativa.',
			muscleGroup: MuscleGroup.LEGS,
			category: ExerciseCategory.STRENGTH,
			equipment: 'Maquina',
			isCompound: false,
		},
		{
			name: 'Extension de cuadriceps',
			slug: 'extension-de-cuadriceps',
			description: 'Aislamiento clasico para cuadriceps.',
			instructions: 'Extender sin golpear la rodilla al final.',
			muscleGroup: MuscleGroup.LEGS,
			category: ExerciseCategory.STRENGTH,
			equipment: 'Maquina',
			isCompound: false,
		},
		{
			name: 'Curl de biceps con barra',
			slug: 'curl-de-biceps-con-barra',
			description: 'Trabajo de flexion de codo para biceps.',
			instructions: 'Evitar balanceo y subir con control.',
			muscleGroup: MuscleGroup.ARMS,
			category: ExerciseCategory.STRENGTH,
			equipment: 'Barra',
			isCompound: false,
		},
		{
			name: 'Extension de triceps en polea',
			slug: 'extension-de-triceps-en-polea',
			description: 'Ejercicio de aislamiento para triceps.',
			instructions: 'Codos pegados al cuerpo y extension completa.',
			muscleGroup: MuscleGroup.ARMS,
			category: ExerciseCategory.STRENGTH,
			equipment: 'Polea',
			isCompound: false,
		},
		{
			name: 'Elevaciones laterales',
			slug: 'elevaciones-laterales',
			description: 'Aislamiento del deltoides lateral.',
			instructions: 'Subir hasta linea de hombros con codos suaves.',
			muscleGroup: MuscleGroup.SHOULDERS,
			category: ExerciseCategory.STRENGTH,
			equipment: 'Mancuernas',
			isCompound: false,
		},
		{
			name: 'Jalon al pecho',
			slug: 'jalon-al-pecho',
			description: 'Alternativa guiada para tiron vertical.',
			instructions: 'Bajar la barra al pecho con escapulas activas.',
			muscleGroup: MuscleGroup.BACK,
			category: ExerciseCategory.STRENGTH,
			equipment: 'Polea',
			isCompound: true,
		},
		{
			name: 'Ab wheel',
			slug: 'ab-wheel',
			description: 'Ejercicio exigente para estabilidad y fuerza del core.',
			instructions: 'Mantener pelvis estable y no arquear la zona lumbar.',
			muscleGroup: MuscleGroup.CORE,
			category: ExerciseCategory.BODYWEIGHT,
			equipment: 'Rueda abdominal',
			isCompound: true,
		},
		{
			name: 'Elevacion de gemelos de pie',
			slug: 'elevacion-de-gemelos-de-pie',
			description: 'Trabajo especifico para gemelos.',
			instructions: 'Recorrido amplio y pausa breve en contraccion.',
			muscleGroup: MuscleGroup.CALVES,
			category: ExerciseCategory.STRENGTH,
			equipment: 'Maquina',
			isCompound: false,
		},
	] as const;

	const exerciseMap = new Map<string, { id: string }>();

	for (const exercise of exercises) {
		const savedExercise = await prisma.exercise.upsert({
			where: { slug: exercise.slug },
			update: exercise,
			create: exercise,
		});

		exerciseMap.set(exercise.slug, { id: savedExercise.id });
	}

	await prisma.personalRecord.deleteMany({
		where: {
			userId: {
				in: [admin.id, coach.id, athlete.id],
			},
		},
	});

	await prisma.workoutSet.deleteMany({
		where: {
			workoutSession: {
				userId: {
					in: [admin.id, coach.id, athlete.id],
				},
			},
		},
	});

	await prisma.workoutSession.deleteMany({
		where: {
			userId: {
				in: [admin.id, coach.id, athlete.id],
			},
		},
	});

	await prisma.workoutPlanExercise.deleteMany({
		where: {
			workoutPlan: {
				userId: {
					in: [admin.id, coach.id, athlete.id],
				},
			},
		},
	});

	await prisma.workoutPlan.deleteMany({
		where: {
			userId: {
				in: [admin.id, coach.id, athlete.id],
			},
		},
	});

	const pushPullLegs = await prisma.workoutPlan.create({
		data: {
			userId: athlete.id,
			name: 'Push Pull Legs intermedio',
			description: 'Rutina de 5 dias con enfasis en hipertrofia y progresion de cargas.',
			isActive: true,
		},
	});

	const fullBody = await prisma.workoutPlan.create({
		data: {
			userId: coach.id,
			name: 'Full body 3 dias',
			description: 'Plan general para mejorar fuerza basica y tecnica.',
			isActive: true,
		},
	});

	await prisma.workoutPlanExercise.createMany({
		data: [
			{
				workoutPlanId: pushPullLegs.id,
				exerciseId: exerciseMap.get('press-de-banca-plano')!.id,
				order: 1,
				targetSets: 4,
				targetRepsMin: 6,
				targetRepsMax: 8,
				restSeconds: 150,
			},
			{
				workoutPlanId: pushPullLegs.id,
				exerciseId: exerciseMap.get('press-militar-de-pie')!.id,
				order: 2,
				targetSets: 3,
				targetRepsMin: 8,
				targetRepsMax: 10,
				restSeconds: 120,
			},
			{
				workoutPlanId: pushPullLegs.id,
				exerciseId: exerciseMap.get('extension-de-triceps-en-polea')!.id,
				order: 3,
				targetSets: 3,
				targetRepsMin: 10,
				targetRepsMax: 15,
				restSeconds: 75,
			},
			{
				workoutPlanId: fullBody.id,
				exerciseId: exerciseMap.get('sentadilla-con-barra')!.id,
				order: 1,
				targetSets: 4,
				targetRepsMin: 5,
				targetRepsMax: 8,
				restSeconds: 180,
			},
			{
				workoutPlanId: fullBody.id,
				exerciseId: exerciseMap.get('remo-con-barra')!.id,
				order: 2,
				targetSets: 4,
				targetRepsMin: 6,
				targetRepsMax: 10,
				restSeconds: 120,
			},
			{
				workoutPlanId: fullBody.id,
				exerciseId: exerciseMap.get('ab-wheel')!.id,
				order: 3,
				targetSets: 3,
				targetRepsMin: 8,
				targetRepsMax: 12,
				restSeconds: 60,
			},
		],
	});

	const sessionPierna = await prisma.workoutSession.create({
		data: {
			userId: athlete.id,
			workoutPlanId: fullBody.id,
			name: 'Sesion de pierna y gluteo',
			notes: 'Buen rendimiento general y tecnica solida.',
			startedAt: new Date('2026-03-21T18:00:00.000Z'),
			endedAt: new Date('2026-03-21T19:20:00.000Z'),
		},
	});

	const sessionPush = await prisma.workoutSession.create({
		data: {
			userId: athlete.id,
			workoutPlanId: pushPullLegs.id,
			name: 'Sesion push',
			notes: 'Fatiga moderada en hombro derecho al final.',
			startedAt: new Date('2026-03-22T17:45:00.000Z'),
			endedAt: new Date('2026-03-22T19:00:00.000Z'),
		},
	});

	const sessionLibre = await prisma.workoutSession.create({
		data: {
			userId: athlete.id,
			name: 'Cardio y core libre',
			notes: 'Sesión rapida fuera del plan semanal.',
			startedAt: new Date('2026-03-23T08:00:00.000Z'),
			endedAt: new Date('2026-03-23T08:40:00.000Z'),
		},
	});

	await prisma.workoutSet.createMany({
		data: [
			{
				workoutSessionId: sessionPierna.id,
				exerciseId: exerciseMap.get('sentadilla-con-barra')!.id,
				setNumber: 1,
				reps: 8,
				weightKg: 70,
				rir: 3,
				isWarmup: true,
			},
			{
				workoutSessionId: sessionPierna.id,
				exerciseId: exerciseMap.get('sentadilla-con-barra')!.id,
				setNumber: 2,
				reps: 6,
				weightKg: 90,
				rir: 2,
				isCompleted: true,
			},
			{
				workoutSessionId: sessionPierna.id,
				exerciseId: exerciseMap.get('hip-thrust-con-barra')!.id,
				setNumber: 1,
				reps: 10,
				weightKg: 100,
				rir: 2,
			},
			{
				workoutSessionId: sessionPush.id,
				exerciseId: exerciseMap.get('press-de-banca-plano')!.id,
				setNumber: 1,
				reps: 8,
				weightKg: 55,
				rir: 2,
			},
			{
				workoutSessionId: sessionPush.id,
				exerciseId: exerciseMap.get('press-militar-de-pie')!.id,
				setNumber: 1,
				reps: 10,
				weightKg: 30,
				rir: 2,
			},
			{
				workoutSessionId: sessionLibre.id,
				exerciseId: exerciseMap.get('ab-wheel')!.id,
				setNumber: 1,
				reps: 12,
				durationSeconds: null,
				distanceMeters: null,
				rir: 1,
			},
		],
	});

	await prisma.personalRecord.createMany({
		data: [
			{
				userId: athlete.id,
				exerciseId: exerciseMap.get('sentadilla-con-barra')!.id,
				metric: PersonalRecordMetric.ESTIMATED_1RM,
				value: 112.5,
				achievedAt: new Date('2026-03-21T19:15:00.000Z'),
			},
			{
				userId: athlete.id,
				exerciseId: exerciseMap.get('press-de-banca-plano')!.id,
				metric: PersonalRecordMetric.ESTIMATED_1RM,
				value: 72.5,
				achievedAt: new Date('2026-03-22T18:50:00.000Z'),
			},
			{
				userId: athlete.id,
				exerciseId: exerciseMap.get('dominadas-pronas')!.id,
				metric: PersonalRecordMetric.MAX_REPS,
				value: 11,
				achievedAt: new Date('2026-03-18T18:00:00.000Z'),
			},
		],
	});

	console.log('Seed completado');
	console.log('Usuarios de prueba:');
	console.log(`- admin@gym.local / ${defaultPassword}`);
	console.log(`- coach@gym.local / ${defaultPassword}`);
	console.log(`- usuario@gym.local / ${defaultPassword}`);
	console.log(`Ejercicios creados o actualizados: ${exercises.length}`);
}

main()
	.catch((error) => {
		console.error('Error al ejecutar el seed:', error);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
