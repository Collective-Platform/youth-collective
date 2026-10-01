export type SessionReportRow = {
  sessionId: string;
  courseId: string;
  courseName: string;
  classId: string;
  className: string;
  sessionName: string;
  startsAt: Date;
  capacity: number;
  status: "scheduled" | "cancelled";
  attendanceFinalizedAt: Date | null;
  attendedCount: number;
  noShowCount: number;
  confirmedCount: number;
  cancelledCount: number;
  waitlistJoinedCount: number;
  waitlistPromotedCount: number;
  waitlistWaitingCount: number;
  walkInCount: number;
};

export type ReportTotals = {
  sessions: number;
  finalizedSessions: number;
  attended: number;
  noShows: number;
  attendanceRate: number | null;
  noShowRate: number | null;
  recordedWalkIns: number;
  walkInRate: number | null;
  waitlistJoined: number;
  waitlistPromoted: number;
  waitlistConversionRate: number | null;
  unmetDemand: number;
};

export type ProgrammeReportRow = ReportTotals & {
  id: string;
  courseName: string;
  className: string | null;
};

function percentage(numerator: number, denominator: number) {
  return denominator > 0 ? Math.round((numerator / denominator) * 1000) / 10 : null;
}

export function summarizeSessions(rows: SessionReportRow[]): ReportTotals {
  const totals = rows.reduce(
    (result, row) => ({
      sessions: result.sessions + 1,
      finalizedSessions: result.finalizedSessions + (row.attendanceFinalizedAt ? 1 : 0),
      attended: result.attended + row.attendedCount,
      noShows: result.noShows + row.noShowCount,
      recordedWalkIns: result.recordedWalkIns + row.walkInCount,
      waitlistJoined: result.waitlistJoined + row.waitlistJoinedCount,
      waitlistPromoted: result.waitlistPromoted + row.waitlistPromotedCount,
      unmetDemand: result.unmetDemand + row.waitlistWaitingCount,
    }),
    { sessions: 0, finalizedSessions: 0, attended: 0, noShows: 0, recordedWalkIns: 0, waitlistJoined: 0, waitlistPromoted: 0, unmetDemand: 0 },
  );
  const attendanceDecisions = totals.attended + totals.noShows;
  return {
    ...totals,
    attendanceRate: percentage(totals.attended, attendanceDecisions),
    noShowRate: percentage(totals.noShows, attendanceDecisions),
    walkInRate: percentage(totals.recordedWalkIns, totals.attended),
    waitlistConversionRate: percentage(totals.waitlistPromoted, totals.waitlistJoined),
  };
}

export function groupProgrammeReports(rows: SessionReportRow[]): ProgrammeReportRow[] {
  const groups = new Map<string, { id: string; courseName: string; className: string | null; rows: SessionReportRow[] }>();
  for (const row of rows) {
    const courseKey = `course:${row.courseId}`;
    const course = groups.get(courseKey) ?? { id: courseKey, courseName: row.courseName, className: null, rows: [] };
    course.rows.push(row);
    groups.set(courseKey, course);

    const classKey = `class:${row.classId}`;
    const classGroup = groups.get(classKey) ?? { id: classKey, courseName: row.courseName, className: row.className, rows: [] };
    classGroup.rows.push(row);
    groups.set(classKey, classGroup);
  }
  return [...groups.values()]
    .map((group) => ({
      id: group.id,
      courseName: group.courseName,
      className: group.className,
      ...summarizeSessions(group.rows),
    }))
    .toSorted((left, right) => left.courseName.localeCompare(right.courseName) || (left.className ?? "").localeCompare(right.className ?? ""));
}

export function reportDateRange(fromValue?: string, toValue?: string, now = new Date()) {
  const defaultTo = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kuala_Lumpur" }).format(now);
  const defaultFromDate = new Date(now);
  defaultFromDate.setUTCDate(defaultFromDate.getUTCDate() - 180);
  const defaultFrom = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kuala_Lumpur" }).format(defaultFromDate);
  const validDate = /^\d{4}-\d{2}-\d{2}$/;
  const from = validDate.test(fromValue ?? "") ? fromValue! : defaultFrom;
  const to = validDate.test(toValue ?? "") ? toValue! : defaultTo;
  const fromDate = new Date(`${from}T00:00:00+08:00`);
  const toDate = new Date(`${to}T23:59:59.999+08:00`);
  if (Number.isNaN(fromDate.getTime()) || Number.isNaN(toDate.getTime()) || fromDate > toDate) {
    return reportDateRange(undefined, undefined, now);
  }
  return { from, to, fromDate, toDate };
}
