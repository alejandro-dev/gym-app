import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ExercisesModule } from './exercises/exercises.module';
import { WorkoutPlansModule } from './workout-plans/workout-plans.module';
import { WorkoutPlanExerciseModule } from './workout-plan-exercises/workout-plan-exercises.module';
import { WorkoutSessionsModule } from './workout-sessions/workout-sessions.module';

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
		}),
		PrismaModule,
		AuthModule,
		UsersModule,
		ExercisesModule,
		WorkoutPlansModule,
		WorkoutPlanExerciseModule,
		WorkoutSessionsModule
	]
})
export class AppModule {}
