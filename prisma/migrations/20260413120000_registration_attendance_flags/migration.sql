ALTER TABLE "registration" DROP COLUMN IF EXISTS "confirmedAbsent";
ALTER TABLE "registration" DROP COLUMN IF EXISTS "attendedWithoutRsvp";

DO $$
BEGIN
  CREATE TYPE "AttendanceStatus" AS ENUM ('PRESENT', 'ABSENT');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE "AttendanceSource" AS ENUM ('RSVP', 'MANUAL');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "attendance" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "eventId" TEXT NOT NULL,
  "status" "AttendanceStatus" NOT NULL,
  "source" "AttendanceSource" NOT NULL DEFAULT 'RSVP',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "attendance_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "attendance_userId_eventId_key"
ON "attendance"("userId", "eventId");

DO $$
BEGIN
  ALTER TABLE "attendance"
  ADD CONSTRAINT "attendance_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "user"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE "attendance"
  ADD CONSTRAINT "attendance_eventId_fkey"
  FOREIGN KEY ("eventId") REFERENCES "team_event"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
