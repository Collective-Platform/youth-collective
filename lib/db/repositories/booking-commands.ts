import "server-only";

import type { TransactionSql } from "postgres";

import { withDatabaseTransaction } from "../repository.ts";

type LockedSession = {
  id: string;
  capacity: number;
  starts_at: Date;
  status: "scheduled" | "cancelled";
};

type ExistingBooking = {
  id: string;
  status: "confirmed" | "cancelled" | "attended" | "no_show";
};

type ExistingWaitlistEntry = {
  id: string;
  status: "waiting" | "promoted" | "cancelled";
};

type LockedCancellationBooking = ExistingBooking & {
  person_id: string;
  session_id: string;
  starts_at: Date;
  session_status: "scheduled" | "cancelled";
};

type IdRow = { id: string };

type NotificationType =
  | "booking_confirmation"
  | "waitlist_confirmation"
  | "waitlist_promotion"
  | "booking_cancellation";

async function queueNotification(
  transaction: TransactionSql,
  input: { personId: string; sessionId: string; bookingId?: string; type: NotificationType },
) {
  const [delivery] = await transaction<IdRow[]>`
    insert into notification_deliveries (person_id, session_id, booking_id, idempotency_key, type)
    values (${input.personId}, ${input.sessionId}, ${input.bookingId ?? null}, ${crypto.randomUUID()}, ${input.type})
    on conflict (idempotency_key) do nothing
    returning id
  `;
  return delivery?.id ?? null;
}

export type ReserveSessionResult =
  | { kind: "confirmed"; bookingId: string; notificationDeliveryId: string | null }
  | { kind: "waitlisted"; waitlistEntryId: string; notificationDeliveryId: string | null }
  | { kind: "already_booked"; bookingId: string }
  | { kind: "already_waitlisted"; waitlistEntryId: string }
  | { kind: "session_unavailable" };

export type CancelBookingResult =
  | {
      kind: "cancelled";
      notificationDeliveryId: string | null;
      promotedPersonId: string | null;
      promotionNotificationDeliveryId: string | null;
    }
  | { kind: "booking_unavailable" };

export type LeaveWaitlistResult = { kind: "left_waitlist" } | { kind: "waitlist_unavailable" };

type CommandOptions = {
  now?: Date;
  changedByUserAccountId?: string;
};

/**
 * Atomically reserves a confirmed place or creates a Waitlist entry. Locking
 * the Session row serializes capacity decisions for that Session.
 */
export async function reserveSession(
  personId: string,
  sessionId: string,
  options: CommandOptions = {},
): Promise<ReserveSessionResult> {
  return withDatabaseTransaction((transaction) => reserveSessionInTransaction(transaction, personId, sessionId, options));
}

