/*
  Warnings:

  - You are about to drop the column `url` on the `team` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[slug]` on the table `team` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."team_url_key";

-- AlterTable
ALTER TABLE "public"."team" DROP COLUMN "url",
ADD COLUMN     "slug" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "team_slug_key" ON "public"."team"("slug");
