import "server-only";

import { and, asc, desc, eq, gte, isNotNull, lte, sql } from "drizzle-orm";

import type { SessionReportRow } from "../../admin/reporting";
import { getDatabase } from "../client";
import { bookingStatusHistory, bookings, classes, courses, people, sessionAuditEvents, sessions, userAccounts, waitlistEntries } from "../schema";
import { sessionDisplayName } from "./session-display-name";

export type ParticipantReadiness = {
  total: number;
  completeContact: number;
  missingEmail: number;
  missingMobile: number;
  privacyConsent: number;
  bookingConsent: number;
};

export type AdminAuditEvent = {
  id: string;
  sessionId: string;
  sessionName: string;
  courseName: string;
  actorEmail: string | null;
  actorRole: "user" | "admin" | "su" | null;
  type: string;
  reason: string | null;
  details: string | null;
  createdAt: Date;
};

type ReportInput = { from: Date; to: Date; courseId?: string };
type ParticipantRow = { id: string; name: string | null; email: string | null; mobile: string | null; privacyConsentAt: Date | null; bookingConsentAt: Date | null };

function participantReadiness(rows: ParticipantRow[]): ParticipantReadiness {
  const peopleById = new Map(rows.map((person) => [person.id, person]));
  const participants = [...peopleById.values()];
  return {
    total: participants.length,
    completeContact: participants.filter((person) => person.email && person.mobile).length,
    missingEmail: participants.filter((person) => !person.email).length,
    missingMobile: participants.filter((person) => !person.mobile).length,
    privacyConsent: participants.filter((person) => person.privacyConsentAt).length,
    bookingConsent: participants.filter((person) => person.bookingConsentAt).length,
  };
}