/** The transaction-aware seam keeps the booking decision testable without a live database. */
export async function reserveSessionInTransaction(
  transaction: TransactionSql,
  personId: string,
  sessionId: string,
  options: CommandOptions = {},
): Promise<ReserveSessionResult> {
  const now = options.now ?? new Date();

  const [session] = await transaction<LockedSession[]>`
      select id, capacity, starts_at, status
      from sessions
      where id = ${sessionId}
      for update
    `;

  if (!session || session.status !== "scheduled" || session.starts_at <= now) {
    return { kind: "session_unavailable" };
  }

  const [existingBooking] = await transaction<ExistingBooking[]>`
      select id, status
      from bookings
      where person_id = ${personId} and session_id = ${sessionId}
      limit 1
    `;

  if (existingBooking && existingBooking.status !== "cancelled") {
    return { kind: "already_booked", bookingId: existingBooking.id };
  }

  const [existingWaitlistEntry] = await transaction<ExistingWaitlistEntry[]>`
      select id, status
      from waitlist_entries
      where person_id = ${personId} and session_id = ${sessionId}
      limit 1
    `;

  if (existingWaitlistEntry?.status === "waiting") {
    return { kind: "already_waitlisted", waitlistEntryId: existingWaitlistEntry.id };
  }

  const [{ confirmed_count: confirmedCount }] = await transaction<{ confirmed_count: number }[]>`
      select count(*)::integer as confirmed_count
      from bookings
      where session_id = ${sessionId} and status in ('confirmed', 'attended')
    `;

  if (confirmedCount >= session.capacity) {
    const waitlistEntry = existingWaitlistEntry
      ? await transaction<IdRow[]>`
          update waitlist_entries
          set status = 'waiting', promoted_at = null, updated_at = now()
          where id = ${existingWaitlistEntry.id}
          returning id
        `
      : await transaction<IdRow[]>`
          insert into waitlist_entries (person_id, session_id, status)
          values (${personId}, ${sessionId}, 'waiting')
          returning id
        `;

    const notificationDeliveryId = await queueNotification(transaction, {
      personId,
      sessionId,
      type: "waitlist_confirmation",
    });

    return { kind: "waitlisted", waitlistEntryId: waitlistEntry[0].id, notificationDeliveryId };
  }

  if (existingBooking?.status === "cancelled") {
    await transaction`
        update bookings
        set status = 'confirmed', status_changed_at = now(), updated_at = now()
        where id = ${existingBooking.id}
      `;
    await transaction`
        insert into booking_status_history (booking_id, previous_status, next_status, changed_by_user_account_id, reason)
        values (${existingBooking.id}, 'cancelled', 'confirmed', ${options.changedByUserAccountId ?? null}, 'member_rebooking')
      `;

    const notificationDeliveryId = await queueNotification(transaction, {
      personId,
      sessionId,
      bookingId: existingBooking.id,
      type: "booking_confirmation",
    });

    return { kind: "confirmed", bookingId: existingBooking.id, notificationDeliveryId };
  }

  const [booking] = await transaction<IdRow[]>`
      insert into bookings (person_id, session_id, status)
      values (${personId}, ${sessionId}, 'confirmed')
      returning id
    `;

  await transaction`
      insert into booking_status_history (booking_id, previous_status, next_status, changed_by_user_account_id, reason)
      values (${booking.id}, null, 'confirmed', ${options.changedByUserAccountId ?? null}, 'member_booking')
    `;

  const notificationDeliveryId = await queueNotification(transaction, {
    personId,
    sessionId,
    bookingId: booking.id,
    type: "booking_confirmation",
  });

  return { kind: "confirmed", bookingId: booking.id, notificationDeliveryId };
}

/**
 * Cancels a future confirmed Booking and promotes the earliest waiting Person
 * in the same transaction. The promoted Person is returned for notification.
 */
export async function cancelBooking(
  personId: string,
  bookingId: string,
  options: CommandOptions = {},
): Promise<CancelBookingResult> {
  return withDatabaseTransaction((transaction) => cancelBookingInTransaction(transaction, personId, bookingId, options));
}

/** The transaction-aware seam covers cancellation and fair Waitlist promotion. */
export async function cancelBookingInTransaction(
  transaction: TransactionSql,
  personId: string,
  bookingId: string,
  options: CommandOptions = {},
): Promise<CancelBookingResult> {
  const now = options.now ?? new Date();

  const [booking] = await transaction<
    Array<ExistingBooking & { session_id: string; starts_at: Date; session_status: "scheduled" | "cancelled" }>
  >`
      select bookings.id, bookings.status, bookings.session_id, sessions.starts_at, sessions.status as session_status
      from bookings
      inner join sessions on sessions.id = bookings.session_id
      where bookings.id = ${bookingId} and bookings.person_id = ${personId}
      for update
    `;

  if (
    !booking ||
    booking.status !== "confirmed" ||
    booking.session_status !== "scheduled" ||
    booking.starts_at <= now
  ) {
    return { kind: "booking_unavailable" };
  }

  return cancelLockedBookingInTransaction(
    transaction,
    { ...booking, person_id: personId },
    options.changedByUserAccountId ?? null,
    "member_cancellation",
  );
}

/** Removes only the caller's active entry from a future scheduled Session. */
export async function leaveWaitlist(
  personId: string,
  waitlistEntryId: string,
  options: Pick<CommandOptions, "now"> = {},
): Promise<LeaveWaitlistResult> {
  return withDatabaseTransaction((transaction) =>
    leaveWaitlistInTransaction(transaction, personId, waitlistEntryId, options),
  );
}

/** The transaction-aware seam verifies ownership and Session availability atomically. */
export async function leaveWaitlistInTransaction(
  transaction: TransactionSql,
  personId: string,
  waitlistEntryId: string,
  options: Pick<CommandOptions, "now"> = {},
): Promise<LeaveWaitlistResult> {
  const now = options.now ?? new Date();
  const [entry] = await transaction<IdRow[]>`
    select waitlist_entries.id
    from waitlist_entries
    inner join sessions on sessions.id = waitlist_entries.session_id
    where waitlist_entries.id = ${waitlistEntryId}
      and waitlist_entries.person_id = ${personId}
      and waitlist_entries.status = 'waiting'
      and sessions.status = 'scheduled'
      and sessions.starts_at > ${now}
    for update
  `;

  if (!entry) return { kind: "waitlist_unavailable" };

  await transaction`
    update waitlist_entries
    set status = 'cancelled', updated_at = now()
    where id = ${entry.id}
  `;
  return { kind: "left_waitlist" };
}

