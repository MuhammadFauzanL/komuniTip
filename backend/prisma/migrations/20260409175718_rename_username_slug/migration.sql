/*
  Warnings:

  - You are about to drop the column `username_slug` on the `users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[username]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "users_username_slug_key";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "username_slug",
ADD COLUMN     "username" VARCHAR(30);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");
