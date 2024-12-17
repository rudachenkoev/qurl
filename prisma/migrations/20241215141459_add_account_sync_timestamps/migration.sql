-- AlterTable
ALTER TABLE "Category" ALTER COLUMN "icon" SET DEFAULT 'i-heroicons-question-mark-circle';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "calendarSyncAt" TIMESTAMP(3),
ADD COLUMN     "contactsSyncAt" TIMESTAMP(3);
