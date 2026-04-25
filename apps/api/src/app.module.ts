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
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
   imports: [
      ConfigModule.forRoot({
         isGlobal: true,
      }),
      // Añade el módulo de Throttler con la configuracion de 60 segundos y 20 peticiones por IP
      ThrottlerModule.forRoot([
         {
            name: 'default',
            ttl: 60_000,
            limit: 20,
         },
      ]),
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
