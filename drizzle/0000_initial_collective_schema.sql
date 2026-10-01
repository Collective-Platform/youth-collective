CREATE SCHEMA IF NOT EXISTS "collective";
--> statement-breakpoint
CREATE TYPE "collective"."booking_status" AS ENUM('confirmed', 'cancelled', 'attended', 'no_show');--> statement-breakpoint
CREATE TYPE "collective"."notification_delivery_status" AS ENUM('queued', 'sending', 'sent', 'failed');--> statement-breakpoint
CREATE TYPE "collective"."notification_type" AS ENUM('booking_confirmation', 'waitlist_confirmation', 'waitlist_promotion', 'booking_cancellation', 'session_cancellation', 'session_reminder');--> statement-breakpoint
CREATE TYPE "collective"."session_status" AS ENUM('scheduled', 'cancelled');--> statement-breakpoint
CREATE TYPE "collective"."user_role" AS ENUM('user', 'admin', 'su');--> statement-breakpoint
CREATE TYPE "collective"."waitlist_status" AS ENUM('waiting', 'promoted', 'cancelled');--> statement-breakpoint
CREATE TABLE "collective"."auth_rate_limit_attempts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"identifier" text NOT NULL,
	"action" text NOT NULL,
	"attempt_count" integer DEFAULT 1 NOT NULL,
	"window_started_at" timestamp with time zone NOT NULL,
	"last_attempt_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "collective"."auth_sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_account_id" uuid NOT NULL,
	"token_hash" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "collective"."booking_status_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"booking_id" uuid NOT NULL,
	"previous_status" "collective"."booking_status",
	"next_status" "collective"."booking_status" NOT NULL,
	"changed_by_user_account_id" uuid,
	"reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "collective"."bookings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"person_id" uuid NOT NULL,
	"session_id" uuid NOT NULL,
	"status" "collective"."booking_status" DEFAULT 'confirmed' NOT NULL,
	"status_changed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "collective"."classes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"audience" text,
	"is_archived" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "collective"."notification_deliveries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"person_id" uuid NOT NULL,
	"session_id" uuid NOT NULL,
	"booking_id" uuid,
	"type" "collective"."notification_type" NOT NULL,
	"status" "collective"."notification_delivery_status" DEFAULT 'queued' NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"provider_message_id" text,
	"last_attempted_at" timestamp with time zone,
	"sent_at" timestamp with time zone,
	"failed_at" timestamp with time zone,
	"failure_reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "collective"."pending_auth" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"mode" text NOT NULL,
	"token_hash" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"consumed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "collective"."people" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text,
	"mobile" text,
	"privacy_consent_at" timestamp with time zone,
	"booking_consent_at" timestamp with time zone,
	"birth_date" date,
	"age_band" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "collective"."sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"class_id" uuid NOT NULL,
	"starts_at" timestamp with time zone NOT NULL,
	"ends_at" timestamp with time zone NOT NULL,
	"capacity" integer DEFAULT 30 NOT NULL,
	"status" "collective"."session_status" DEFAULT 'scheduled' NOT NULL,
	"cancellation_reason" text,
	"recurrence_group_id" uuid,
	"check_in_token" uuid DEFAULT gen_random_uuid() NOT NULL,
	"check_in_opens_at" timestamp with time zone,
	"check_in_closes_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sessions_capacity_is_positive" CHECK ("collective"."sessions"."capacity" > 0),
	CONSTRAINT "sessions_end_after_start" CHECK ("collective"."sessions"."ends_at" > "collective"."sessions"."starts_at"),
	CONSTRAINT "sessions_check_in_window_is_valid" CHECK (("collective"."sessions"."check_in_opens_at" is null and "collective"."sessions"."check_in_closes_at" is null) or "collective"."sessions"."check_in_closes_at" > "collective"."sessions"."check_in_opens_at")
);
--> statement-breakpoint
CREATE TABLE "collective"."user_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"person_id" uuid NOT NULL,
	"email" text NOT NULL,
	"email_verified_at" timestamp with time zone NOT NULL,
	"role" "collective"."user_role" DEFAULT 'user' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "collective"."waitlist_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"person_id" uuid NOT NULL,
	"session_id" uuid NOT NULL,
	"status" "collective"."waitlist_status" DEFAULT 'waiting' NOT NULL,
	"promoted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "collective"."auth_sessions" ADD CONSTRAINT "auth_sessions_user_account_id_user_accounts_id_fk" FOREIGN KEY ("user_account_id") REFERENCES "collective"."user_accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collective"."booking_status_history" ADD CONSTRAINT "booking_status_history_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "collective"."bookings"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collective"."booking_status_history" ADD CONSTRAINT "booking_status_history_changed_by_user_account_id_user_accounts_id_fk" FOREIGN KEY ("changed_by_user_account_id") REFERENCES "collective"."user_accounts"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collective"."bookings" ADD CONSTRAINT "bookings_person_id_people_id_fk" FOREIGN KEY ("person_id") REFERENCES "collective"."people"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collective"."bookings" ADD CONSTRAINT "bookings_session_id_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "collective"."sessions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collective"."notification_deliveries" ADD CONSTRAINT "notification_deliveries_person_id_people_id_fk" FOREIGN KEY ("person_id") REFERENCES "collective"."people"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collective"."notification_deliveries" ADD CONSTRAINT "notification_deliveries_session_id_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "collective"."sessions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collective"."notification_deliveries" ADD CONSTRAINT "notification_deliveries_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "collective"."bookings"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collective"."sessions" ADD CONSTRAINT "sessions_class_id_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "collective"."classes"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collective"."user_accounts" ADD CONSTRAINT "user_accounts_person_id_people_id_fk" FOREIGN KEY ("person_id") REFERENCES "collective"."people"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collective"."waitlist_entries" ADD CONSTRAINT "waitlist_entries_person_id_people_id_fk" FOREIGN KEY ("person_id") REFERENCES "collective"."people"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collective"."waitlist_entries" ADD CONSTRAINT "waitlist_entries_session_id_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "collective"."sessions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "auth_rate_limit_identifier_action_key" ON "collective"."auth_rate_limit_attempts" USING btree ("identifier","action");--> statement-breakpoint
