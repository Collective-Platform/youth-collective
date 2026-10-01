CREATE TABLE "collective"."session_audit_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"actor_user_account_id" uuid NOT NULL,
	"type" text NOT NULL,
	"reason" text NOT NULL,
	"details" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "collective"."session_audit_events" ADD CONSTRAINT "session_audit_events_session_id_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "collective"."sessions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collective"."session_audit_events" ADD CONSTRAINT "session_audit_events_actor_user_account_id_user_accounts_id_fk" FOREIGN KEY ("actor_user_account_id") REFERENCES "collective"."user_accounts"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "session_audit_events_session_created_idx" ON "collective"."session_audit_events" USING btree ("session_id","created_at");
