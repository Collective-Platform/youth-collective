import "server-only";

import { and, asc, desc, eq, gt, ilike, isNull, ne, or, sql } from "drizzle-orm";

import { getDatabase } from "../client";
import { bookings, classes, courses, notificationDeliveries, people, sessions, userAccounts, waitlistEntries } from "../schema";
import { sessionDisplayName } from "./session-display-name";

export type AdminClass = {
  id: string;
  courseId: string;
  courseName: string;
  name: string;
  description: string | null;
  audience: string | null;
  isArchived: boolean;
};

export type AdminCourse = {
  id: string;
  name: string;
  description: string | null;
  publicStatus: "active" | "coming_next" | "hidden";
  isArchived: boolean;
  classes: AdminClass[];
};

export type AdminSession = {
  id: string;
  classId: string;
  courseId: string;
  courseName: string;
  className: string;
  displayName: string | null;
  location: string | null;
  startsAt: Date;
  endsAt: Date;
  capacity: number;
  status: "scheduled" | "cancelled";
  checkInToken: string;
  checkInOpensAt: Date | null;
  checkInClosesAt: Date | null;
  attendanceFinalizedAt: Date | null;
  confirmedCount: number;
  waitingCount: number;
  failedNotificationCount: number;
  reminderQueuedCount: number;
  reminderSentCount: number;
  reminderFailedCount: number;
};

export type RosterEntry = {
  bookingId: string;
  personId: string;
  name: string;
  email: string | null;
  mobile: string;
  status: "confirmed" | "cancelled" | "attended" | "no_show";
};

export type WaitlistRosterEntry = {
  id: string;
  personId: string;
  name: string;
  email: string | null;
  mobile: string;
  createdAt: Date;
};

export type MemberHistoryEntry = {
  id: string;
  className: string;
  startsAt: Date;
  status: "confirmed" | "cancelled" | "attended" | "no_show";
};

export type AdminMember = {
  id: string;
  name: string | null;
  email: string | null;
  mobile: string | null;
  birthDate: string | null;
  createdAt: Date;
  bookingCount: number;
};

export type AdminMemberDetail = Omit<AdminMember, "bookingCount">;

export type TransferTargetSession = {
  id: string;
  startsAt: Date;
  capacity: number;
  confirmedCount: number;
};

export async function listAdminClasses(): Promise<AdminClass[]> {
  return getDatabase()
    .select({
      id: classes.id,
      courseId: classes.courseId,
      courseName: courses.name,
      name: classes.name,
      description: classes.description,
      audience: classes.audience,
      isArchived: classes.isArchived,
    })
    .from(classes)
    .innerJoin(courses, eq(classes.courseId, courses.id))
    .orderBy(asc(courses.name), asc(classes.isArchived), asc(classes.name));
}

export async function listAdminCourses(): Promise<AdminCourse[]> {
  const rows = await getDatabase()
    .select({
      id: courses.id,
      name: courses.name,
      description: courses.description,
      publicStatus: courses.publicStatus,
      isArchived: courses.isArchived,
      classId: classes.id,
      className: classes.name,
      classDescription: classes.description,
      audience: classes.audience,
      classIsArchived: classes.isArchived,
    })
    .from(courses)
    .leftJoin(classes, eq(classes.courseId, courses.id))
    .orderBy(asc(courses.isArchived), asc(courses.name), asc(classes.name));

  const coursesById = new Map<string, AdminCourse>();
  for (const row of rows) {
    const course = coursesById.get(row.id) ?? {
      id: row.id,
      name: row.name,
      description: row.description,
      publicStatus: row.publicStatus,
      isArchived: row.isArchived,
      classes: [],
    };
    if (row.classId) course.classes.push({
      id: row.classId,
      courseId: row.id,
      courseName: row.name,
      name: row.className!,
      description: row.classDescription,
      audience: row.audience,
      isArchived: row.classIsArchived!,
    });
    coursesById.set(row.id, course);
  }
  return [...coursesById.values()];
}