CREATE INDEX "auth_sessions_user_account_id_idx" ON "collective"."auth_sessions" USING btree ("user_account_id");--> statement-breakpoint
CREATE INDEX "auth_sessions_expires_at_idx" ON "collective"."auth_sessions" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "booking_status_history_booking_created_idx" ON "collective"."booking_status_history" USING btree ("booking_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "bookings_person_session_key" ON "collective"."bookings" USING btree ("person_id","session_id");--> statement-breakpoint
CREATE INDEX "bookings_session_status_idx" ON "collective"."bookings" USING btree ("session_id","status");--> statement-breakpoint
CREATE INDEX "bookings_person_status_idx" ON "collective"."bookings" USING btree ("person_id","status");--> statement-breakpoint
CREATE INDEX "classes_active_idx" ON "collective"."classes" USING btree ("is_archived");--> statement-breakpoint
CREATE UNIQUE INDEX "notification_deliveries_person_session_type_key" ON "collective"."notification_deliveries" USING btree ("person_id","session_id","type");--> statement-breakpoint
CREATE INDEX "notification_deliveries_dispatch_idx" ON "collective"."notification_deliveries" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "pending_auth_lookup_idx" ON "collective"."pending_auth" USING btree ("email","token_hash","expires_at");--> statement-breakpoint
CREATE INDEX "sessions_timetable_idx" ON "collective"."sessions" USING btree ("status","starts_at");--> statement-breakpoint
CREATE INDEX "sessions_class_starts_at_idx" ON "collective"."sessions" USING btree ("class_id","starts_at");--> statement-breakpoint
CREATE UNIQUE INDEX "sessions_check_in_token_key" ON "collective"."sessions" USING btree ("check_in_token");--> statement-breakpoint
CREATE UNIQUE INDEX "user_accounts_person_key" ON "collective"."user_accounts" USING btree ("person_id");--> statement-breakpoint
CREATE UNIQUE INDEX "user_accounts_email_key" ON "collective"."user_accounts" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "waitlist_entries_person_session_key" ON "collective"."waitlist_entries" USING btree ("person_id","session_id");--> statement-breakpoint
CREATE INDEX "waitlist_entries_promotion_order_idx" ON "collective"."waitlist_entries" USING btree ("session_id","status","created_at");
