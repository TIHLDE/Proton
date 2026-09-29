-- CreateTable
CREATE TABLE "public"."fine" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "issuedByUserId" TEXT NOT NULL,
    "reversed" BOOLEAN NOT NULL DEFAULT false,
    "reversedByUserId" TEXT,
    "reversedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fine_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "fine_teamId_idx" ON "public"."fine"("teamId");

-- CreateIndex
CREATE UNIQUE INDEX "fine_userId_eventId_key" ON "public"."fine"("userId", "eventId");

-- AddForeignKey
ALTER TABLE "public"."fine" ADD CONSTRAINT "fine_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."fine" ADD CONSTRAINT "fine_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "public"."team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."fine" ADD CONSTRAINT "fine_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "public"."team_event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."fine" ADD CONSTRAINT "fine_issuedByUserId_fkey" FOREIGN KEY ("issuedByUserId") REFERENCES "public"."user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."fine" ADD CONSTRAINT "fine_reversedByUserId_fkey" FOREIGN KEY ("reversedByUserId") REFERENCES "public"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
