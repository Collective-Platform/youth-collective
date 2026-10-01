import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  date,
  index,
  integer,
  pgSchema,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

/** All Collective data is isolated from the account's public and nhp schemas. */
export const collective = pgSchema("collective");

export const bookingStatus = collective.enum("booking_status", [
  "confirmed",
  "cancelled",
  "attended",
  "no_show",
]);

export const sessionStatus = collective.enum("session_status", ["scheduled", "cancelled"]);

/** Controls whether a Course is bookable, an intentional preview, or private. */
export const coursePublicStatus = collective.enum("course_public_status", [
  "active",
  "coming_next",
  "hidden",
]);

export const waitlistStatus = collective.enum("waitlist_status", ["waiting", "promoted", "cancelled"]);

export const userRole = collective.enum("user_role", ["user", "admin", "su"]);

export const notificationType = collective.enum("notification_type", [
  "booking_confirmation",
  "waitlist_confirmation",
  "waitlist_promotion",
  "booking_cancellation",
  "session_cancellation",
  "session_reminder",
]);

export const notificationDeliveryStatus = collective.enum("notification_delivery_status", [
  "queued",
  "sending",
  "sent",
  "failed",
]);

/** The canonical church record. A Person may exist without a login account. */
export const people = collective.table(
  "people",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name"),
    mobile: text("mobile"),
    privacyConsentAt: timestamp("privacy_consent_at", { withTimezone: true }),
    bookingConsentAt: timestamp("booking_consent_at", { withTimezone: true }),
    birthDate: date("birth_date"),
    ageBand: text("age_band"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
);

/** Login-only data. An Account is linked to exactly one Person after email verification. */
export const userAccounts = collective.table(
  "user_accounts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    personId: uuid("person_id")
      .notNull()
      .references(() => people.id, { onDelete: "restrict" }),
    email: text("email").notNull(),
    emailVerifiedAt: timestamp("email_verified_at", { withTimezone: true }).notNull(),
    role: userRole("role").default("user").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("user_accounts_person_key").on(table.personId),
    uniqueIndex("user_accounts_email_key").on(table.email),
  ],
);

/** One-time email codes are stored only as HMAC hashes and expire after ten minutes. */
export const pendingAuth = collective.table(
  "pending_auth",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    email: text("email").notNull(),
    mode: text("mode", { enum: ["login", "signup"] }).notNull(),
    tokenHash: text("token_hash").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    consumedAt: timestamp("consumed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("pending_auth_lookup_idx").on(table.email, table.tokenHash, table.expiresAt)],
);

/** Server-side sessions are revocable because only a hash of the raw token is persisted. */
export const authSessions = collective.table(
  "auth_sessions",
  {
    id: text("id").primaryKey(),
    userAccountId: uuid("user_account_id")
      .notNull()
      .references(() => userAccounts.id, { onDelete: "cascade" }),
    tokenHash: text("token_hash").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("auth_sessions_user_account_id_idx").on(table.userAccountId),
    index("auth_sessions_expires_at_idx").on(table.expiresAt),
  ],
);

/** Atomic, database-backed limits for OTP requests and verification attempts. */
export const authRateLimitAttempts = collective.table(
  "auth_rate_limit_attempts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    identifier: text("identifier").notNull(),
    action: text("action").notNull(),
    attemptCount: integer("attempt_count").default(1).notNull(),
    windowStartedAt: timestamp("window_started_at", { withTimezone: true }).notNull(),
    lastAttemptAt: timestamp("last_attempt_at", { withTimezone: true }).notNull(),
  },
  (table) => [uniqueIndex("auth_rate_limit_identifier_action_key").on(table.identifier, table.action)],
);


/** A Course groups related Classes into one reusable learning journey. */
export const courses = collective.table(
  "courses",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    description: text("description"),
    publicStatus: coursePublicStatus("public_status").default("hidden").notNull(),
    isArchived: boolean("is_archived").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("courses_active_idx").on(table.isArchived)],
);

/** A Class is one audience-specific offering within a Course. */
export const classes = collective.table(
  "classes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    courseId: uuid("course_id")
      .notNull()
      .references(() => courses.id, { onDelete: "restrict" }),
    name: text("name").notNull(),
    description: text("description"),
    audience: text("audience"),
    isArchived: boolean("is_archived").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("classes_active_idx").on(table.isArchived)],
);

