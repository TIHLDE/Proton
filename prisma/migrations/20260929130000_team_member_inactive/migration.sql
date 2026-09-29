-- AlterTable
ALTER TABLE "public"."team_member" ADD COLUMN     "inactiveReason" TEXT,
ADD COLUMN     "inactiveSince" TIMESTAMP(3);

