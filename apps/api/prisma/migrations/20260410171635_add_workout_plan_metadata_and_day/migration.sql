-- CreateEnum
CREATE TYPE "WorkoutPlanGoal" AS ENUM (
  'STRENGTH',
  'HYPERTROPHY',
  'FAT_LOSS',
  'ENDURANCE',
  'GENERAL_FITNESS',
  'REHAB'
);

-- CreateEnum
CREATE TYPE "WorkoutPlanLevel" AS ENUM (
  'BEGINNER',
  'INTERMEDIATE',
  'ADVANCED'
);

-- AlterTable
ALTER TABLE "WorkoutPlan"
ADD COLUMN "goal" "WorkoutPlanGoal",
ADD COLUMN "level" "WorkoutPlanLevel",
ADD COLUMN "durationWeeks" INTEGER;

-- AlterTable
ALTER TABLE "WorkoutPlanExercise"
ADD COLUMN "day" INTEGER;

-- Prisma created the previous @@unique as a unique index in the initial migration.
DROP INDEX IF EXISTS "WorkoutPlanExercise_workoutPlanId_order_key";

CREATE UNIQUE INDEX "WorkoutPlanExercise_workoutPlanId_day_order_key"
ON "WorkoutPlanExercise"("workoutPlanId", "day", "order");
