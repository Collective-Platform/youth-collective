import "server-only";

import { and, asc, count, eq, gte, inArray } from "drizzle-orm";
import { cache } from "react";

import { getDatabase } from "../client";
import { bookings, classes, courses, sessions } from "../schema";
import { sessionDisplayName } from "./session-display-name";

export type PublicSession = {
  id: string;
  classId: string;
  courseId: string;
  courseName: string;
  courseDescription: string | null;
  className: string;
  description: string | null;
  audience: string | null;
  location: string | null;
  startsAt: Date;
  endsAt: Date;
  availableSpaces: number;
};

/** Returns published upcoming Sessions and their current confirmed availability. */
export const listUpcomingPublicSessions = cache(async (): Promise<PublicSession[]> => {
  // A fresh checkout should still render the public timetable before database
  // credentials are provisioned. Deployment errors still surface normally.
  if (!process.env.DATABASE_URL) {
    return [];
  }

  const rows = await getDatabase()
    .select({
      id: sessions.id,
      classId: sessions.classId,
      courseId: courses.id,
      courseName: courses.name,
      courseDescription: courses.description,
      className: sessionDisplayName,
      description: classes.description,
      audience: classes.audience,
      location: sessions.location,
      startsAt: sessions.startsAt,
      endsAt: sessions.endsAt,
      capacity: sessions.capacity,
      confirmedBookings: count(bookings.id),
    })
    .from(sessions)
    .innerJoin(classes, eq(sessions.classId, classes.id))
    .innerJoin(courses, eq(classes.courseId, courses.id))
    .leftJoin(
      bookings,
      and(eq(bookings.sessionId, sessions.id), inArray(bookings.status, ["confirmed", "attended"])),
    )
    .where(
      and(
        eq(sessions.status, "scheduled"),
        eq(classes.isArchived, false),
        eq(courses.isArchived, false),
        eq(courses.publicStatus, "active"),
        gte(sessions.startsAt, new Date()),
      ),
    )
    .groupBy(
      sessions.id,
      sessions.classId,
      sessions.recurrenceGroupId,
      classes.id,
      courses.id,
      courses.name,
      courses.description,
      classes.name,
      classes.description,
      classes.audience,
      sessions.location,
      sessions.startsAt,
      sessions.endsAt,
      sessions.capacity,
    )
    .orderBy(asc(sessions.startsAt));

  return rows.map((session) => ({
    id: session.id,
    classId: session.classId,
    courseId: session.courseId,
    courseName: session.courseName,
    courseDescription: session.courseDescription,
    className: session.className,
    description: session.description,
    audience: session.audience,
    location: session.location,
    startsAt: session.startsAt,
    endsAt: session.endsAt,
    availableSpaces: Math.max(0, session.capacity - session.confirmedBookings),
  }));
});
