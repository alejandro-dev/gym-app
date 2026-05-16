-- Reorder existing plan exercises into a single sequence per plan before
-- dropping the day column; this prevents duplicate (workoutPlanId, order)
-- values when old plans had the same order on different days.
WITH ordered_exercises AS (
  SELECT
    "id",
    ROW_NUMBER() OVER (
      PARTITION BY "workoutPlanId"
      ORDER BY "day" NULLS LAST, "order", "id"
    ) AS "nextOrder"
  FROM "WorkoutPlanExercise"
)
UPDATE "WorkoutPlanExercise"
SET "order" = ordered_exercises."nextOrder"
FROM ordered_exercises
WHERE "WorkoutPlanExercise"."id" = ordered_exercises."id";

DROP INDEX IF EXISTS "WorkoutPlanExercise_workoutPlanId_day_order_key";

ALTER TABLE "WorkoutPlan"
DROP COLUMN "durationWeeks";

ALTER TABLE "WorkoutPlanExercise"
DROP COLUMN "day";

CREATE UNIQUE INDEX "WorkoutPlanExercise_workoutPlanId_order_key"
ON "WorkoutPlanExercise"("workoutPlanId", "order");
