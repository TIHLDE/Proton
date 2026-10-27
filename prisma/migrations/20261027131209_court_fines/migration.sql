-- CreateEnum
CREATE TYPE "public"."CourtRule" AS ENUM ('SNITCH', 'GOOD_BOY');

-- AlterTable
ALTER TABLE "public"."team" ADD COLUMN     "lastCourtAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "public"."court_fine" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "since" TIMESTAMP(3) NOT NULL,
    "rule" "public"."CourtRule" NOT NULL,
    "userId" TEXT NOT NULL,
    "issuedById" TEXT,
    "quantity" INTEGER NOT NULL,
    "photonFineId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "court_fine_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "court_fine_teamId_since_rule_userId_key" ON "public"."court_fine"("teamId", "since", "rule", "userId");

-- AddForeignKey
ALTER TABLE "public"."court_fine" ADD CONSTRAINT "court_fine_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "public"."team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."court_fine" ADD CONSTRAINT "court_fine_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."court_fine" ADD CONSTRAINT "court_fine_issuedById_fkey" FOREIGN KEY ("issuedById") REFERENCES "public"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
