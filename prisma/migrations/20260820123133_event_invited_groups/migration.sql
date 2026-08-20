-- CreateTable
CREATE TABLE "public"."team_event_group" (
    "eventId" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "team_event_group_pkey" PRIMARY KEY ("eventId","groupId")
);

-- CreateIndex
CREATE INDEX "team_event_group_groupId_idx" ON "public"."team_event_group"("groupId");

-- AddForeignKey
ALTER TABLE "public"."team_event_group" ADD CONSTRAINT "team_event_group_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "public"."team_event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."team_event_group" ADD CONSTRAINT "team_event_group_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "public"."team_group"("id") ON DELETE CASCADE ON UPDATE CASCADE;
