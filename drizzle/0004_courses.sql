CREATE TABLE "collective"."courses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"is_archived" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
INSERT INTO "collective"."courses" ("id", "name", "description", "is_archived", "created_at", "updated_at")
SELECT "id", "name", "description", "is_archived", "created_at", "updated_at"
FROM "collective"."classes";
--> statement-breakpoint
ALTER TABLE "collective"."classes" ADD COLUMN "course_id" uuid;
--> statement-breakpoint
UPDATE "collective"."classes" SET "course_id" = "id";
--> statement-breakpoint
ALTER TABLE "collective"."classes" ALTER COLUMN "course_id" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "collective"."classes" ADD CONSTRAINT "classes_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "collective"."courses"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "courses_active_idx" ON "collective"."courses" USING btree ("is_archived");
