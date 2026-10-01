import Link from "next/link";
import { redirect } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createSessionsAction } from "../../lib/admin/actions";
import { getCurrentAdminAccess } from "../../lib/admin/authorization";
import { listAdminOverview, type AdminClass, type AdminSession } from "../../lib/db/repositories/admin";
import { SESSION_TIME_ZONE } from "../../lib/session-time";
import { AdminCreateControls } from "./AdminCreateControls";
import { AdminPageHeader, AdminShell } from "./AdminShell";

export const dynamic = "force-dynamic";

type AdminPageProps = {
  searchParams: Promise<{ preview?: string; view?: string }>;
};

type SessionView = "upcoming" | "in-progress" | "needs-finalization" | "completed" | "cancelled";

const previewClassId = "0a1d3f5b-97d8-44cb-8f4e-2e8f91cf5d91";
const previewSessionId = "52c08e84-4abd-45a5-a4f7-0d70700fd7b4";

const previewOverview = {
  classes: [
    { id: previewClassId, courseId: previewClassId, courseName: "After-school study club", name: "After-school study club", description: "A focused study session with peer support.", audience: "Years 10–13", isArchived: false },
    { id: "8ceddd42-c1e4-4d45-af80-17e711cc8c2e", courseId: "8ceddd42-c1e4-4d45-af80-17e711cc8c2e", courseName: "Creative lab", name: "Creative lab", description: "Make, learn and share new skills.", audience: "All members", isArchived: false },
  ] satisfies AdminClass[],
  sessions: [
    {
      id: previewSessionId,
      classId: previewClassId,
      courseId: previewClassId,
      courseName: "After-school study club",
      className: "After-school study club",
      displayName: null,
      location: "Main Hall",
      startsAt: new Date("2026-08-21T16:00:00+08:00"),
      endsAt: new Date("2026-08-21T18:00:00+08:00"),
      capacity: 30,
      status: "scheduled",
      checkInToken: "70e0955d-ff4a-42bd-bd9d-ee5d9929d250",
      checkInOpensAt: new Date("2026-08-21T15:30:00+08:00"),
      checkInClosesAt: new Date("2026-08-21T16:30:00+08:00"),
      attendanceFinalizedAt: null,
      confirmedCount: 18,
      waitingCount: 3,
      failedNotificationCount: 1,
      reminderQueuedCount: 0,
      reminderSentCount: 17,
      reminderFailedCount: 1,
    },
    {
      id: "c9c743fe-051e-4f6f-8d39-69e5603a6650",
      classId: "8ceddd42-c1e4-4d45-af80-17e711cc8c2e",
      courseId: "8ceddd42-c1e4-4d45-af80-17e711cc8c2e",
      courseName: "Creative lab",
      className: "Creative lab",
      displayName: null,
      location: "Studio 2",
      startsAt: new Date("2026-08-24T16:30:00+08:00"),
      endsAt: new Date("2026-08-24T18:30:00+08:00"),
      capacity: 30,
      status: "scheduled",
      checkInToken: "c588284f-76f9-4685-909c-71a5bf0d7beb",
      checkInOpensAt: new Date("2026-08-24T16:00:00+08:00"),
      checkInClosesAt: new Date("2026-08-24T17:00:00+08:00"),
      attendanceFinalizedAt: null,
      confirmedCount: 11,
      waitingCount: 0,
      failedNotificationCount: 0,
      reminderQueuedCount: 0,
      reminderSentCount: 11,
      reminderFailedCount: 0,
    },
  ] satisfies AdminSession[],
};

const previewAccess = { id: "d756f94e-63bd-4d07-8e4d-848e8d75edfe", email: "staff-preview@example.test", role: "admin" as const };

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  weekday: "short",
  day: "numeric",
  month: "short",
  timeZone: SESSION_TIME_ZONE,
});

const timeFormatter = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: SESSION_TIME_ZONE,
});

function SessionLink({ actionLabel, session, preview }: { actionLabel: string; session: AdminSession; preview: boolean }) {
  const isCancelled = session.status === "cancelled";
  return (
    <Link
      className="grid gap-3 rounded-lg border bg-card px-5 py-4 text-card-foreground transition-colors hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:grid-cols-[1fr_auto] md:items-center"
      href={preview ? `/admin/sessions/${session.id}?preview=1` : `/admin/sessions/${session.id}`}
    >
      <div>
          <p className="text-sm text-muted-foreground">{session.courseName}</p>
          <div className="mt-1 flex flex-wrap items-center gap-2"><p className="font-semibold leading-tight">{session.className}</p>{isCancelled ? <Badge variant="destructive">Cancelled</Badge> : null}</div>
        <p className="mt-2 text-sm text-muted-foreground">
          {dateFormatter.format(session.startsAt)} · {timeFormatter.format(session.startsAt)}–{timeFormatter.format(session.endsAt)}{session.location ? ` · ${session.location}` : ""}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2 md:max-w-xs md:justify-end"><Badge>{session.confirmedCount}/{session.capacity} expected</Badge>{session.waitingCount > 0 ? <Badge variant="secondary">{session.waitingCount} waiting</Badge> : null}{session.failedNotificationCount > 0 ? <Badge variant="destructive">{session.failedNotificationCount} failed email{session.failedNotificationCount === 1 ? "" : "s"}</Badge> : null}<span className="w-full text-sm font-medium md:text-right">{actionLabel} →</span></div>
    </Link>
  );
}

