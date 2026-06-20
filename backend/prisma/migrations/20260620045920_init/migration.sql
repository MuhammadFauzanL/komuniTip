/*
  Warnings:

  - The primary key for the `login_attempts` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "login_attempts" DROP CONSTRAINT "login_attempts_pkey",
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "updatedAt" DROP DEFAULT,
ADD CONSTRAINT "login_attempts_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "withdrawals" ALTER COLUMN "updatedAt" DROP DEFAULT;
