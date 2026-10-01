import "server-only";

import { eq } from "drizzle-orm";
import type { TransactionSql } from "postgres";

import { getDatabase } from "../db/client.ts";
import { notificationDeliveries } from "../db/schema.ts";
import { withDatabaseTransaction } from "../db/repository.ts";
import { SESSION_TIME_ZONE } from "../session-time.ts";

export type NotificationDispatchResult = "sent" | "skipped" | "failed";

type NotificationJob = {
  id: string;
  type:
    | "booking_confirmation"
    | "waitlist_confirmation"
    | "waitlist_promotion"
    | "booking_cancellation"
    | "session_cancellation"
    | "session_reminder";
  email: string;
  name: string;
  class_name: string;
  starts_at: Date;
  ends_at: Date;
};

const sessionDateTime = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "full",
  timeStyle: "short",
  timeZone: SESSION_TIME_ZONE,
});

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character]!);
}

function getSiteUrl() {
  return (process.env.SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

function emailContent(job: NotificationJob) {
  const className = escapeHtml(job.class_name);
  const name = escapeHtml(job.name);
  const when = sessionDateTime.format(job.starts_at);
  const bookingsUrl = `${getSiteUrl()}/dashboard`;
  const classesUrl = `${getSiteUrl()}/classes`;

  const messages = {
    booking_confirmation: {
      subject: `You’re booked: ${job.class_name}`,
      heading: "Your place is confirmed",
      body: `You’re in for ${className} on ${escapeHtml(when)}. Keep this email handy, or check your dashboard whenever you need the details.`,
      link: bookingsUrl,
      linkLabel: "View dashboard",
    },
    waitlist_confirmation: {
      subject: `You’re on the waitlist: ${job.class_name}`,
      heading: "You’re on the waitlist",
      body: `${className} is full for ${escapeHtml(when)}, but your place in line is saved. We’ll email you if a place opens.`,
      link: bookingsUrl,
      linkLabel: "View dashboard",
    },
    waitlist_promotion: {
      subject: `A place opened up: ${job.class_name}`,
      heading: "You have a place",
      body: `Good news — a place opened up for ${className} on ${escapeHtml(when)} and your Booking is now confirmed.`,
      link: bookingsUrl,
      linkLabel: "View my bookings",
    },
    booking_cancellation: {
      subject: `Booking cancelled: ${job.class_name}`,
      heading: "Your Booking is cancelled",
      body: `Your place for ${className} on ${escapeHtml(when)} has been released. You can browse another Session whenever you’re ready.`,
      link: classesUrl,
      linkLabel: "Browse Classes",
    },
    session_cancellation: {
      subject: `Session cancelled: ${job.class_name}`,
      heading: "This Session is cancelled",
      body: `${className} on ${escapeHtml(when)} will no longer take place. Your place has been released; please browse the timetable for another Session.`,
      link: classesUrl,
      linkLabel: "Browse Classes",
    },
    session_reminder: {
      subject: `Tomorrow: ${job.class_name}`,
      heading: "See you tomorrow",
      body: `A quick reminder: you’re booked for ${className} tomorrow at ${escapeHtml(when)}.`,
      link: bookingsUrl,
      linkLabel: "View my bookings",
    },
  } as const;

  const message = messages[job.type];
  return {
    subject: message.subject,
    text: `Hi ${job.name},\n\n${message.heading}\n\n${message.body.replace(/<[^>]*>/g, "")}\n\n${message.linkLabel}: ${message.link}`,
    html: `<main style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:32px;color:#111111"><p>Hi ${name},</p><h1 style="font-size:28px">${message.heading}</h1><p style="font-size:16px;line-height:1.6">${message.body}</p><p><a href="${message.link}" style="display:inline-block;background:#5038e1;border-radius:999px;color:#ffffff;font-weight:bold;padding:12px 20px;text-decoration:none">${message.linkLabel}</a></p></main>`,
  };
}

async function claimNotificationDelivery(id: string): Promise<NotificationJob | null> {
  return withDatabaseTransaction(async (transaction) => {
    const [claimed] = await transaction<{ id: string }[]>`
      update notification_deliveries
      set status = 'sending', attempts = attempts + 1, last_attempted_at = now(), updated_at = now()
      where id = ${id}
        and (
          status = 'queued'
          or (status = 'failed' and attempts < 5)
          or (status = 'sending' and last_attempted_at < now() - interval '10 minutes')
        )
      returning id
    `;
    if (!claimed) return null;

    const [job] = await transaction<NotificationJob[]>`
      select
        notification_deliveries.id,
        notification_deliveries.type,
        user_accounts.email,
        people.name,
        case
          when sessions.recurrence_group_id is null then classes.name
          else classes.name || ' - ' || (
            select count(*)::text
            from sessions as numbered_sessions
            where numbered_sessions.recurrence_group_id = sessions.recurrence_group_id
              and (
                numbered_sessions.starts_at < sessions.starts_at
                or (numbered_sessions.starts_at = sessions.starts_at and numbered_sessions.id <= sessions.id)
              )
          )
        end as class_name,
        sessions.starts_at,
        sessions.ends_at
      from notification_deliveries
      inner join people on people.id = notification_deliveries.person_id
      inner join user_accounts on user_accounts.person_id = people.id
      inner join sessions on sessions.id = notification_deliveries.session_id
      inner join classes on classes.id = sessions.class_id
      where notification_deliveries.id = ${id}
    `;
    return job ?? null;
  });
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message.slice(0, 1000) : "Unknown email delivery error";
}

/** Delivers one queued notification at most once at a time. */
export async function dispatchNotificationDelivery(id: string): Promise<NotificationDispatchResult> {
  const job = await claimNotificationDelivery(id);
  if (!job) return "skipped";

  try {
    const apiKey = process.env.MAILERSEND_API_KEY;
    const fromEmail = process.env.MAILERSEND_FROM_EMAIL;
    const fromName = process.env.MAILERSEND_FROM_NAME ?? "Youth Collective";
    if (!apiKey || !fromEmail) {
      throw new Error("MAILERSEND_API_KEY and MAILERSEND_FROM_EMAIL must be configured.");
    }

    const message = emailContent(job);
    const response = await fetch("https://api.mailersend.com/v1/email", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        from: { email: fromEmail, name: fromName },
        to: [{ email: job.email, name: job.name }],
        subject: message.subject,
        html: message.html,
        text: message.text,
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) {
      throw new Error(`MailerSend notification delivery failed with status ${response.status}.`);
    }

    await getDatabase()
      .update(notificationDeliveries)
      .set({
        status: "sent",
        providerMessageId: response.headers.get("x-message-id"),
        sentAt: new Date(),
        failedAt: null,
        failureReason: null,
        updatedAt: new Date(),
      })
      .where(eq(notificationDeliveries.id, id));
    return "sent";
  } catch (error) {
    await getDatabase()
      .update(notificationDeliveries)
      .set({ status: "failed", failedAt: new Date(), failureReason: errorMessage(error), updatedAt: new Date() })
      .where(eq(notificationDeliveries.id, id));
    return "failed";
  }
}

/** Queues reminders for confirmed Bookings 23–25 hours before their Session. */
export async function enqueueSessionReminders(now = new Date()) {
  const opensAt = new Date(now.getTime() + 23 * 60 * 60 * 1000);
  const closesAt = new Date(now.getTime() + 25 * 60 * 60 * 1000);
  const database = getDatabase();
  const rows = await withDatabaseTransaction((transaction) => transaction<{
    person_id: string;
    session_id: string;
    booking_id: string;
  }[]>`
    select bookings.person_id, bookings.session_id, bookings.id as booking_id
    from bookings
    inner join sessions on sessions.id = bookings.session_id
    where bookings.status = 'confirmed'
      and sessions.status = 'scheduled'
      and sessions.starts_at >= ${opensAt}
      and sessions.starts_at < ${closesAt}
  `);

  if (rows.length === 0) return [];
  const deliveries = await database
    .insert(notificationDeliveries)
    .values(rows.map((row) => ({
      personId: row.person_id,
      sessionId: row.session_id,
      bookingId: row.booking_id,
      idempotencyKey: `session_reminder:${row.booking_id}`,
      type: "session_reminder" as const,
    })))
    .onConflictDoNothing()
    .returning({ id: notificationDeliveries.id });
  return deliveries.map((delivery) => delivery.id);
}

/** Returns queued/retryable notification identifiers for the protected cron route. */
export async function listPendingNotificationDeliveryIds(limit = 100) {
  const safeLimit = Math.max(1, Math.min(limit, 100));
  return withDatabaseTransaction((transaction) => listPendingNotificationDeliveryIdsInTransaction(transaction, safeLimit));
}

export async function listPendingNotificationDeliveryIdsInTransaction(transaction: TransactionSql, limit: number) {
  const rows = await transaction<{ id: string }[]>`
    select id
    from notification_deliveries
    where status = 'queued'
      or (status = 'failed' and attempts < 5)
      or (status = 'sending' and last_attempted_at < now() - interval '10 minutes')
    order by created_at asc
    limit ${limit}
  `;
  return rows.map((row) => row.id);
}
