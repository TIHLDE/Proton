-- CreateEnum
CREATE TYPE "public"."TeamCategory" AS ENUM ('PYTHONS', 'TIHLDE');

-- AlterTable
ALTER TABLE "public"."team" ADD COLUMN     "category" "public"."TeamCategory" NOT NULL DEFAULT 'TIHLDE',
ADD COLUMN     "emoji" TEXT,
ADD COLUMN     "logoUrl" TEXT;
