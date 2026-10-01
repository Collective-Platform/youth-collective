import "server-only";

import { and, asc, eq, gte, inArray, sql } from "drizzle-orm";

import { getDatabase } from "../client";
import { bookingStatusHistory, bookings, classes, courses, notificationDeliveries, people, sessionAuditEvents, sessions, waitlistEntries } from "../schema";
import { cancelBookingByStaff } from "./booking-commands";

export async function createCourseRecord(input: { name: string; description?: string; publicStatus?: "active" | "coming_next" | "hidden" }) {
  const [course] = await getDatabase().insert(courses).values({
    name: input.name,
    description: input.description || null,
    publicStatus: input.publicStatus ?? "hidden",
  }).returning({ id: courses.id });
  return course;
}

export async function updateCourseRecord(courseId: string, input: { name: string; description?: string; publicStatus: "active" | "coming_next" | "hidden" }) {
  await getDatabase().update(courses).set({
    name: input.name,
    description: input.description || null,
    publicStatus: input.publicStatus,
    updatedAt: new Date(),
  }).where(eq(courses.id, courseId));
}

export async function setCourseArchiveStatus(courseId: string, isArchived: boolean) {
  await getDatabase().update(courses).set({ isArchived, updatedAt: new Date() }).where(eq(courses.id, courseId));
}

export async function updateClassRecord(
  classId: string,
  input: { name: string; description?: string; audience?: string; isArchived?: boolean },
) {
  await getDatabase()
    .update(classes)
    .set({
      name: input.name,
      description: input.description || null,
      audience: input.audience || null,
      ...(input.isArchived === undefined ? {} : { isArchived: input.isArchived }),
      updatedAt: new Date(),
    })
    .where(eq(classes.id, classId));
}

export async function setClassArchiveStatus(classId: string, isArchived: boolean) {
  await getDatabase()
    .update(classes)
    .set({ isArchived, updatedAt: new Date() })
    .where(eq(classes.id, classId));
}

/** Applies one location to every upcoming scheduled Session for a Class. */
export async function setUpcomingSessionLocationsForClass(classId: string, location: string) {
  await getDatabase()
    .update(sessions)
    .set({ location: location || null, updatedAt: new Date() })
    .where(and(eq(sessions.classId, classId), eq(sessions.status, "scheduled"), gte(sessions.startsAt, new Date())));
}

export async function createSessionRecords(input: {
  classId?: string;
  newClass: { courseId?: string; name: string; description: string; audience: string } | null;
  newCourse?: { name: string; description: string } | null;
  occurrences: Array<{ startsAt: Date; endsAt: Date }>;
  capacity: number;
  location: string;
  autoLabel: boolean;
}) {
  return getDatabase().transaction(async (transaction) => {
    const courseId = input.newCourse
      ? (await transaction.insert(courses).values(input.newCourse).returning({ id: courses.id }))[0]?.id
      : input.newClass?.courseId;
    if (input.newClass && !courseId) throw new Error("Course not found.");
    const classId = input.newClass
      ? (await transaction
        .insert(classes)
        .values({ ...input.newClass, courseId: courseId! })
        .returning({ id: classes.id }))[0]?.id
      : input.classId;
    if (!classId) throw new Error("Class not found.");

    if (!input.newClass) {
      const [classRecord] = await transaction
        .select({ id: classes.id })
        .from(classes)
        .where(eq(classes.id, classId))
        .limit(1);
      if (!classRecord) throw new Error("Class not found.");
    }

    const recurrenceGroupId = input.autoLabel ? crypto.randomUUID() : null;
    const created = await transaction
      .insert(sessions)
      .values(input.occurrences.map((occurrence) => ({
        classId,
        startsAt: occurrence.startsAt,
        endsAt: occurrence.endsAt,
        capacity: input.capacity,
        location: input.location || null,
        recurrenceGroupId,
        checkInOpensAt: new Date(occurrence.startsAt.getTime() - 30 * 60 * 1000),
        checkInClosesAt: new Date(occurrence.startsAt.getTime() + 30 * 60 * 1000),
      })))
      .returning({ id: sessions.id });
    return { recurrenceGroupId, count: created.length };
  });
}

