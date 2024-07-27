/*
  Warnings:

  - You are about to alter the column `verificationCode` on the `PasswordRecoveryRequest` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(6)`.
  - You are about to alter the column `verificationCode` on the `RegistrationRequest` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(6)`.
  - A unique constraint covering the columns `[userId,name]` on the table `Category` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "PasswordRecoveryRequest" ALTER COLUMN "verificationCode" SET DATA TYPE VARCHAR(6);

-- AlterTable
ALTER TABLE "RegistrationRequest" ALTER COLUMN "verificationCode" SET DATA TYPE VARCHAR(6);

-- CreateIndex
CREATE UNIQUE INDEX "Category_userId_name_key" ON "Category"("userId", "name");
