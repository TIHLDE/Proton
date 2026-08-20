-- CreateTable
CREATE TABLE "public"."team_position" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "team_position_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."leadership_period" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "name" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "leadership_period_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."position_assignment" (
    "id" TEXT NOT NULL,
    "periodId" TEXT NOT NULL,
    "positionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "position_assignment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "team_position_teamId_idx" ON "public"."team_position"("teamId");

-- CreateIndex
CREATE UNIQUE INDEX "team_position_teamId_name_key" ON "public"."team_position"("teamId", "name");

-- CreateIndex
CREATE INDEX "leadership_period_teamId_idx" ON "public"."leadership_period"("teamId");

-- CreateIndex
CREATE INDEX "position_assignment_periodId_idx" ON "public"."position_assignment"("periodId");

-- CreateIndex
CREATE UNIQUE INDEX "position_assignment_periodId_positionId_userId_key" ON "public"."position_assignment"("periodId", "positionId", "userId");

-- AddForeignKey
ALTER TABLE "public"."team_position" ADD CONSTRAINT "team_position_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "public"."team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."leadership_period" ADD CONSTRAINT "leadership_period_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "public"."team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."position_assignment" ADD CONSTRAINT "position_assignment_periodId_fkey" FOREIGN KEY ("periodId") REFERENCES "public"."leadership_period"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."position_assignment" ADD CONSTRAINT "position_assignment_positionId_fkey" FOREIGN KEY ("positionId") REFERENCES "public"."team_position"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."position_assignment" ADD CONSTRAINT "position_assignment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