export async function updateSessionRecord(
  sessionId: string,
  input: {
    startsAt: Date;
    endsAt: Date;
    capacity: number;
    location: string;
    displayName: string;
    status: "scheduled" | "cancelled";
    cancellationReason?: string;
    checkInOpensAt?: Date;
    checkInClosesAt?: Date;
  },
  changedByUserAccountId: string | null = null,
) {
  return getDatabase().transaction(async (transaction) => {
    const [existing] = await transaction
      .select({ status: sessions.status, attendanceFinalizedAt: sessions.attendanceFinalizedAt })
      .from(sessions)
      .where(eq(sessions.id, sessionId))
      .for("update")
      .limit(1);
    if (!existing) throw new Error("Session not found.");
    if (existing.attendanceFinalizedAt) throw new Error("Finalized attendance must be reopened before editing this Session.");
    if (existing.status === "cancelled" && input.status === "scheduled") {
      throw new Error("Cancelled Sessions cannot be restored. Create a replacement Session instead.");
    }

    const confirmedBookings = await transaction
      .select({ id: bookings.id })
      .from(bookings)
      .where(and(eq(bookings.sessionId, sessionId), sql`${bookings.status} in ('confirmed', 'attended')`));
    if (input.capacity < confirmedBookings.length) {
      throw new Error("Capacity cannot be lower than the number of confirmed Bookings.");
    }

    await transaction
      .update(sessions)
      .set({
        startsAt: input.startsAt,
        endsAt: input.endsAt,
        capacity: input.capacity,
        location: input.location || null,
        displayName: input.displayName || null,
        status: input.status,
        cancellationReason: input.status === "cancelled" ? input.cancellationReason || "Cancelled by staff" : null,
        checkInOpensAt: input.checkInOpensAt ?? null,
        checkInClosesAt: input.checkInClosesAt ?? null,
        updatedAt: new Date(),
      })
      .where(eq(sessions.id, sessionId));

    if (changedByUserAccountId) {
      const cancelled = existing.status !== "cancelled" && input.status === "cancelled";
      await transaction.insert(sessionAuditEvents).values({
        sessionId,
        actorUserAccountId: changedByUserAccountId,
        type: cancelled ? "session_cancelled" : "session_updated",
        reason: cancelled ? input.cancellationReason || "Cancelled by staff" : "Session details updated",
        details: `status:${existing.status}->${input.status};capacity:${input.capacity}`,
      });
    }

    if (existing.status === "cancelled" || input.status !== "cancelled") return [];

    const bookingRecipients = await transaction
      .select({ personId: bookings.personId, bookingId: bookings.id })
      .from(bookings)
      .where(and(eq(bookings.sessionId, sessionId), eq(bookings.status, "confirmed")));
    const waitlistRecipients = await transaction
      .select({ personId: waitlistEntries.personId })
      .from(waitlistEntries)
      .where(and(eq(waitlistEntries.sessionId, sessionId), eq(waitlistEntries.status, "waiting")));
    if (bookingRecipients.length === 0 && waitlistRecipients.length === 0) return [];

    if (bookingRecipients.length > 0) {
      await transaction
        .update(bookings)
        .set({ status: "cancelled", statusChangedAt: new Date(), updatedAt: new Date() })
        .where(and(eq(bookings.sessionId, sessionId), eq(bookings.status, "confirmed")));
      await transaction.insert(bookingStatusHistory).values(bookingRecipients.map((recipient) => ({
        bookingId: recipient.bookingId,
        previousStatus: "confirmed" as const,
        nextStatus: "cancelled" as const,
        changedByUserAccountId,
        reason: "session_cancellation",
      })));
    }
    if (waitlistRecipients.length > 0) {
      await transaction
        .update(waitlistEntries)
        .set({ status: "cancelled", updatedAt: new Date() })
        .where(and(eq(waitlistEntries.sessionId, sessionId), eq(waitlistEntries.status, "waiting")));
    }

    const deliveries = await transaction
      .insert(notificationDeliveries)
      .values([
        ...bookingRecipients.map((recipient) => ({
          personId: recipient.personId,
          sessionId,
          bookingId: recipient.bookingId,
          idempotencyKey: crypto.randomUUID(),
          type: "session_cancellation" as const,
        })),
        ...waitlistRecipients.map((recipient) => ({
          personId: recipient.personId,
          sessionId,
          idempotencyKey: crypto.randomUUID(),
          type: "session_cancellation" as const,
        })),
      ])
      .onConflictDoNothing()
      .returning({ id: notificationDeliveries.id });
    return deliveries.map((delivery) => delivery.id);
  });
}

