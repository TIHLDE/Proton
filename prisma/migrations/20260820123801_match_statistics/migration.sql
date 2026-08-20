-- CreateEnum
CREATE TYPE "public"."MatchEventType" AS ENUM ('GOAL', 'ASSIST', 'YELLOW_CARD', 'RED_CARD', 'MOTM');

-- CreateTable
CREATE TABLE "public"."match" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "homeGoals" INTEGER NOT NULL DEFAULT 0,
    "awayGoals" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "match_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."match_event" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "public"."MatchEventType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "match_event_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "match_eventId_key" ON "public"."match"("eventId");

-- CreateIndex
CREATE INDEX "match_event_matchId_idx" ON "public"."match_event"("matchId");

-- CreateIndex
CREATE INDEX "match_event_userId_idx" ON "public"."match_event"("userId");

-- AddForeignKey
ALTER TABLE "public"."match" ADD CONSTRAINT "match_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "public"."team_event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."match_event" ADD CONSTRAINT "match_event_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "public"."match"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."match_event" ADD CONSTRAINT "match_event_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
