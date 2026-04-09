-- AlterTable
ALTER TABLE "User" ADD COLUMN "coachId" TEXT;

-- CreateIndex
CREATE INDEX "User_coachId_idx" ON "User"("coachId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_coachId_fkey" FOREIGN KEY ("coachId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
