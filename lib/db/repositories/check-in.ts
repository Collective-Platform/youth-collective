import "server-only";

import { eq } from "drizzle-orm";
import type { TransactionSql } from "postgres";

import { withDatabaseTransaction } from "../repository.ts";
import { getDatabase } from "../client.ts";
import { classes, sessions } from "../schema.ts";
import { sessionDisplayName } from "./session-display-name.ts";

export type CheckInSession = {
  token: string;
  className: string;
  location: string | null;
  startsAt: Date;
  endsAt: Date;
  checkInOpensAt: Date | null;
  checkInClosesAt: Date | null;
  status: "scheduled" | "cancelled";
};

export type SelfCheckInResult =
  | { kind: "checked_in" }
  | { kind: "already_checked_in" }
  | { kind: "walk_in_confirmation_required"; cancelledBooking: boolean }
  | { kind: "window_closed" }
  | { kind: "booking_unavailable" }
  | { kind: "session_unavailable" };

export async function getSessionForCheckInToken(token: string): Promise<CheckInSession | null> {
  if (!process.env.DATABASE_URL) return null;

  const [session] = await getDatabase()
    .select({
      token: sessions.checkInToken,
      className: sessionDisplayName,
      location: sessions.location,
      startsAt: sessions.startsAt,
      endsAt: sessions.endsAt,
      checkInOpensAt: sessions.checkInOpensAt,
      checkInClosesAt: sessions.checkInClosesAt,
      status: sessions.status,
    })
    .from(sessions)
    .innerJoin(classes, eq(sessions.classId, classes.id))
    .where(eq(sessions.checkInToken, token))
    .limit(1);

  return session ?? null;
}

/**
 * Records the caller's attendance during the configured Session window.
 * Reservations observe capacity; intentional QR walk-ins do not.
 */
export async function selfCheckIn(personId: string, userAccountId: string, token: string, confirmWalkIn = false, now = new Date()): Promise<SelfCheckInResult> {
  return withDatabaseTransaction((transaction) => selfCheckInInTransaction(transaction, personId, userAccountId, token, confirmWalkIn, now));
}

export async function selfCheckInInTransaction(
  transaction: TransactionSql,
  personId: string,
  userAccountId: string,
  token: string,
  confirmWalkIn = false,
  now = new Date(),
): Promise<SelfCheckInResult> {
  const [session] = await transaction<
    Array<{ id: string; status: "scheduled" | "cancelled"; check_in_opens_at: Date | null; check_in_closes_at: Date | null; attendance_finalized_at: Date | null }>
  >`
      select id, status, check_in_opens_at, check_in_closes_at, attendance_finalized_at
      from sessions
      where check_in_token = ${token}
      for update
    `;

  if (!session || session.status !== "scheduled" || session.attendance_finalized_at) return { kind: "session_unavailable" };
  if (!session.check_in_opens_at || !session.check_in_closes_at || now < session.check_in_opens_at || now > session.check_in_closes_at) {
    return { kind: "window_closed" };
  }

  const [booking] = await transaction<Array<{ id: string; status: "confirmed" | "cancelled" | "attended" | "no_show" }>>`
      select id, status
      from bookings
      where session_id = ${session.id} and person_id = ${personId}
      for update
    `;

  if (!booking || booking.status === "cancelled") {
    if (!confirmWalkIn) return { kind: "walk_in_confirmation_required", cancelledBooking: booking?.status === "cancelled" };

    if (booking) {
      await transaction`
          update bookings
          set status = 'attended', status_changed_at = now(), updated_at = now()
          where id = ${booking.id}
        `;
      await transaction`
          insert into booking_status_history (booking_id, previous_status, next_status, changed_by_user_account_id, reason)
          values (${booking.id}, 'cancelled', 'attended', ${userAccountId}, 'walk_in_check_in')
        `;
    } else {
      const [walkIn] = await transaction<Array<{ id: string }>>`
          insert into bookings (person_id, session_id, status, status_changed_at)
          values (${personId}, ${session.id}, 'attended', now())
          returning id
        `;
      await transaction`
          insert into booking_status_history (booking_id, previous_status, next_status, changed_by_user_account_id, reason)
          values (${walkIn.id}, null, 'attended', ${userAccountId}, 'walk_in_check_in')
        `;
    }

    return { kind: "checked_in" };
  }
  if (booking.status === "attended") return { kind: "already_checked_in" };
  if (booking.status !== "confirmed") return { kind: "booking_unavailable" };

  await transaction`
      update bookings
      set status = 'attended', status_changed_at = now(), updated_at = now()
      where id = ${booking.id}
    `;
  await transaction`
      insert into booking_status_history (booking_id, previous_status, next_status, changed_by_user_account_id, reason)
      values (${booking.id}, 'confirmed', 'attended', ${userAccountId}, 'self_check_in')
    `;

  return { kind: "checked_in" };
}
