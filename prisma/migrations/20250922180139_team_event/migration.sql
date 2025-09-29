-- CreateEnum
CREATE TYPE "public"."TeamEventType" AS ENUM ('TRAINING', 'MATCH', 'SOCIAL', 'OTHER');

-- CreateTable
CREATE TABLE "public"."team_event" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startAt" TIMESTAMP(3) NOT NULL,
    "endAt" TIMESTAMP(3),
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "location" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "team_event_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."team_event" ADD CONSTRAINT "team_event_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "public"."team"("id") ON DELETE CASCADE ON UPDATE CASCADE;