export async function getAdminReportData(input: ReportInput) {
  const database = getDatabase();
  const sessionFilter = and(
    gte(sessions.startsAt, input.from),
    lte(sessions.startsAt, input.to),
    input.courseId ? eq(courses.id, input.courseId) : undefined,
  );

  const sessionRowsPromise = database
    .select({
      sessionId: sessions.id,
      courseId: courses.id,
      courseName: courses.name,
      classId: classes.id,
      className: classes.name,
      sessionName: sessionDisplayName,
      startsAt: sessions.startsAt,
      capacity: sessions.capacity,
      status: sessions.status,
      attendanceFinalizedAt: sessions.attendanceFinalizedAt,
      attendedCount: sql<number>`(select count(*)::integer from ${bookings} where ${bookings.sessionId} = ${sessions.id} and ${bookings.status} = 'attended')`,
      noShowCount: sql<number>`(select count(*)::integer from ${bookings} where ${bookings.sessionId} = ${sessions.id} and ${bookings.status} = 'no_show')`,
      confirmedCount: sql<number>`(select count(*)::integer from ${bookings} where ${bookings.sessionId} = ${sessions.id} and ${bookings.status} = 'confirmed')`,
      cancelledCount: sql<number>`(select count(*)::integer from ${bookings} where ${bookings.sessionId} = ${sessions.id} and ${bookings.status} = 'cancelled')`,
      waitlistJoinedCount: sql<number>`(select count(*)::integer from ${waitlistEntries} where ${waitlistEntries.sessionId} = ${sessions.id})`,
      waitlistPromotedCount: sql<number>`(select count(*)::integer from ${waitlistEntries} where ${waitlistEntries.sessionId} = ${sessions.id} and ${waitlistEntries.status} = 'promoted')`,
      waitlistWaitingCount: sql<number>`(select count(*)::integer from ${waitlistEntries} where ${waitlistEntries.sessionId} = ${sessions.id} and ${waitlistEntries.status} = 'waiting')`,
      walkInCount: sql<number>`(
        select count(distinct ${bookingStatusHistory.bookingId})::integer
        from ${bookingStatusHistory}
        inner join ${bookings} on ${bookings.id} = ${bookingStatusHistory.bookingId}
        where ${bookings.sessionId} = ${sessions.id}
          and (${bookingStatusHistory.reason} = 'walk_in_check_in' or ${bookingStatusHistory.reason} like 'staff_walk_in:%')
      )`,
    })
    .from(sessions)
    .innerJoin(classes, eq(sessions.classId, classes.id))
    .innerJoin(courses, eq(classes.courseId, courses.id))
    .where(sessionFilter)
    .orderBy(desc(sessions.startsAt));

  const participantSelection = {
    id: people.id,
    name: people.name,
    email: userAccounts.email,
    mobile: people.mobile,
    privacyConsentAt: people.privacyConsentAt,
    bookingConsentAt: people.bookingConsentAt,
  };
  const bookingParticipantsPromise = database
    .selectDistinct(participantSelection)
    .from(people)
    .innerJoin(bookings, eq(bookings.personId, people.id))
    .innerJoin(sessions, eq(bookings.sessionId, sessions.id))
    .innerJoin(classes, eq(sessions.classId, classes.id))
    .innerJoin(courses, eq(classes.courseId, courses.id))
    .leftJoin(userAccounts, eq(userAccounts.personId, people.id))
    .where(sessionFilter);
  const waitlistParticipantsPromise = database
    .selectDistinct(participantSelection)
    .from(people)
    .innerJoin(waitlistEntries, eq(waitlistEntries.personId, people.id))
    .innerJoin(sessions, eq(waitlistEntries.sessionId, sessions.id))
    .innerJoin(classes, eq(sessions.classId, classes.id))
    .innerJoin(courses, eq(classes.courseId, courses.id))
    .leftJoin(userAccounts, eq(userAccounts.personId, people.id))
    .where(sessionFilter);

  const sessionAuditPromise = database
    .select({
      id: sessionAuditEvents.id,
      sessionId: sessions.id,
      sessionName: sessionDisplayName,
      courseName: courses.name,
      actorEmail: userAccounts.email,
      actorRole: userAccounts.role,
      type: sessionAuditEvents.type,
      reason: sessionAuditEvents.reason,
      details: sessionAuditEvents.details,
      createdAt: sessionAuditEvents.createdAt,
    })
    .from(sessionAuditEvents)
    .innerJoin(sessions, eq(sessionAuditEvents.sessionId, sessions.id))
    .innerJoin(classes, eq(sessions.classId, classes.id))
    .innerJoin(courses, eq(classes.courseId, courses.id))
    .innerJoin(userAccounts, eq(sessionAuditEvents.actorUserAccountId, userAccounts.id))
    .where(and(gte(sessionAuditEvents.createdAt, input.from), lte(sessionAuditEvents.createdAt, input.to), input.courseId ? eq(courses.id, input.courseId) : undefined))
    .orderBy(desc(sessionAuditEvents.createdAt))
    .limit(200);
  const bookingAuditPromise = database
    .select({
      id: bookingStatusHistory.id,
      sessionId: sessions.id,
      sessionName: sessionDisplayName,
      courseName: courses.name,
      actorEmail: userAccounts.email,
      actorRole: userAccounts.role,
      previousStatus: bookingStatusHistory.previousStatus,
      nextStatus: bookingStatusHistory.nextStatus,
      reason: bookingStatusHistory.reason,
      personName: people.name,
      createdAt: bookingStatusHistory.createdAt,
    })
    .from(bookingStatusHistory)
    .innerJoin(bookings, eq(bookingStatusHistory.bookingId, bookings.id))
    .innerJoin(people, eq(bookings.personId, people.id))
    .innerJoin(sessions, eq(bookings.sessionId, sessions.id))
    .innerJoin(classes, eq(sessions.classId, classes.id))
    .innerJoin(courses, eq(classes.courseId, courses.id))
    .leftJoin(userAccounts, eq(bookingStatusHistory.changedByUserAccountId, userAccounts.id))
    .where(and(gte(bookingStatusHistory.createdAt, input.from), lte(bookingStatusHistory.createdAt, input.to), isNotNull(bookingStatusHistory.changedByUserAccountId), input.courseId ? eq(courses.id, input.courseId) : undefined))
    .orderBy(desc(bookingStatusHistory.createdAt))
    .limit(200);

  const [sessionRows, bookingParticipants, waitlistParticipants, sessionAudit, bookingAudit] = await Promise.all([
    sessionRowsPromise,
    bookingParticipantsPromise,
    waitlistParticipantsPromise,
    sessionAuditPromise,
    bookingAuditPromise,
  ]);
  const auditEvents: AdminAuditEvent[] = [
    ...sessionAudit,
    ...bookingAudit.map((event) => ({
      id: event.id,
      sessionId: event.sessionId,
      sessionName: event.sessionName,
      courseName: event.courseName,
      actorEmail: event.actorEmail,
      actorRole: event.actorRole,
      type: "booking_status_changed",
      reason: event.reason,
      details: `${event.personName ?? "Unnamed Person"}: ${event.previousStatus ?? "none"} → ${event.nextStatus}`,
      createdAt: event.createdAt,
    })),
  ].toSorted((left, right) => right.createdAt.getTime() - left.createdAt.getTime()).slice(0, 200);

  return {
    sessions: sessionRows as SessionReportRow[],
    participants: participantReadiness([...bookingParticipants, ...waitlistParticipants]),
    auditEvents,
  };
}

export async function getHistoricalRosterExport(input: ReportInput) {
  return getDatabase()
    .select({
      sessionId: sessions.id,
      courseName: courses.name,
      className: classes.name,
      sessionName: sessionDisplayName,
      startsAt: sessions.startsAt,
      location: sessions.location,
      personName: people.name,
      email: userAccounts.email,
      mobile: people.mobile,
      bookingStatus: bookings.status,
      privacyConsentAt: people.privacyConsentAt,
      bookingConsentAt: people.bookingConsentAt,
    })
    .from(bookings)
    .innerJoin(people, eq(bookings.personId, people.id))
    .innerJoin(sessions, eq(bookings.sessionId, sessions.id))
    .innerJoin(classes, eq(sessions.classId, classes.id))
    .innerJoin(courses, eq(classes.courseId, courses.id))
    .leftJoin(userAccounts, eq(userAccounts.personId, people.id))
    .where(and(gte(sessions.startsAt, input.from), lte(sessions.startsAt, input.to), input.courseId ? eq(courses.id, input.courseId) : undefined))
    .orderBy(asc(sessions.startsAt), asc(people.name));
}
