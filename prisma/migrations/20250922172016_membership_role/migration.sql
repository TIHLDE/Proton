/*
  Warnings:

  - The `role` column on the `team_member` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "public"."TeamRole" AS ENUM ('ADMIN', 'USER');

-- AlterTable
ALTER TABLE "public"."team_member" DROP COLUMN "role",
ADD COLUMN     "role" "public"."TeamRole" NOT NULL DEFAULT 'USER';

-- DropEnum
DROP TYPE "public"."Role";
