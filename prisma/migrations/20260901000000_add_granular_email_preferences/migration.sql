-- Only disabled categories are stored; an omitted key means enabled.
ALTER TABLE "public"."user"
  ADD COLUMN "disabledEmailNotifications" JSONB NOT NULL DEFAULT '{}'::JSONB;
