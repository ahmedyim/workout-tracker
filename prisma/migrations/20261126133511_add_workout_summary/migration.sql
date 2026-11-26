-- AlterTable
ALTER TABLE "Workout" ADD COLUMN     "aiSummary" JSONB,
ADD COLUMN     "aiSummaryAt" TIMESTAMP(3);