/** Staff cancellation uses the same promotion and notification rules as member cancellation. */
export async function cancelBookingByStaff(
  bookingId: string,
  changedByUserAccountId: string,
  options: Pick<CommandOptions, "now"> & { reason?: string } = {},
): Promise<CancelBookingResult> {
  return withDatabaseTransaction((transaction) => cancelBookingByStaffInTransaction(transaction, bookingId, changedByUserAccountId, options));
}

export async function cancelBookingByStaffInTransaction(
  transaction: TransactionSql,
  bookingId: string,
  changedByUserAccountId: string,
  options: Pick<CommandOptions, "now"> & { reason?: string } = {},
): Promise<CancelBookingResult> {
  const now = options.now ?? new Date();
  const [booking] = await transaction<LockedCancellationBooking[]>`
    select bookings.id, bookings.person_id, bookings.status, bookings.session_id,
      sessions.starts_at, sessions.status as session_status
    from bookings
    inner join sessions on sessions.id = bookings.session_id
    where bookings.id = ${bookingId}
    for update
  `;

  if (
    !booking ||
    booking.status !== "confirmed" ||
    booking.session_status !== "scheduled" ||
    booking.starts_at <= now
  ) {
    return { kind: "booking_unavailable" };
  }

  return cancelLockedBookingInTransaction(
    transaction,
    booking,
    changedByUserAccountId,
    options.reason ? `staff_cancellation: ${options.reason}` : "staff_cancellation",
  );
}

async function cancelLockedBookingInTransaction(
  transaction: TransactionSql,
  booking: LockedCancellationBooking,
  changedByUserAccountId: string | null,
  reason: string,
): Promise<CancelBookingResult> {
  await transaction`
      update bookings
      set status = 'cancelled', status_changed_at = now(), updated_at = now()
      where id = ${booking.id}
    `;
  await transaction`
      insert into booking_status_history (booking_id, previous_status, next_status, changed_by_user_account_id, reason)
      values (${booking.id}, 'confirmed', 'cancelled', ${changedByUserAccountId}, ${reason})
    `;
  const notificationDeliveryId = await queueNotification(transaction, {
    personId: booking.person_id,
    sessionId: booking.session_id,
    bookingId: booking.id,
    type: "booking_cancellation",
  });

  const [waitlistEntry] = await transaction<Array<IdRow & { person_id: string }>>`
      select id, person_id
      from waitlist_entries
      where session_id = ${booking.session_id} and status = 'waiting'
      order by created_at asc, id asc
      limit 1
      for update
    `;

  if (!waitlistEntry) {
    return {
      kind: "cancelled",
      notificationDeliveryId,
      promotedPersonId: null,
      promotionNotificationDeliveryId: null,
    };
  }

  await transaction`
      update waitlist_entries
      set status = 'promoted', promoted_at = now(), updated_at = now()
      where id = ${waitlistEntry.id}
    `;

  const [existingPromotedBooking] = await transaction<ExistingBooking[]>`
      select id, status
      from bookings
      where person_id = ${waitlistEntry.person_id} and session_id = ${booking.session_id}
      limit 1
    `;
  const [promotedBooking] = existingPromotedBooking
    ? await transaction<IdRow[]>`
        update bookings
        set status = 'confirmed', status_changed_at = now(), updated_at = now()
        where id = ${existingPromotedBooking.id}
        returning id
      `
    : await transaction<IdRow[]>`
        insert into bookings (person_id, session_id, status)
        values (${waitlistEntry.person_id}, ${booking.session_id}, 'confirmed')
        returning id
      `;
  await transaction`
      insert into booking_status_history (booking_id, previous_status, next_status, reason)
      values (${promotedBooking.id}, ${existingPromotedBooking?.status ?? null}, 'confirmed', 'waitlist_promotion')
    `;

  const promotionNotificationDeliveryId = await queueNotification(transaction, {
    personId: waitlistEntry.person_id,
    sessionId: booking.session_id,
    bookingId: promotedBooking.id,
    type: "waitlist_promotion",
  });

  return {
    kind: "cancelled",
    notificationDeliveryId,
    promotedPersonId: waitlistEntry.person_id,
    promotionNotificationDeliveryId,
  };
}