export async function finalizeAttendanceRecord(sessionId: string, changedByUserAccountId: string | null, now = new Date()) {
  return getDatabase().transaction(async (transaction) => {
    const [session] = await transaction
      .select({
        status: sessions.status,
        endsAt: sessions.endsAt,
        attendanceFinalizedAt: sessions.attendanceFinalizedAt,
      })
      .from(sessions)
      .where(eq(sessions.id, sessionId))
      .for("update")
      .limit(1);
    if (!session) throw new Error("Session not found.");
    if (session.status !== "scheduled") throw new Error("Cancelled Sessions cannot be finalized.");
    if (session.endsAt > now) throw new Error("Attendance can only be finalized after the Session ends.");
    if (session.attendanceFinalizedAt) return 0;

    const changed = await transaction
      .update(bookings)
      .set({ status: "no_show", statusChangedAt: now, updatedAt: now })
      .where(and(eq(bookings.sessionId, sessionId), eq(bookings.status, "confirmed")))
      .returning({ id: bookings.id });

    if (changed.length > 0) {
      await transaction.insert(bookingStatusHistory).values(
        changed.map((booking) => ({
          bookingId: booking.id,
          previousStatus: "confirmed" as const,
          nextStatus: "no_show" as const,
          changedByUserAccountId,
          reason: "staff_finalisation",
        })),
      );
    }

    await transaction
      .update(sessions)
      .set({
        attendanceFinalizedAt: now,
        attendanceFinalizedByUserAccountId: changedByUserAccountId,
        updatedAt: now,
      })
      .where(eq(sessions.id, sessionId));

    if (changedByUserAccountId) {
      await transaction.insert(sessionAuditEvents).values({
        sessionId,
        actorUserAccountId: changedByUserAccountId,
        type: "attendance_finalized",
        reason: "Attendance finalized by staff",
        details: `${changed.length} expected Booking${changed.length === 1 ? "" : "s"} marked no-show`,
      });
    }

    return changed.length;
  });
}


export async function setBookingStatusByStaff(
  bookingId: string,
  nextStatus: "confirmed" | "cancelled" | "attended" | "no_show",
  changedByUserAccountId: string | null,
  reason = "Staff correction",
) {
  if (nextStatus === "cancelled" && !reason) {
    throw new Error("Enter a reason for this correction.");
  }
  if (nextStatus === "cancelled") {
    if (!changedByUserAccountId) throw new Error("Staff identity is required to cancel a Booking.");
    const cancellation = await cancelBookingByStaff(bookingId, changedByUserAccountId, { reason });
    if (cancellation.kind === "cancelled") return cancellation;
  }

  return getDatabase().transaction(async (transaction) => {
    const [booking] = await transaction
      .select({ id: bookings.id, status: bookings.status, attendanceFinalizedAt: sessions.attendanceFinalizedAt })
      .from(bookings)
      .innerJoin(sessions, eq(bookings.sessionId, sessions.id))
      .where(eq(bookings.id, bookingId))
      .limit(1);

    if (!booking || booking.status === nextStatus) {
      return false;
    }
    if (booking.attendanceFinalizedAt) throw new Error("Reopen attendance before making corrections.");

    await transaction
      .update(bookings)
      .set({ status: nextStatus, statusChangedAt: new Date(), updatedAt: new Date() })
      .where(eq(bookings.id, bookingId));
    await transaction.insert(bookingStatusHistory).values({
      bookingId,
      previousStatus: booking.status,
      nextStatus,
      changedByUserAccountId,
      reason: `staff_adjustment: ${reason}`,
    });
    return true;
  });
}

