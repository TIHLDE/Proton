-- CreateTable
CREATE TABLE "public"."team_group" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "team_group_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."team_group_member" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "team_group_member_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "team_group_teamId_idx" ON "public"."team_group"("teamId");

-- CreateIndex
CREATE UNIQUE INDEX "team_group_teamId_name_key" ON "public"."team_group"("teamId", "name");

-- CreateIndex
CREATE INDEX "team_group_member_userId_idx" ON "public"."team_group_member"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "team_group_member_groupId_userId_key" ON "public"."team_group_member"("groupId", "userId");

-- AddForeignKey
ALTER TABLE "public"."team_group" ADD CONSTRAINT "team_group_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "public"."team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."team_group_member" ADD CONSTRAINT "team_group_member_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "public"."team_group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."team_group_member" ADD CONSTRAINT "team_group_member_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
