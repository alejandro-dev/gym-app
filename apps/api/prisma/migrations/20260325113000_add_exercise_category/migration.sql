CREATE TYPE "ExerciseCategory" AS ENUM (
  'STRENGTH',
  'BODYWEIGHT',
  'CARDIO'
);

ALTER TABLE "Exercise"
ADD COLUMN "category" "ExerciseCategory" NOT NULL DEFAULT 'STRENGTH';