async function assertMutableSession(transaction: Parameters<Parameters<ReturnType<typeof getDatabase>["transaction"]>[0]>[0], sessionId: string) {
  const [session] = await transaction
    .select({ id: sessions.id, classId: sessions.classId, status: sessions.status, attendanceFinalizedAt: sessions.attendanceFinalizedAt })
    .from(sessions)
    .where(eq(sessions.id, sessionId))
    .for("update")
    .limit(1);
  if (!session || session.status !== "scheduled") throw new Error("This Session is unavailable.");
  if (session.attendanceFinalizedAt) throw new Error("Reopen attendance before making changes.");
  return session;
}

/** Staff may check in an existing Person outside the self-check-in window until attendance is finalized. */
export async function checkInPersonByStaff(sessionId: string, personId: string, actorUserAccountId: string, reason: string) {
  return getDatabase().transaction(async (transaction) => {
    await assertMutableSession(transaction, sessionId);
    const [existing] = await transaction.select({ id: bookings.id, status: bookings.status }).from(bookings).where(and(eq(bookings.sessionId, sessionId), eq(bookings.personId, personId))).for("update").limit(1);
    if (existing?.status === "attended") return existing.id;
    const previousStatus = existing?.status ?? null;
    const booking = existing
      ? (await transaction.update(bookings).set({ status: "attended", statusChangedAt: new Date(), updatedAt: new Date() }).where(eq(bookings.id, existing.id)).returning({ id: bookings.id }))[0]
      : (await transaction.insert(bookings).values({ sessionId, personId, status: "attended" }).returning({ id: bookings.id }))[0];
    await transaction.insert(bookingStatusHistory).values({ bookingId: booking.id, previousStatus, nextStatus: "attended", changedByUserAccountId: actorUserAccountId, reason: `staff_walk_in: ${reason}` });
    await transaction.insert(sessionAuditEvents).values({ sessionId, actorUserAccountId, type: "staff_check_in", reason, details: `person:${personId}` });
    return booking.id;
  });
}

/** Creates a minimal Person record and immediately checks them in as a staff-recorded walk-in. */
export async function createWalkInRecord(sessionId: string, input: { name: string; mobile: string; reason: string }, actorUserAccountId: string) {
  return getDatabase().transaction(async (transaction) => {
    await assertMutableSession(transaction, sessionId);
    const [person] = await transaction.insert(people).values({ name: input.name, mobile: input.mobile }).returning({ id: people.id });
    const [booking] = await transaction.insert(bookings).values({ sessionId, personId: person.id, status: "attended" }).returning({ id: bookings.id });
    await transaction.insert(bookingStatusHistory).values({ bookingId: booking.id, previousStatus: null, nextStatus: "attended", changedByUserAccountId: actorUserAccountId, reason: `staff_walk_in: ${input.reason}` });
    await transaction.insert(sessionAuditEvents).values({ sessionId, actorUserAccountId, type: "walk_in_created", reason: input.reason, details: `person:${person.id}` });
    return person.id;
  });
}