export async function listAdminOverview() {
  const database = getDatabase();
  const classesPromise = listAdminClasses();
  const sessionsPromise = database
    .select({
      id: sessions.id,
      classId: sessions.classId,
      courseId: courses.id,
      courseName: courses.name,
      className: sessionDisplayName,
      displayName: sessions.displayName,
      location: sessions.location,
      startsAt: sessions.startsAt,
      endsAt: sessions.endsAt,
      capacity: sessions.capacity,
      status: sessions.status,
      checkInToken: sessions.checkInToken,
      checkInOpensAt: sessions.checkInOpensAt,
      checkInClosesAt: sessions.checkInClosesAt,
      attendanceFinalizedAt: sessions.attendanceFinalizedAt,
      confirmedCount: sql<number>`(
        select count(*)::integer from ${bookings}
        where ${bookings.sessionId} = ${sessions.id} and ${bookings.status} in ('confirmed', 'attended')
      )`,
      waitingCount: sql<number>`(
        select count(*)::integer from ${waitlistEntries}
        where ${waitlistEntries.sessionId} = ${sessions.id} and ${waitlistEntries.status} = 'waiting'
      )`,
      failedNotificationCount: sql<number>`(
        select count(*)::integer from ${notificationDeliveries}
        where ${notificationDeliveries.sessionId} = ${sessions.id} and ${notificationDeliveries.status} = 'failed'
      )`,
      reminderQueuedCount: sql<number>`(
        select count(*)::integer from ${notificationDeliveries}
        where ${notificationDeliveries.sessionId} = ${sessions.id} and ${notificationDeliveries.type} = 'session_reminder' and ${notificationDeliveries.status} in ('queued', 'sending')
      )`,
      reminderSentCount: sql<number>`(
        select count(*)::integer from ${notificationDeliveries}
        where ${notificationDeliveries.sessionId} = ${sessions.id} and ${notificationDeliveries.type} = 'session_reminder' and ${notificationDeliveries.status} = 'sent'
      )`,
      reminderFailedCount: sql<number>`(
        select count(*)::integer from ${notificationDeliveries}
        where ${notificationDeliveries.sessionId} = ${sessions.id} and ${notificationDeliveries.type} = 'session_reminder' and ${notificationDeliveries.status} = 'failed'
      )`,
    })
    .from(sessions)
    .innerJoin(classes, eq(sessions.classId, classes.id))
    .innerJoin(courses, eq(classes.courseId, courses.id))
    .orderBy(asc(sessions.startsAt))
    .limit(500);

  const [classRows, sessionRows] = await Promise.all([classesPromise, sessionsPromise]);
  return { classes: classRows as AdminClass[], sessions: sessionRows as AdminSession[] };
}

export async function listTransferTargetSessions(classId: string, sourceSessionId: string): Promise<TransferTargetSession[]> {
  return getDatabase()
    .select({
      id: sessions.id,
      startsAt: sessions.startsAt,
      capacity: sessions.capacity,
      confirmedCount: sql<number>`(
        select count(*)::integer from ${bookings}
        where ${bookings.sessionId} = ${sessions.id} and ${bookings.status} in ('confirmed', 'attended')
      )`,
    })
    .from(sessions)
    .where(and(eq(sessions.classId, classId), ne(sessions.id, sourceSessionId), eq(sessions.status, "scheduled"), gt(sessions.startsAt, new Date()), isNull(sessions.attendanceFinalizedAt)))
    .orderBy(asc(sessions.startsAt));
}

/** Retrieves one Session independently of the upcoming overview window. */
export async function getAdminSession(sessionId: string): Promise<AdminSession | null> {
  const [session] = await getDatabase()
    .select({
      id: sessions.id,
      classId: sessions.classId,
      courseId: courses.id,
      courseName: courses.name,
      className: sessionDisplayName,
      displayName: sessions.displayName,
      location: sessions.location,
      startsAt: sessions.startsAt,
      endsAt: sessions.endsAt,
      capacity: sessions.capacity,
      status: sessions.status,
      checkInToken: sessions.checkInToken,
      checkInOpensAt: sessions.checkInOpensAt,
      checkInClosesAt: sessions.checkInClosesAt,
      attendanceFinalizedAt: sessions.attendanceFinalizedAt,
      confirmedCount: sql<number>`(
        select count(*)::integer from ${bookings}
        where ${bookings.sessionId} = ${sessions.id} and ${bookings.status} in ('confirmed', 'attended')
      )`,
      waitingCount: sql<number>`(
        select count(*)::integer from ${waitlistEntries}
        where ${waitlistEntries.sessionId} = ${sessions.id} and ${waitlistEntries.status} = 'waiting'
      )`,
      failedNotificationCount: sql<number>`(
        select count(*)::integer from ${notificationDeliveries}
        where ${notificationDeliveries.sessionId} = ${sessions.id} and ${notificationDeliveries.status} = 'failed'
      )`,
      reminderQueuedCount: sql<number>`(
        select count(*)::integer from ${notificationDeliveries}
        where ${notificationDeliveries.sessionId} = ${sessions.id} and ${notificationDeliveries.type} = 'session_reminder' and ${notificationDeliveries.status} in ('queued', 'sending')
      )`,
      reminderSentCount: sql<number>`(
        select count(*)::integer from ${notificationDeliveries}
        where ${notificationDeliveries.sessionId} = ${sessions.id} and ${notificationDeliveries.type} = 'session_reminder' and ${notificationDeliveries.status} = 'sent'
      )`,
      reminderFailedCount: sql<number>`(
        select count(*)::integer from ${notificationDeliveries}
        where ${notificationDeliveries.sessionId} = ${sessions.id} and ${notificationDeliveries.type} = 'session_reminder' and ${notificationDeliveries.status} = 'failed'
      )`,
    })
    .from(sessions)
    .innerJoin(classes, eq(sessions.classId, classes.id))
    .innerJoin(courses, eq(classes.courseId, courses.id))
    .where(eq(sessions.id, sessionId))
    .limit(1);

  return (session as AdminSession | undefined) ?? null;
}

