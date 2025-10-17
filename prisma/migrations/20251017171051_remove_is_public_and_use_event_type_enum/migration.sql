/*
  Warnings:

  - You are about to drop the column `isPublic` on the `team_event` table. All the data in the column will be lost.
  - Changed the type of `eventType` on the `team_event` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable: First add a temporary column
ALTER TABLE "public"."team_event" ADD COLUMN "eventType_new" "public"."TeamEventType";

-- Migrate existing data (assuming old values were lowercase)
UPDATE "public"."team_event" 
SET "eventType_new" = CASE 
  WHEN UPPER("eventType") = 'TRAINING' THEN 'TRAINING'::"public"."TeamEventType"
  WHEN UPPER("eventType") = 'MATCH' THEN 'MATCH'::"public"."TeamEventType"
  WHEN UPPER("eventType") = 'SOCIAL' THEN 'SOCIAL'::"public"."TeamEventType"
  ELSE 'OTHER'::"public"."TeamEventType"
END;

-- Drop old columns
ALTER TABLE "public"."team_event" DROP COLUMN "isPublic";
ALTER TABLE "public"."team_event" DROP COLUMN "eventType";

-- Rename the new column
ALTER TABLE "public"."team_event" RENAME COLUMN "eventType_new" TO "eventType";

-- Make the column NOT NULL
ALTER TABLE "public"."team_event" ALTER COLUMN "eventType" SET NOT NULL;