export async function removeWaitlistEntryByStaff(entryId: string, actorUserAccountId: string, reason: string) {
  return getDatabase().transaction(async (transaction) => {
    const [entry] = await transaction.select({ id: waitlistEntries.id, sessionId: waitlistEntries.sessionId, personId: waitlistEntries.personId }).from(waitlistEntries).where(and(eq(waitlistEntries.id, entryId), eq(waitlistEntries.status, "waiting"))).for("update").limit(1);
    if (!entry) throw new Error("This Waitlist entry is no longer active.");
    await transaction.update(waitlistEntries).set({ status: "cancelled", updatedAt: new Date() }).where(eq(waitlistEntries.id, entry.id));
    await transaction.insert(sessionAuditEvents).values({ sessionId: entry.sessionId, actorUserAccountId, type: "waitlist_removed", reason, details: `person:${entry.personId}` });
  });
}

/** Promotes a selected waiter only when confirmed capacity remains. */
export async function promoteWaitlistEntryByStaff(entryId: string, actorUserAccountId: string, reason: string) {
  return getDatabase().transaction(async (transaction) => {
    const [entry] = await transaction.select({ id: waitlistEntries.id, sessionId: waitlistEntries.sessionId, personId: waitlistEntries.personId }).from(waitlistEntries).where(and(eq(waitlistEntries.id, entryId), eq(waitlistEntries.status, "waiting"))).for("update").limit(1);
    if (!entry) throw new Error("This Waitlist entry is no longer active.");
    const [session] = await transaction.select({ capacity: sessions.capacity, status: sessions.status, startsAt: sessions.startsAt, attendanceFinalizedAt: sessions.attendanceFinalizedAt }).from(sessions).where(eq(sessions.id, entry.sessionId)).for("update").limit(1);
    if (!session || session.status !== "scheduled" || session.startsAt <= new Date() || session.attendanceFinalizedAt) throw new Error("This Session cannot accept a promotion.");
    const [{ count: occupied }] = await transaction.select({ count: sql<number>`count(*)::integer` }).from(bookings).where(and(eq(bookings.sessionId, entry.sessionId), inArray(bookings.status, ["confirmed", "attended"])));
    if (occupied >= session.capacity) throw new Error("No confirmed capacity is available.");
    const [existing] = await transaction.select({ id: bookings.id, status: bookings.status }).from(bookings).where(and(eq(bookings.sessionId, entry.sessionId), eq(bookings.personId, entry.personId))).for("update").limit(1);
    if (existing && existing.status !== "cancelled" && existing.status !== "no_show") throw new Error("This Person already has an active Booking.");
    const booking = existing
      ? (await transaction.update(bookings).set({ status: "confirmed", statusChangedAt: new Date(), updatedAt: new Date() }).where(eq(bookings.id, existing.id)).returning({ id: bookings.id }))[0]
      : (await transaction.insert(bookings).values({ sessionId: entry.sessionId, personId: entry.personId, status: "confirmed" }).returning({ id: bookings.id }))[0];
    await transaction.update(waitlistEntries).set({ status: "promoted", promotedAt: new Date(), updatedAt: new Date() }).where(eq(waitlistEntries.id, entry.id));
    await transaction.insert(bookingStatusHistory).values({ bookingId: booking.id, previousStatus: existing?.status ?? null, nextStatus: "confirmed", changedByUserAccountId: actorUserAccountId, reason: `staff_waitlist_promotion: ${reason}` });
    await transaction.insert(sessionAuditEvents).values({ sessionId: entry.sessionId, actorUserAccountId, type: "waitlist_promoted", reason, details: `person:${entry.personId}` });
    const [delivery] = await transaction.insert(notificationDeliveries).values({ personId: entry.personId, sessionId: entry.sessionId, bookingId: booking.id, idempotencyKey: crypto.randomUUID(), type: "waitlist_promotion" }).returning({ id: notificationDeliveries.id });
    return delivery?.id ?? null;
  });
}

