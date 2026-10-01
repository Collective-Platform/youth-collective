CREATE TYPE "collective"."course_public_status" AS ENUM('active', 'coming_next', 'hidden');
--> statement-breakpoint
ALTER TABLE "collective"."courses" ADD COLUMN "public_status" "collective"."course_public_status" DEFAULT 'hidden' NOT NULL;
--> statement-breakpoint
UPDATE "collective"."courses"
SET "public_status" = 'active'
WHERE "is_archived" = false AND "name" ILIKE '%Knowing God%';
