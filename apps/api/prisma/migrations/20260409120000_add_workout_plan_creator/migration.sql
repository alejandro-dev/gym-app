-- AlterTable
ALTER TABLE "WorkoutPlan" ADD COLUMN "createdById" TEXT;

-- Backfill existing plans so current data keeps the same ownership semantics.
UPDATE "WorkoutPlan"
SET "createdById" = "userId"
WHERE "createdById" IS NULL;

-- AlterTable
ALTER TABLE "WorkoutPlan" ALTER COLUMN "createdById" SET NOT NULL;

-- CreateIndex
CREATE INDEX "WorkoutPlan_createdById_idx" ON "WorkoutPlan"("createdById");

-- AddForeignKey
ALTER TABLE "WorkoutPlan" ADD CONSTRAINT "WorkoutPlan_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
