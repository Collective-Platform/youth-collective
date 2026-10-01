import "server-only";

import { and, asc, count, desc, eq, gt, inArray } from "drizzle-orm";
import { cache } from "react";

import { getDatabase } from "../client";
import { bookings, classes, courses, people, sessions, userAccounts, waitlistEntries } from "../schema";
import { sessionDisplayName } from "./session-display-name";

export type MemberBooking = {
  id: string;
  sessionId: string;
  classId: string;
  courseId: string;
  courseName: string;
  status: "confirmed" | "cancelled" | "attended" | "no_show";
  className: string;
  location: string | null;
  startsAt: Date;
  endsAt: Date;
  checkInToken: string;
  checkInOpensAt: Date | null;
  checkInClosesAt: Date | null;
};

export type MemberSeriesSession = {
  id: string;
  classId: string;
  className: string;
  seriesName: string;
  isArchived: boolean;
  location: string | null;
  startsAt: Date;
  endsAt: Date;
  availableSpaces: number;
};

export type MemberWaitlist = {
  id: string;
  sessionId: string;
  courseName: string;
  className: string;
  audience: string | null;
  location: string | null;
  startsAt: Date;
  endsAt: Date;
};

/** Lists a member's Booking history for their first-party login account. */
export const listBookingsForAuthSubject = cache(async (subject: string): Promise<MemberBooking[]> => {
  if (!process.env.DATABASE_URL) {
    return [];
  }

  return getDatabase()
    .select({
      id: bookings.id,
      sessionId: bookings.sessionId,
      classId: sessions.classId,
      courseId: courses.id,
      courseName: courses.name,
      status: bookings.status,
      className: sessionDisplayName,
      location: sessions.location,
      startsAt: sessions.startsAt,
      endsAt: sessions.endsAt,
      checkInToken: sessions.checkInToken,
      checkInOpensAt: sessions.checkInOpensAt,
      checkInClosesAt: sessions.checkInClosesAt,
    })
    .from(bookings)
    .innerJoin(people, eq(bookings.personId, people.id))
    .innerJoin(userAccounts, eq(userAccounts.personId, people.id))
    .innerJoin(sessions, eq(bookings.sessionId, sessions.id))
    .innerJoin(classes, eq(sessions.classId, classes.id))
    .innerJoin(courses, eq(classes.courseId, courses.id))
    .where(eq(userAccounts.id, subject))
    .orderBy(desc(sessions.startsAt));
});

/** Lists the member's active Waitlist entries for future scheduled Sessions. */
export const listWaitlistForAuthSubject = cache(async (subject: string): Promise<MemberWaitlist[]> => {
  if (!process.env.DATABASE_URL) return [];

  return getDatabase()
    .select({
      id: waitlistEntries.id,
      sessionId: waitlistEntries.sessionId,
      courseName: courses.name,
      className: sessionDisplayName,
      audience: classes.audience,
      location: sessions.location,
      startsAt: sessions.startsAt,
      endsAt: sessions.endsAt,
    })
    .from(waitlistEntries)
    .innerJoin(people, eq(waitlistEntries.personId, people.id))
    .innerJoin(userAccounts, eq(userAccounts.personId, people.id))
    .innerJoin(sessions, eq(waitlistEntries.sessionId, sessions.id))
    .innerJoin(classes, eq(sessions.classId, classes.id))
    .innerJoin(courses, eq(classes.courseId, courses.id))
    .where(
      and(
        eq(userAccounts.id, subject),
        eq(waitlistEntries.status, "waiting"),
        eq(sessions.status, "scheduled"),
        gt(sessions.startsAt, new Date()),
      ),
    )
    .orderBy(asc(sessions.startsAt));
});

/**
 * Lists every scheduled Session in the Classes a member has booked, including
 * future Sessions they have not yet reserved. This lets the member see the
 * complete shape of a Class series without exposing other members' data.
 */
export async function listSeriesSessionsForClassIds(classIds: string[]): Promise<MemberSeriesSession[]> {
  if (!process.env.DATABASE_URL || classIds.length === 0) {
    return [];
  }

  const rows = await getDatabase()
    .select({
      id: sessions.id,
      classId: sessions.classId,
      className: sessionDisplayName,
      seriesName: classes.name,
      isArchived: classes.isArchived,
      location: sessions.location,
      startsAt: sessions.startsAt,
      endsAt: sessions.endsAt,
      capacity: sessions.capacity,
      confirmedBookings: count(bookings.id),
    })
    .from(sessions)
    .innerJoin(classes, eq(sessions.classId, classes.id))
    .leftJoin(bookings, and(eq(bookings.sessionId, sessions.id), inArray(bookings.status, ["confirmed", "attended"])))
    .where(and(eq(sessions.status, "scheduled"), inArray(sessions.classId, classIds)))
    .groupBy(
      sessions.id,
      sessions.classId,
      sessions.recurrenceGroupId,
      classes.id,
      classes.name,
      sessions.location,
      sessions.startsAt,
      sessions.endsAt,
      sessions.capacity,
    )
    .orderBy(asc(sessions.startsAt));

  return rows.map((session) => ({
    id: session.id,
    classId: session.classId,
    className: session.className,
    seriesName: session.seriesName,
    isArchived: session.isArchived,
    location: session.location,
    startsAt: session.startsAt,
    endsAt: session.endsAt,
    availableSpaces: Math.max(0, session.capacity - session.confirmedBookings),
  }));
}
