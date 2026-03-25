import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ExercisesModule } from './exercises/exercises.module';
import { WorkoutPlansModule } from './workout-plans/workout-plans.module';
import { WorkoutPlanExerciseModule } from './workout-plan-exercises/workout-plan-exercises.module';
import { WorkoutSessionsModule } from './workout-sessions/workout-sessions.module';
import { WorkoutSetsModule } from './workout-sets/workout-sets.module';
import { PersonalRecordsModule } from './personal-records/personal-records.module';
import { BullmqModule } from './bullmq/bullmq.module';
import { BullmqTestModule } from './bullmq/bullmq-test.module';

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
    WorkoutSessionsModule,
    WorkoutSetsModule,
    PersonalRecordsModule,
    process.env.NODE_ENV === 'test' ? BullmqTestModule : BullmqModule,
  ],
})
export class AppModule {}
