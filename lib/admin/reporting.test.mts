import assert from "node:assert/strict";
import test from "node:test";

import { groupProgrammeReports, summarizeSessions, type SessionReportRow } from "./reporting.ts";

const base: SessionReportRow = {
  sessionId: "session-1",
  courseId: "course-1",
  courseName: "Knowing God",
  classId: "class-1",
  className: "Teens",
  sessionName: "Knowing God: Who He is",
  startsAt: new Date("2026-09-01T12:00:00Z"),
  capacity: 30,
  status: "scheduled",
  attendanceFinalizedAt: new Date("2026-09-01T15:00:00Z"),
  attendedCount: 8,
  noShowCount: 2,
  confirmedCount: 3,
  cancelledCount: 7,
  waitlistJoinedCount: 5,
  waitlistPromotedCount: 2,
  waitlistWaitingCount: 1,
  walkInCount: 2,
};

test("report rates use attendance decisions rather than cancelled or unfinalized bookings", () => {
  assert.deepEqual(summarizeSessions([base]), {
    sessions: 1,
    finalizedSessions: 1,
    attended: 8,
    noShows: 2,
    attendanceRate: 80,
    noShowRate: 20,
    recordedWalkIns: 2,
    walkInRate: 25,
    waitlistJoined: 5,
    waitlistPromoted: 2,
    waitlistConversionRate: 40,
    unmetDemand: 1,
  });
});

test("programme groups include one Course rollup and its Class rows", () => {
  const groups = groupProgrammeReports([
    base,
    { ...base, sessionId: "session-2", classId: "class-2", className: "College", attendedCount: 4, noShowCount: 0 },
  ]);

  assert.equal(groups.length, 3);
  assert.equal(groups.find((group) => group.className === null)?.attended, 12);
  assert.equal(groups.find((group) => group.className === "College")?.attendanceRate, 100);
});
