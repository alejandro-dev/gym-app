/*
  Warnings:

  - Changed the type of `metric` on the `PersonalRecord` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
CREATE TYPE "PersonalRecordMetric" AS ENUM (
  'ESTIMATED_1RM',
  'MAX_WEIGHT',
  'MAX_REPS',
  'MAX_DISTANCE',
  'MAX_DURATION',
  'EXERCISE_VOLUME',
  'SESSION_VOLUME'
);

ALTER TABLE "PersonalRecord"
ADD COLUMN "metric_new" "PersonalRecordMetric";

UPDATE "PersonalRecord"
SET "metric_new" = CASE
  WHEN "metric" = 'estimated-1rm' THEN 'ESTIMATED_1RM'::"PersonalRecordMetric"
  WHEN "metric" = 'max-weight' THEN 'MAX_WEIGHT'::"PersonalRecordMetric"
  WHEN "metric" = 'max-reps' THEN 'MAX_REPS'::"PersonalRecordMetric"
  WHEN "metric" = 'max-distance' THEN 'MAX_DISTANCE'::"PersonalRecordMetric"
  WHEN "metric" = 'max-duration' THEN 'MAX_DURATION'::"PersonalRecordMetric"
  WHEN "metric" = 'exercise-volume' THEN 'EXERCISE_VOLUME'::"PersonalRecordMetric"
  WHEN "metric" = 'session-volume' THEN 'SESSION_VOLUME'::"PersonalRecordMetric"
  ELSE NULL
END;

ALTER TABLE "PersonalRecord"
ALTER COLUMN "metric_new" SET NOT NULL;

ALTER TABLE "PersonalRecord"
DROP COLUMN "metric";

ALTER TABLE "PersonalRecord"
RENAME COLUMN "metric_new" TO "metric";