function sessionView(session: AdminSession, now: Date): SessionView {
  if (session.status === "cancelled") return "cancelled";
  if (session.attendanceFinalizedAt) return "completed";
  if (session.endsAt <= now) return "needs-finalization";
  if (session.startsAt <= now) return "in-progress";
  return "upcoming";
}

function viewHref(view: SessionView, preview: boolean) {
  const query = new URLSearchParams({ view });
  if (preview) query.set("preview", "1");
  return `/admin?${query}`;
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const params = await searchParams;
  // This fixture mode exists only for local UI review. Production always enforces staff access.
  const preview = process.env.NODE_ENV === "development" && params.preview === "1";
  const access = preview ? previewAccess : await getCurrentAdminAccess();
  if (!access) redirect("/dashboard");

  const { classes, sessions } = preview ? previewOverview : await listAdminOverview();
  const now = new Date();
  const activeView: SessionView = params.view === "in-progress" || params.view === "needs-finalization" || params.view === "completed" || params.view === "cancelled" ? params.view : "upcoming";
  const sessionsByView = Object.fromEntries((["upcoming", "in-progress", "needs-finalization", "completed", "cancelled"] as SessionView[]).map((view) => [view, sessions.filter((session) => sessionView(session, now) === view)])) as Record<SessionView, AdminSession[]>;
  const displayedSessions = sessionsByView[activeView].toSorted((left, right) => activeView === "upcoming" || activeView === "in-progress" ? left.startsAt.getTime() - right.startsAt.getTime() : right.startsAt.getTime() - left.startsAt.getTime());
  const expectedSoon = sessionsByView.upcoming.reduce((total, session) => total + session.confirmedCount, 0);
  const waitingSoon = sessionsByView.upcoming.reduce((total, session) => total + session.waitingCount, 0);
  const failedNotifications = sessions.reduce((total, session) => total + session.failedNotificationCount, 0);

  const summary = [
    { label: "Upcoming Sessions", value: sessionsByView.upcoming.length, description: "Across the next schedule" },
    { label: "Expected ahead", value: expectedSoon, description: "Confirmed places" },
    { label: "Waiting for a place", value: waitingSoon, description: waitingSoon ? "Needs staff awareness" : "No waitlist pressure" },
  ];

  return (
    <AdminShell currentPath="/admin" email={access.email} preview={preview} role={access.role}>
      <AdminPageHeader description="Prepare upcoming Sessions, run check-in, and close attendance without losing operational follow-up." title="Session operations" />
      <div className="px-4 py-8 md:px-8 lg:px-10">
            <section aria-label="Operational summary" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <Card><CardHeader><CardDescription>Needs finalization</CardDescription><CardTitle className="text-3xl tabular-nums">{sessionsByView["needs-finalization"].length}</CardTitle></CardHeader><CardContent className="text-sm text-muted-foreground">{sessionsByView["needs-finalization"].length ? "Attendance needs staff review" : "Nothing waiting to close"}</CardContent></Card>
              {summary.map((item) => <Card key={item.label}><CardHeader><CardDescription>{item.label}</CardDescription><CardTitle className="text-3xl tabular-nums">{item.value}</CardTitle></CardHeader><CardContent className="text-sm text-muted-foreground">{item.description}</CardContent></Card>)}
            </section>

            {failedNotifications > 0 ? <div className="mt-6 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm font-medium text-destructive">{failedNotifications} notification {failedNotifications === 1 ? "delivery needs" : "deliveries need"} attention. Open the affected Session to retry.</div> : null}

            <section className="mt-10" id="sessions">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                <div>
                  <h2 className="text-xl font-semibold tracking-tight">Sessions</h2>
                  <p className="mt-1 text-sm text-muted-foreground">Move from preparation through attendance closeout.</p>
                </div>
                <AdminCreateControls classes={classes.map(({ id, courseId, courseName, name }) => ({ id, courseId, courseName, name }))} createSessionsAction={createSessionsAction} />
              </div>

              <nav aria-label="Session status" className="mt-6 flex gap-2 overflow-x-auto pb-1">{([
                ["upcoming", "Upcoming"], ["in-progress", "In progress"], ["needs-finalization", "Needs finalization"], ["completed", "Completed"], ["cancelled", "Cancelled"],
              ] as const).map(([view, label]) => <Link className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium no-underline ${activeView === view ? "bg-primary text-primary-foreground" : "border bg-background hover:bg-accent"}`} href={viewHref(view, preview)} key={view}>{label} <span className="ml-1 tabular-nums opacity-70">{sessionsByView[view].length}</span></Link>)}</nav>
              <div className="mt-6 grid gap-3">
                {displayedSessions.length > 0 ? displayedSessions.map((session) => <SessionLink actionLabel={activeView === "needs-finalization" ? "Review attendance" : "Open Session"} key={session.id} preview={preview} session={session} />) : (
                  <Card className="border-dashed"><CardContent className="py-8 text-sm text-muted-foreground">No Sessions in this view.</CardContent></Card>
                )}
              </div>
            </section>
      </div>
    </AdminShell>
  );
}
