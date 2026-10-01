ALTER TABLE "collective"."sessions" ADD COLUMN "attendance_finalized_at" timestamp with time zone;
--> statement-breakpoint
ALTER TABLE "collective"."sessions" ADD COLUMN "attendance_finalized_by_user_account_id" uuid;
--> statement-breakpoint
ALTER TABLE "collective"."sessions" ADD CONSTRAINT "sessions_attendance_finalized_by_user_account_id_user_accounts_id_fk" FOREIGN KEY ("attendance_finalized_by_user_account_id") REFERENCES "collective"."user_accounts"("id") ON DELETE restrict ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "collective"."sessions" DROP CONSTRAINT IF EXISTS "sessions_check_in_window_is_valid";
--> statement-breakpoint
UPDATE "collective"."sessions"
SET "check_in_opens_at" = NULL, "check_in_closes_at" = NULL
WHERE ("check_in_opens_at" IS NULL) <> ("check_in_closes_at" IS NULL);
--> statement-breakpoint
ALTER TABLE "collective"."sessions" ADD CONSTRAINT "sessions_check_in_window_is_valid" CHECK (("check_in_opens_at" is null and "check_in_closes_at" is null) or ("check_in_opens_at" is not null and "check_in_closes_at" is not null and "check_in_closes_at" > "check_in_opens_at"));
--> statement-breakpoint
ALTER TABLE "collective"."notification_deliveries" ADD COLUMN "idempotency_key" text;
--> statement-breakpoint
UPDATE "collective"."notification_deliveries" SET "idempotency_key" = "id"::text WHERE "idempotency_key" IS NULL;
--> statement-breakpoint
ALTER TABLE "collective"."notification_deliveries" ALTER COLUMN "idempotency_key" SET DEFAULT gen_random_uuid()::text;
--> statement-breakpoint
ALTER TABLE "collective"."notification_deliveries" ALTER COLUMN "idempotency_key" SET NOT NULL;
--> statement-breakpoint
DROP INDEX IF EXISTS "collective"."notification_deliveries_person_session_type_key";
--> statement-breakpoint
CREATE UNIQUE INDEX "notification_deliveries_idempotency_key" ON "collective"."notification_deliveries" USING btree ("idempotency_key");