/** A Session is a dated bookable occurrence, editable even when recurrence-generated. */
export const sessions = collective.table(
  "sessions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    classId: uuid("class_id")
      .notNull()
      .references(() => classes.id, { onDelete: "restrict" }),
    startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
    endsAt: timestamp("ends_at", { withTimezone: true }).notNull(),
    capacity: integer("capacity").default(30).notNull(),
    location: text("location"),
    displayName: text("display_name"),
    status: sessionStatus("status").default("scheduled").notNull(),
    cancellationReason: text("cancellation_reason"),
    recurrenceGroupId: uuid("recurrence_group_id"),
    checkInToken: uuid("check_in_token").defaultRandom().notNull(),
    checkInOpensAt: timestamp("check_in_opens_at", { withTimezone: true }),
    checkInClosesAt: timestamp("check_in_closes_at", { withTimezone: true }),
    attendanceFinalizedAt: timestamp("attendance_finalized_at", { withTimezone: true }),
    attendanceFinalizedByUserAccountId: uuid("attendance_finalized_by_user_account_id").references(() => userAccounts.id, {
      onDelete: "restrict",
    }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    index("sessions_timetable_idx").on(table.status, table.startsAt),
    index("sessions_class_starts_at_idx").on(table.classId, table.startsAt),
    uniqueIndex("sessions_check_in_token_key").on(table.checkInToken),
    check("sessions_capacity_is_positive", sql`${table.capacity} > 0`),
    check("sessions_end_after_start", sql`${table.endsAt} > ${table.startsAt}`),
    check(
      "sessions_check_in_window_is_valid",
      sql`(${table.checkInOpensAt} is null and ${table.checkInClosesAt} is null) or (${table.checkInOpensAt} is not null and ${table.checkInClosesAt} is not null and ${table.checkInClosesAt} > ${table.checkInOpensAt})`,
    ),
  ],
);

/** Durable staff audit events that are not Booking status transitions. */
export const sessionAuditEvents = collective.table(
  "session_audit_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    sessionId: uuid("session_id")
      .notNull()
      .references(() => sessions.id, { onDelete: "restrict" }),
    actorUserAccountId: uuid("actor_user_account_id")
      .notNull()
      .references(() => userAccounts.id, { onDelete: "restrict" }),
    type: text("type").notNull(),
    reason: text("reason").notNull(),
    details: text("details"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("session_audit_events_session_created_idx").on(table.sessionId, table.createdAt)],
);

/** A Booking is a Person's single attendance reservation for one Session. */
export const bookings = collective.table(
  "bookings",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    personId: uuid("person_id")
      .notNull()
      .references(() => people.id, { onDelete: "restrict" }),
    sessionId: uuid("session_id")
      .notNull()
      .references(() => sessions.id, { onDelete: "restrict" }),
    status: bookingStatus("status").default("confirmed").notNull(),
    statusChangedAt: timestamp("status_changed_at", { withTimezone: true }).defaultNow().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("bookings_person_session_key").on(table.personId, table.sessionId),
    index("bookings_session_status_idx").on(table.sessionId, table.status),
    index("bookings_person_status_idx").on(table.personId, table.status),
  ],
);

/** Waitlist preserves the order in which People requested a full Session. */
export const waitlistEntries = collective.table(
  "waitlist_entries",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    personId: uuid("person_id")
      .notNull()
      .references(() => people.id, { onDelete: "restrict" }),
    sessionId: uuid("session_id")
      .notNull()
      .references(() => sessions.id, { onDelete: "restrict" }),
    status: waitlistStatus("status").default("waiting").notNull(),
    promotedAt: timestamp("promoted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("waitlist_entries_person_session_key").on(table.personId, table.sessionId),
    index("waitlist_entries_promotion_order_idx").on(table.sessionId, table.status, table.createdAt),
  ],
);

/** Immutable audit trail for every Booking status transition. */
export const bookingStatusHistory = collective.table(
  "booking_status_history",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    bookingId: uuid("booking_id")
      .notNull()
      .references(() => bookings.id, { onDelete: "restrict" }),
    previousStatus: bookingStatus("previous_status"),
    nextStatus: bookingStatus("next_status").notNull(),
    changedByUserAccountId: uuid("changed_by_user_account_id").references(() => userAccounts.id, {
      onDelete: "restrict",
    }),
    reason: text("reason"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("booking_status_history_booking_created_idx").on(table.bookingId, table.createdAt)],
);

/**
 * Durable, idempotent email work. A notification is created in the same
 * transaction as the booking event and is delivered only after commit.
 */
export const notificationDeliveries = collective.table(
  "notification_deliveries",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    personId: uuid("person_id")
      .notNull()
      .references(() => people.id, { onDelete: "restrict" }),
    sessionId: uuid("session_id")
      .notNull()
      .references(() => sessions.id, { onDelete: "restrict" }),
    bookingId: uuid("booking_id").references(() => bookings.id, { onDelete: "restrict" }),
    idempotencyKey: text("idempotency_key").default(sql`gen_random_uuid()::text`).notNull(),
    type: notificationType("type").notNull(),
    status: notificationDeliveryStatus("status").default("queued").notNull(),
    attempts: integer("attempts").default(0).notNull(),
    providerMessageId: text("provider_message_id"),
    lastAttemptedAt: timestamp("last_attempted_at", { withTimezone: true }),
    sentAt: timestamp("sent_at", { withTimezone: true }),
    failedAt: timestamp("failed_at", { withTimezone: true }),
    failureReason: text("failure_reason"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("notification_deliveries_idempotency_key").on(table.idempotencyKey),
    index("notification_deliveries_dispatch_idx").on(table.status, table.createdAt),
  ],
);