export async function reopenAttendanceRecord(sessionId: string, actorUserAccountId: string, reason: string) {
  return getDatabase().transaction(async (transaction) => {
    const [session] = await transaction.select({ finalizedAt: sessions.attendanceFinalizedAt }).from(sessions).where(eq(sessions.id, sessionId)).for("update").limit(1);
    if (!session?.finalizedAt) throw new Error("Attendance is not finalized.");
    await transaction.update(sessions).set({ attendanceFinalizedAt: null, attendanceFinalizedByUserAccountId: null, updatedAt: new Date() }).where(eq(sessions.id, sessionId));
    await transaction.insert(sessionAuditEvents).values({ sessionId, actorUserAccountId, type: "attendance_reopened", reason });
  });
}

export async function retryFailedSessionNotifications(sessionId: string, actorUserAccountId: string) {
  return getDatabase().transaction(async (transaction) => {
    const deliveries = await transaction.update(notificationDeliveries).set({ status: "queued", failedAt: null, failureReason: null, updatedAt: new Date() }).where(and(eq(notificationDeliveries.sessionId, sessionId), eq(notificationDeliveries.status, "failed"))).returning({ id: notificationDeliveries.id });
    if (deliveries.length > 0) {
      await transaction.insert(sessionAuditEvents).values({
        sessionId,
        actorUserAccountId,
        type: "notifications_retried",
        reason: "Failed notifications queued for retry",
        details: `${deliveries.length} notification${deliveries.length === 1 ? "" : "s"} requeued`,
      });
    }
    return deliveries;
  });
}