export async function getSessionRoster(sessionId: string) {
  const database = getDatabase();
  const bookingRowsPromise = database
    .select({
      bookingId: bookings.id,
      personId: people.id,
      name: people.name,
      email: userAccounts.email,
      mobile: people.mobile,
      status: bookings.status,
    })
    .from(bookings)
    .innerJoin(people, eq(bookings.personId, people.id))
    .leftJoin(userAccounts, eq(userAccounts.personId, people.id))
    .where(eq(bookings.sessionId, sessionId))
    .orderBy(asc(people.name));
  const waitlistRowsPromise = database
    .select({
      id: waitlistEntries.id,
      personId: people.id,
      name: people.name,
      email: userAccounts.email,
      mobile: people.mobile,
      createdAt: waitlistEntries.createdAt,
    })
    .from(waitlistEntries)
    .innerJoin(people, eq(waitlistEntries.personId, people.id))
    .leftJoin(userAccounts, eq(userAccounts.personId, people.id))
    .where(and(eq(waitlistEntries.sessionId, sessionId), eq(waitlistEntries.status, "waiting")))
    .orderBy(asc(waitlistEntries.createdAt), asc(waitlistEntries.id));

  const [bookingRows, waitlistRows] = await Promise.all([bookingRowsPromise, waitlistRowsPromise]);
  return {
    bookings: bookingRows as RosterEntry[],
    waitlist: waitlistRows as WaitlistRosterEntry[],
  };
}

export async function getRosterCsvRows(sessionId: string) {
  return getSessionRoster(sessionId);
}

/** Staff-only directory of People. The caller owns authorization. */
export async function listAdminMembers(query = ""): Promise<AdminMember[]> {
  const normalizedQuery = query.trim();
  const searchPattern = `%${normalizedQuery.replace(/[\\%_]/g, "\\$&")}%`;
  const database = getDatabase();

  const memberRows = await database
    .select({
      id: people.id,
      name: people.name,
      email: userAccounts.email,
      mobile: people.mobile,
      birthDate: people.birthDate,
      createdAt: people.createdAt,
      bookingCount: sql<number>`(
        select count(*)::integer from ${bookings}
        where ${bookings.personId} = ${people.id}
      )`,
    })
    .from(people)
    .leftJoin(userAccounts, eq(userAccounts.personId, people.id))
    .where(
      normalizedQuery
        ? or(
            ilike(people.name, searchPattern),
            ilike(userAccounts.email, searchPattern),
            ilike(people.mobile, searchPattern),
          )
        : undefined,
    )
    .orderBy(asc(people.name), asc(people.id));

  return memberRows as AdminMember[];
}

/** Staff-only source for one Person's private record. The caller owns authorization. */
export async function getAdminMember(personId: string): Promise<AdminMemberDetail | null> {
  const [member] = await getDatabase()
    .select({
      id: people.id,
      name: people.name,
      email: userAccounts.email,
      mobile: people.mobile,
      birthDate: people.birthDate,
      createdAt: people.createdAt,
    })
    .from(people)
    .leftJoin(userAccounts, eq(userAccounts.personId, people.id))
    .where(eq(people.id, personId))
    .limit(1);

  return (member as AdminMemberDetail | undefined) ?? null;
}

/** Staff-only member history source; authorization belongs to the caller. */
export async function getMemberBookingHistory(personId: string): Promise<MemberHistoryEntry[]> {
  return getDatabase()
    .select({
      id: bookings.id,
      className: sessionDisplayName,
      startsAt: sessions.startsAt,
      status: bookings.status,
    })
    .from(bookings)
    .innerJoin(sessions, eq(bookings.sessionId, sessions.id))
    .innerJoin(classes, eq(sessions.classId, classes.id))
    .where(eq(bookings.personId, personId))
    .orderBy(desc(sessions.startsAt));
}
