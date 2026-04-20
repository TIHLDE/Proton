/*
  Warnings:

  - A unique constraint covering the columns `[calendarToken]` on the table `user` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."user" ADD COLUMN     "calendarToken" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "user_calendarToken_key" ON "public"."user"("calendarToken");
