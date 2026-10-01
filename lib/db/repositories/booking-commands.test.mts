import assert from "node:assert/strict";
import test from "node:test";

import type { TransactionSql } from "postgres";

import {
  cancelBookingByStaffInTransaction,
  cancelBookingInTransaction,
  leaveWaitlistInTransaction,
  reserveSessionInTransaction,
} from "./booking-commands.ts";

function createTransaction(responses: unknown[][]) {
  return (async () => responses.shift() ?? []) as unknown as TransactionSql;
}

test("a cancelled booking can be restored after a promoted waitlist entry", async () => {
  const result = await reserveSessionInTransaction(
    createTransaction([
      [{ id: "session-1", capacity: 30, starts_at: new Date("2030-01-01T12:00:00Z"), status: "scheduled" }],
      [{ id: "booking-1", status: "cancelled" }],
      [{ id: "waitlist-1", status: "promoted" }],
      [{ confirmed_count: 0 }],
      [],
      [],
      [],
    ]),
    "person-1",
    "session-1",
    { now: new Date("2029-01-01T12:00:00Z") },
  );

  assert.deepEqual(result, {
    kind: "confirmed",
    bookingId: "booking-1",
    notificationDeliveryId: null,
  });
});

test("a cancelled booking returns to the waitlist when a promoted session is full", async () => {
  const result = await reserveSessionInTransaction(
    createTransaction([
      [{ id: "session-1", capacity: 30, starts_at: new Date("2030-01-01T12:00:00Z"), status: "scheduled" }],
      [{ id: "booking-1", status: "cancelled" }],
      [{ id: "waitlist-1", status: "promoted" }],
      [{ confirmed_count: 30 }],
      [{ id: "waitlist-1" }],
      [],
    ]),
    "person-1",
    "session-1",
    { now: new Date("2029-01-01T12:00:00Z") },
  );

  assert.deepEqual(result, {
    kind: "waitlisted",
    waitlistEntryId: "waitlist-1",
    notificationDeliveryId: null,
  });
});

test("Waitlist promotion restores an existing cancelled Booking", async () => {
  const queries: string[] = [];
  const transaction = (async (strings: TemplateStringsArray) => {
    const query = strings.join("?").replace(/\s+/g, " ").trim();
    queries.push(query);

    if (query.includes("inner join sessions") && query.includes("for update")) {
      return [{
        id: "booking-cancelling",
        status: "confirmed",
        session_id: "session-1",
        starts_at: new Date("2030-01-01T12:00:00Z"),
        session_status: "scheduled",
      }];
    }
    if (query.includes("from waitlist_entries") && query.includes("for update")) {
      return [{ id: "waitlist-1", person_id: "person-waiting" }];
    }
    if (query.includes("from bookings") && query.includes("person_id") && !query.includes("inner join sessions")) {
      return [{ id: "booking-cancelled", status: "cancelled" }];
    }
    if (query.startsWith("update bookings") && query.includes("status = 'confirmed'")) {
      return [{ id: "booking-cancelled" }];
    }
    if (query.startsWith("insert into bookings")) {
      throw new Error("duplicate booking");
    }
    return [];
  }) as unknown as TransactionSql;

  const result = await cancelBookingInTransaction(
    transaction,
    "person-cancelling",
    "booking-cancelling",
    { now: new Date("2029-01-01T12:00:00Z") },
  );

  assert.deepEqual(result, {
    kind: "cancelled",
    notificationDeliveryId: null,
    promotedPersonId: "person-waiting",
    promotionNotificationDeliveryId: null,
  });
  assert.ok(queries.some((query) => query.startsWith("update bookings") && query.includes("status = 'confirmed'")));
  assert.ok(!queries.some((query) => query.startsWith("insert into bookings")));
});

test("staff cancellation uses the same atomic cancellation path", async () => {
  const substitutions: unknown[][] = [];
  const transaction = (async (strings: TemplateStringsArray, ...values: unknown[]) => {
    const query = strings.join("?").replace(/\s+/g, " ").trim();
    substitutions.push(values);
    if (query.includes("inner join sessions") && query.includes("for update")) {
      return [{
        id: "booking-1",
        person_id: "person-1",
        status: "confirmed",
        session_id: "session-1",
        starts_at: new Date("2030-01-01T12:00:00Z"),
        session_status: "scheduled",
      }];
    }
    return [];
  }) as unknown as TransactionSql;

  const result = await cancelBookingByStaffInTransaction(
    transaction,
    "booking-1",
    "staff-1",
    { now: new Date("2029-01-01T12:00:00Z"), reason: "Participant requested a different date" },
  );

  assert.deepEqual(result, {
    kind: "cancelled",
    notificationDeliveryId: null,
    promotedPersonId: null,
    promotionNotificationDeliveryId: null,
  });
  assert.ok(substitutions.some((values) => values.includes("staff-1") && values.includes("staff_cancellation: Participant requested a different date")));
});

test("a member can leave only their active future Waitlist entry", async () => {
  const queries: string[] = [];
  const transaction = (async (strings: TemplateStringsArray) => {
    const query = strings.join("?").replace(/\s+/g, " ").trim();
    queries.push(query);
    return query.startsWith("select waitlist_entries.id") ? [{ id: "waitlist-1" }] : [];
  }) as unknown as TransactionSql;

  const result = await leaveWaitlistInTransaction(transaction, "person-1", "waitlist-1", {
    now: new Date("2029-01-01T12:00:00Z"),
  });

  assert.deepEqual(result, { kind: "left_waitlist" });
  assert.ok(queries[0].includes("waitlist_entries.person_id = ?"));
  assert.ok(queries[0].includes("waitlist_entries.status = 'waiting'"));
  assert.ok(queries[0].includes("sessions.starts_at > ?"));
  assert.ok(queries.some((query) => query.startsWith("update waitlist_entries") && query.includes("status = 'cancelled'")));
});

test("an unavailable Waitlist entry is not changed", async () => {
  const queries: string[] = [];
  const transaction = (async (strings: TemplateStringsArray) => {
    queries.push(strings.join("?").replace(/\s+/g, " ").trim());
    return [];
  }) as unknown as TransactionSql;

  const result = await leaveWaitlistInTransaction(transaction, "person-1", "someone-elses-entry");

  assert.deepEqual(result, { kind: "waitlist_unavailable" });
  assert.equal(queries.length, 1);
});
