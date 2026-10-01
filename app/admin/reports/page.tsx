import Link from "next/link";
import { redirect } from "next/navigation";
import { Download, FileClock, ShieldCheck, UsersRound } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getCurrentAdminAccess } from "../../../lib/admin/authorization";
import { groupProgrammeReports, reportDateRange, summarizeSessions, type SessionReportRow } from "../../../lib/admin/reporting";
import { getAdminReportData, type AdminAuditEvent, type ParticipantReadiness } from "../../../lib/db/repositories/admin-reports";
import { listAdminCourses, type AdminCourse } from "../../../lib/db/repositories/admin";
import { SESSION_TIME_ZONE } from "../../../lib/session-time";
import { AdminPageHeader, AdminShell } from "../AdminShell";

export const dynamic = "force-dynamic";

type ReportsPageProps = { searchParams: Promise<{ preview?: string; from?: string; to?: string; course?: string }> };
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const previewAccess = { id: "d756f94e-63bd-4d07-8e4d-848e8d75edfe", email: "staff-preview@example.test", role: "admin" as const };
const previewCourseId = "0a1d3f5b-97d8-44cb-8f4e-2e8f91cf5d91";
const previewClassId = "3a731246-a3fe-4ac4-93be-116f59369e14";
const previewCourses = [{ id: previewCourseId, name: "Knowing God", description: "Practical faith conversations.", publicStatus: "active", isArchived: false, classes: [] }] satisfies AdminCourse[];
const previewSessions: SessionReportRow[] = [
  { sessionId: "52c08e84-4abd-45a5-a4f7-0d70700fd7b4", courseId: previewCourseId, courseName: "Knowing God", classId: previewClassId, className: "Teens", sessionName: "After-school study club · Week 3", startsAt: new Date("2026-09-25T16:00:00+08:00"), capacity: 30, status: "scheduled", attendanceFinalizedAt: new Date("2026-09-25T18:20:00+08:00"), attendedCount: 19, noShowCount: 3, confirmedCount: 0, cancelledCount: 4, waitlistJoinedCount: 6, waitlistPromotedCount: 4, waitlistWaitingCount: 0, walkInCount: 3 },
  { sessionId: "b27f35cf-2cb8-4308-a2ca-0c47dd81657f", courseId: previewCourseId, courseName: "Knowing God", classId: previewClassId, className: "Teens", sessionName: "After-school study club · Week 2", startsAt: new Date("2026-09-18T16:00:00+08:00"), capacity: 30, status: "scheduled", attendanceFinalizedAt: new Date("2026-09-18T18:15:00+08:00"), attendedCount: 17, noShowCount: 2, confirmedCount: 0, cancelledCount: 3, waitlistJoinedCount: 3, waitlistPromotedCount: 2, waitlistWaitingCount: 0, walkInCount: 1 },
  { sessionId: "52a56950-3aae-44f6-8351-0ce38de585be", courseId: previewCourseId, courseName: "Knowing God", classId: "27961f43-804a-48a1-a75a-4ddfc65c56fc", className: "College", sessionName: "College conversations · Week 1", startsAt: new Date("2026-09-11T19:30:00+08:00"), capacity: 30, status: "scheduled", attendanceFinalizedAt: new Date("2026-09-11T21:45:00+08:00"), attendedCount: 12, noShowCount: 4, confirmedCount: 0, cancelledCount: 2, waitlistJoinedCount: 7, waitlistPromotedCount: 3, waitlistWaitingCount: 2, walkInCount: 2 },
];
const previewParticipants: ParticipantReadiness = { total: 42, completeContact: 35, missingEmail: 5, missingMobile: 2, privacyConsent: 39, bookingConsent: 37 };
const previewAudit: AdminAuditEvent[] = [
  { id: "audit-1", sessionId: previewSessions[0].sessionId, sessionName: previewSessions[0].sessionName, courseName: "Knowing God", actorEmail: "staff-preview@example.test", actorRole: "admin", type: "attendance_finalized", reason: "Attendance reviewed after class", details: "3 expected Bookings marked no-show", createdAt: new Date("2026-09-25T18:20:00+08:00") },
  { id: "audit-2", sessionId: previewSessions[0].sessionId, sessionName: previewSessions[0].sessionName, courseName: "Knowing God", actorEmail: "staff-preview@example.test", actorRole: "admin", type: "walk_in_created", reason: "Arrived without a Booking", details: "New Person record created", createdAt: new Date("2026-09-25T16:08:00+08:00") },
  { id: "audit-3", sessionId: previewSessions[1].sessionId, sessionName: previewSessions[1].sessionName, courseName: "Knowing God", actorEmail: "staff-preview@example.test", actorRole: "admin", type: "booking_status_changed", reason: "staff_adjustment: checked against paper register", details: "Noah Martin: no_show → attended", createdAt: new Date("2026-09-19T09:30:00+08:00") },
];