/** Atomically moves a confirmed Booking and fills the released place from the source Waitlist. */
export async function transferBookingRecord(bookingId: string, targetSessionId: string, actorUserAccountId: string, reason: string) {
  return getDatabase().transaction(async (transaction) => {
    const [sourceBooking] = await transaction
      .select({ id: bookings.id, personId: bookings.personId, sessionId: bookings.sessionId, status: bookings.status, classId: sessions.classId, sessionStatus: sessions.status, startsAt: sessions.startsAt, attendanceFinalizedAt: sessions.attendanceFinalizedAt })
      .from(bookings)
      .innerJoin(sessions, eq(bookings.sessionId, sessions.id))
      .where(eq(bookings.id, bookingId))
      .for("update")
      .limit(1);
    if (!sourceBooking || sourceBooking.status !== "confirmed") throw new Error("Only an expected Booking can be transferred.");
    if (sourceBooking.sessionStatus !== "scheduled" || sourceBooking.startsAt <= new Date() || sourceBooking.attendanceFinalizedAt) throw new Error("Only an upcoming Session Booking can be transferred.");
    if (sourceBooking.sessionId === targetSessionId) throw new Error("Choose a different Session.");

    const [target] = await transaction.select({ id: sessions.id, classId: sessions.classId, capacity: sessions.capacity, status: sessions.status, startsAt: sessions.startsAt, attendanceFinalizedAt: sessions.attendanceFinalizedAt }).from(sessions).where(eq(sessions.id, targetSessionId)).for("update").limit(1);
    if (!target || target.classId !== sourceBooking.classId || target.status !== "scheduled" || target.startsAt <= new Date() || target.attendanceFinalizedAt) throw new Error("Choose an upcoming Session in the same Class.");
    const [{ count: occupied }] = await transaction.select({ count: sql<number>`count(*)::integer` }).from(bookings).where(and(eq(bookings.sessionId, targetSessionId), inArray(bookings.status, ["confirmed", "attended"])));
    if (occupied >= target.capacity) throw new Error("The target Session is full.");
    const [existingTargetBooking] = await transaction.select({ id: bookings.id, status: bookings.status }).from(bookings).where(and(eq(bookings.personId, sourceBooking.personId), eq(bookings.sessionId, targetSessionId))).for("update").limit(1);
    if (existingTargetBooking && existingTargetBooking.status !== "cancelled" && existingTargetBooking.status !== "no_show") throw new Error("This Person already has an active Booking in the target Session.");

    const now = new Date();
    await transaction.update(bookings).set({ status: "cancelled", statusChangedAt: now, updatedAt: now }).where(eq(bookings.id, sourceBooking.id));
    await transaction.insert(bookingStatusHistory).values({ bookingId: sourceBooking.id, previousStatus: "confirmed", nextStatus: "cancelled", changedByUserAccountId: actorUserAccountId, reason: `staff_transfer_out: ${reason}` });
    const targetBooking = existingTargetBooking
      ? (await transaction.update(bookings).set({ status: "confirmed", statusChangedAt: now, updatedAt: now }).where(eq(bookings.id, existingTargetBooking.id)).returning({ id: bookings.id }))[0]
      : (await transaction.insert(bookings).values({ personId: sourceBooking.personId, sessionId: targetSessionId, status: "confirmed" }).returning({ id: bookings.id }))[0];
    await transaction.insert(bookingStatusHistory).values({ bookingId: targetBooking.id, previousStatus: existingTargetBooking?.status ?? null, nextStatus: "confirmed", changedByUserAccountId: actorUserAccountId, reason: `staff_transfer_in: ${reason}` });
    await transaction.insert(sessionAuditEvents).values([
      { sessionId: sourceBooking.sessionId, actorUserAccountId, type: "booking_transferred_out", reason, details: `booking:${sourceBooking.id};target:${targetSessionId}` },
      { sessionId: targetSessionId, actorUserAccountId, type: "booking_transferred_in", reason, details: `booking:${targetBooking.id};source:${sourceBooking.sessionId}` },
    ]);

    const deliveries: string[] = [];
    const [targetDelivery] = await transaction.insert(notificationDeliveries).values({ personId: sourceBooking.personId, sessionId: targetSessionId, bookingId: targetBooking.id, idempotencyKey: crypto.randomUUID(), type: "booking_confirmation" }).returning({ id: notificationDeliveries.id });
    if (targetDelivery) deliveries.push(targetDelivery.id);

    const [waiter] = await transaction.select({ id: waitlistEntries.id, personId: waitlistEntries.personId }).from(waitlistEntries).where(and(eq(waitlistEntries.sessionId, sourceBooking.sessionId), eq(waitlistEntries.status, "waiting"))).orderBy(asc(waitlistEntries.createdAt), asc(waitlistEntries.id)).for("update").limit(1);
    if (waiter) {
      await transaction.update(waitlistEntries).set({ status: "promoted", promotedAt: now, updatedAt: now }).where(eq(waitlistEntries.id, waiter.id));
      const [previous] = await transaction.select({ id: bookings.id, status: bookings.status }).from(bookings).where(and(eq(bookings.personId, waiter.personId), eq(bookings.sessionId, sourceBooking.sessionId))).for("update").limit(1);
      const promoted = previous
        ? (await transaction.update(bookings).set({ status: "confirmed", statusChangedAt: now, updatedAt: now }).where(eq(bookings.id, previous.id)).returning({ id: bookings.id }))[0]
        : (await transaction.insert(bookings).values({ personId: waiter.personId, sessionId: sourceBooking.sessionId, status: "confirmed" }).returning({ id: bookings.id }))[0];
      await transaction.insert(bookingStatusHistory).values({ bookingId: promoted.id, previousStatus: previous?.status ?? null, nextStatus: "confirmed", changedByUserAccountId: actorUserAccountId, reason: "waitlist_promotion_after_transfer" });
      const [promotionDelivery] = await transaction.insert(notificationDeliveries).values({ personId: waiter.personId, sessionId: sourceBooking.sessionId, bookingId: promoted.id, idempotencyKey: crypto.randomUUID(), type: "waitlist_promotion" }).returning({ id: notificationDeliveries.id });
      if (promotionDelivery) deliveries.push(promotionDelivery.id);
    }
    return deliveries;
  });
}
