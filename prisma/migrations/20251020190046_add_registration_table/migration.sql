-- CreateEnum
CREATE TYPE "public"."RegistrationType" AS ENUM ('ATTENDING', 'NOT_ATTENDING');

-- CreateTable
CREATE TABLE "public"."registration" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "type" "public"."RegistrationType" NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "registration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "registration_userId_eventId_key" ON "public"."registration"("userId", "eventId");

-- AddForeignKey
ALTER TABLE "public"."registration" ADD CONSTRAINT "registration_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."registration" ADD CONSTRAINT "registration_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "public"."team_event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
