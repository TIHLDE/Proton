-- AlterTable
ALTER TABLE "public"."team_member" ADD COLUMN     "inactiveComment" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;
