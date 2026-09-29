-- CreateTable
CREATE TABLE "public"."event_fine" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "issuedById" TEXT,
    "quantity" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "lawId" TEXT,
    "photonFineId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "event_fine_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "event_fine_userId_idx" ON "public"."event_fine"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "event_fine_eventId_userId_key" ON "public"."event_fine"("eventId", "userId");

-- AddForeignKey
ALTER TABLE "public"."event_fine" ADD CONSTRAINT "event_fine_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "public"."team_event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."event_fine" ADD CONSTRAINT "event_fine_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."event_fine" ADD CONSTRAINT "event_fine_issuedById_fkey" FOREIGN KEY ("issuedById") REFERENCES "public"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