const dateFormatter = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: SESSION_TIME_ZONE });
const auditFormatter = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: SESSION_TIME_ZONE });

function rate(value: number | null) { return value === null ? "—" : `${value}%`; }
function eventLabel(type: string) { return type.split("_").map((word) => word[0]?.toUpperCase() + word.slice(1)).join(" "); }
function sessionHref(sessionId: string, preview: boolean) { return preview ? `/admin/sessions/${sessionId}?preview=1` : `/admin/sessions/${sessionId}`; }

function ReadinessRow({ label, value, total, detail }: { label: string; value: number; total: number; detail: string }) {
  const width = total ? Math.round((value / total) * 100) : 0;
  return <div><div className="flex items-baseline justify-between gap-4"><div><p className="text-sm font-medium">{label}</p><p className="mt-0.5 text-xs text-muted-foreground">{detail}</p></div><p className="shrink-0 text-sm font-semibold tabular-nums">{value}/{total}</p></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-foreground" style={{ width: `${width}%` }} /></div></div>;
}

/**
 * THESIS: Reporting is an operational reading desk, not a decorative analytics dashboard.
 * STORY: Staff narrow the period, understand attendance and demand, find incomplete records, then trace the decisions behind the numbers.
 * FIRST VIEWPORT: A compact filter leads into one anchored participation summary, with exports available beside the selected scope.
 */
export default async function ReportsPage({ searchParams }: ReportsPageProps) {
  const params = await searchParams;
  const preview = process.env.NODE_ENV === "development" && params.preview === "1";
  const access = preview ? previewAccess : await getCurrentAdminAccess();
  if (!access) redirect("/dashboard");
  const range = reportDateRange(params.from, params.to);
  const courseId = params.course && uuidPattern.test(params.course) ? params.course : undefined;
  const [courses, report] = preview
    ? [previewCourses, { sessions: courseId && courseId !== previewCourseId ? [] : previewSessions, participants: previewParticipants, auditEvents: previewAudit }]
    : await Promise.all([listAdminCourses(), getAdminReportData({ from: range.fromDate, to: range.toDate, courseId })]);
  const totals = summarizeSessions(report.sessions);
  const programmes = groupProgrammeReports(report.sessions);
  const exportParams = new URLSearchParams({ from: range.from, to: range.to });
  if (courseId) exportParams.set("course", courseId);

  return (
    <AdminShell currentPath="/admin/reports" email={access.email} preview={preview} previewMessage="Illustrative reporting data · Exports stay protected" role={access.role}>
      <AdminPageHeader description="Understand participation, demand, record readiness, and the staff actions behind each Session." title="Reports" />
      <div className="space-y-12 px-4 py-8 md:px-8 lg:px-10">
        <section aria-labelledby="report-scope-heading">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <form action="/admin/reports" className="grid flex-1 gap-3 sm:grid-cols-2 xl:max-w-3xl xl:grid-cols-[1fr_1fr_1.4fr_auto]" method="get">
              {preview ? <input name="preview" type="hidden" value="1" /> : null}
              <div className="grid gap-2"><Label htmlFor="report-from">From</Label><Input defaultValue={range.from} id="report-from" name="from" type="date" /></div>
              <div className="grid gap-2"><Label htmlFor="report-to">To</Label><Input defaultValue={range.to} id="report-to" name="to" type="date" /></div>
              <div className="grid gap-2"><Label htmlFor="report-course">Course</Label><select className="h-9 min-w-0 rounded-md border bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50" defaultValue={courseId ?? ""} id="report-course" name="course"><option value="">All Courses</option>{courses.map((course) => <option key={course.id} value={course.id}>{course.name}</option>)}</select></div>
              <Button className="self-end" type="submit">Apply</Button>
            </form>
            <Button asChild={!preview} disabled={preview} variant="outline">{preview ? <span><Download />Export unavailable in preview</span> : <a href={`/admin/reports/export?${exportParams}`}><Download />Export programme history</a>}</Button>
          </div>
          <h2 className="sr-only" id="report-scope-heading">Report scope</h2>
        </section>

        <section aria-labelledby="snapshot-heading">
          <Card className="overflow-hidden border-0 bg-zinc-950 py-0 text-white shadow-none">
            <div className="grid lg:grid-cols-[minmax(15rem,0.72fr)_1.28fr]">
              <div className="flex flex-col justify-between border-white/15 p-6 lg:border-r lg:p-8">
                <div><h2 className="text-xl font-semibold" id="snapshot-heading">Participation snapshot</h2><p className="mt-2 max-w-sm text-sm text-zinc-300">Attendance uses finalized attended and no-show outcomes. Cancelled and still-expected Bookings stay outside the rate.</p></div>
                <div className="mt-10"><p className="text-6xl font-semibold tracking-[-0.04em] tabular-nums">{rate(totals.attendanceRate)}</p><p className="mt-2 text-sm font-medium text-zinc-300">attendance · {totals.attended} attended of {totals.attended + totals.noShows} decisions</p></div>
              </div>
              <dl className="grid grid-cols-2 divide-x divide-y divide-white/15 sm:grid-cols-3">
                <div className="p-5 lg:p-6"><dt className="text-xs font-medium text-zinc-400">Sessions finalized</dt><dd className="mt-3 text-2xl font-semibold tabular-nums">{totals.finalizedSessions}/{totals.sessions}</dd></div>
                <div className="p-5 lg:p-6"><dt className="text-xs font-medium text-zinc-400">No-show rate</dt><dd className="mt-3 text-2xl font-semibold tabular-nums">{rate(totals.noShowRate)}</dd></div>
                <div className="p-5 lg:p-6"><dt className="text-xs font-medium text-zinc-400">Recorded walk-ins</dt><dd className="mt-3 text-2xl font-semibold tabular-nums">{totals.recordedWalkIns}</dd><p className="mt-1 text-xs text-zinc-400">{rate(totals.walkInRate)} of attendance</p></div>
                <div className="p-5 lg:p-6"><dt className="text-xs font-medium text-zinc-400">Waitlist conversion</dt><dd className="mt-3 text-2xl font-semibold tabular-nums">{rate(totals.waitlistConversionRate)}</dd><p className="mt-1 text-xs text-zinc-400">{totals.waitlistPromoted}/{totals.waitlistJoined} promoted</p></div>
                <div className="p-5 lg:p-6"><dt className="text-xs font-medium text-zinc-400">Still waiting</dt><dd className="mt-3 text-2xl font-semibold tabular-nums">{totals.unmetDemand}</dd><p className="mt-1 text-xs text-zinc-400">Current unmet demand</p></div>
                <div className="p-5 lg:p-6"><dt className="text-xs font-medium text-zinc-400">Date range</dt><dd className="mt-3 text-base font-semibold">{dateFormatter.format(range.fromDate)}</dd><p className="mt-1 text-xs text-zinc-400">to {dateFormatter.format(range.toDate)}</p></div>
              </dl>
            </div>
          </Card>
        </section>

        <section aria-labelledby="programme-heading">
          <div><h2 className="text-xl font-semibold" id="programme-heading">Programme performance</h2><p className="mt-1 text-sm text-muted-foreground">Course totals are followed by their audience-specific Classes.</p></div>
          <Card className="mt-4 py-0"><Table className="min-w-210"><TableHeader><TableRow><TableHead>Course / Class</TableHead><TableHead className="text-right">Sessions</TableHead><TableHead className="text-right">Attended</TableHead><TableHead className="text-right">No shows</TableHead><TableHead className="text-right">Attendance</TableHead><TableHead className="text-right">Waitlist converted</TableHead><TableHead className="text-right">Still waiting</TableHead></TableRow></TableHeader><TableBody>{programmes.map((row) => <TableRow className={row.className ? "" : "bg-muted/50"} key={row.id}><TableCell><span className={row.className ? "pl-5 text-muted-foreground" : "font-semibold"}>{row.className ?? row.courseName}</span>{row.className ? <span className="sr-only"> in {row.courseName}</span> : null}</TableCell><TableCell className="text-right tabular-nums">{row.sessions}</TableCell><TableCell className="text-right tabular-nums">{row.attended}</TableCell><TableCell className="text-right tabular-nums">{row.noShows}</TableCell><TableCell className="text-right font-medium tabular-nums">{rate(row.attendanceRate)}</TableCell><TableCell className="text-right tabular-nums">{rate(row.waitlistConversionRate)}</TableCell><TableCell className="text-right tabular-nums">{row.unmetDemand}</TableCell></TableRow>)}</TableBody></Table></Card>
          {programmes.length === 0 ? <p className="py-10 text-center text-sm text-muted-foreground">No Sessions match this reporting period.</p> : null}
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(19rem,0.65fr)]" aria-label="Session and participant detail">
          <div><h2 className="text-xl font-semibold">Session history</h2><p className="mt-1 text-sm text-muted-foreground">Open any Session for its roster and attendance detail.</p><Card className="mt-4 py-0"><Table className="min-w-180"><TableHeader><TableRow><TableHead>Session</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Attended</TableHead><TableHead className="text-right">No show</TableHead><TableHead className="text-right">Walk-ins</TableHead><TableHead className="text-right">Waiting</TableHead></TableRow></TableHeader><TableBody>{report.sessions.map((session) => <TableRow key={session.sessionId}><TableCell><Link className="font-medium hover:underline" href={sessionHref(session.sessionId, preview)}>{session.sessionName}</Link><span className="mt-1 block text-xs text-muted-foreground">{dateFormatter.format(session.startsAt)} · {session.courseName} / {session.className}</span></TableCell><TableCell>{session.status === "cancelled" ? <Badge variant="destructive">Cancelled</Badge> : session.attendanceFinalizedAt ? <Badge variant="secondary">Finalized</Badge> : <Badge variant="outline">Open</Badge>}</TableCell><TableCell className="text-right tabular-nums">{session.attendedCount}</TableCell><TableCell className="text-right tabular-nums">{session.noShowCount}</TableCell><TableCell className="text-right tabular-nums">{session.walkInCount}</TableCell><TableCell className="text-right tabular-nums">{session.waitlistWaitingCount}</TableCell></TableRow>)}</TableBody></Table></Card></div>
          <Card className="h-fit"><CardHeader><div className="flex items-center gap-2"><UsersRound aria-hidden="true" className="size-5" /><CardTitle>Participant readiness</CardTitle></div><CardDescription>Unique People with a Booking or Waitlist entry in this reporting period.</CardDescription></CardHeader><CardContent className="grid gap-6"><ReadinessRow detail={`${report.participants.missingEmail} missing email · ${report.participants.missingMobile} missing mobile`} label="Complete contact" total={report.participants.total} value={report.participants.completeContact} /><ReadinessRow detail="Privacy consent timestamp retained" label="Privacy consent" total={report.participants.total} value={report.participants.privacyConsent} /><ReadinessRow detail="Classes booking consent retained" label="Booking consent" total={report.participants.total} value={report.participants.bookingConsent} /></CardContent></Card>
        </section>

        <section aria-labelledby="audit-heading">
          <div className="flex items-start gap-3"><ShieldCheck aria-hidden="true" className="mt-0.5 size-5 text-muted-foreground" /><div><h2 className="text-xl font-semibold" id="audit-heading">Operational audit trail</h2><p className="mt-1 text-sm text-muted-foreground">Recent attributed Session events and Booking status changes within this period.</p></div></div>
          <div className="mt-5 divide-y rounded-xl border bg-card">{report.auditEvents.length ? report.auditEvents.map((event) => <article className="grid gap-3 px-5 py-4 md:grid-cols-[9rem_minmax(0,1fr)_minmax(11rem,auto)] md:items-start" key={event.id}><time className="text-sm text-muted-foreground" dateTime={event.createdAt.toISOString()}>{auditFormatter.format(event.createdAt)}</time><div><div className="flex flex-wrap items-center gap-2"><p className="font-medium">{eventLabel(event.type)}</p><Badge variant="outline">{event.courseName}</Badge></div><p className="mt-1 text-sm text-muted-foreground">{event.details ?? event.reason ?? "No additional detail"}</p>{event.details && event.reason ? <p className="mt-1 text-xs text-muted-foreground">Reason: {event.reason}</p> : null}<Button asChild className="mt-1 h-auto px-0" variant="link"><Link href={sessionHref(event.sessionId, preview)}>{event.sessionName}</Link></Button></div><p className="text-sm text-muted-foreground md:text-right">{event.actorEmail ?? "System"}<span className="block text-xs capitalize">{event.actorRole ?? "system"}</span></p></article>) : <div className="px-5 py-10 text-center"><FileClock aria-hidden="true" className="mx-auto size-6 text-muted-foreground" /><p className="mt-3 text-sm text-muted-foreground">No attributed operational events in this period.</p></div>}</div>
        </section>
      </div>
    </AdminShell>
  );
}
