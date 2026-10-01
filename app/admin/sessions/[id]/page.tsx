import Image from "next/image";
import Link from "next/link";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { toDataURL } from "qrcode";
import { CheckCircle2, Download, QrCode, TriangleAlert } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { finalizeAttendanceAction, retryFailedNotificationsAction, updateSessionAction } from "../../../../lib/admin/actions";
import { getCurrentAdminAccess } from "../../../../lib/admin/authorization";
import { getAdminSession, getSessionRoster, listAdminMembers, listTransferTargetSessions, type AdminSession } from "../../../../lib/db/repositories/admin";
import { formatSessionDateTimeInput, SESSION_TIME_ZONE } from "../../../../lib/session-time";
import { AdminShell } from "../../AdminShell";
import AddPersonDrawer from "./AddPersonDrawer";
import FinalizeAttendanceButton from "./FinalizeAttendanceButton";
import ManualCheckInButton from "./ManualCheckInButton";
import ReopenAttendanceButton from "./ReopenAttendanceButton";
import RetryNotificationsButton from "./RetryNotificationsButton";
import SessionSettingsDrawer from "./SessionSettingsDrawer";
import WaitlistActions from "./WaitlistActions";
import WalkInDrawer from "./WalkInDrawer";

export const dynamic = "force-dynamic";

type SessionPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ preview?: string; tab?: string }>;
};

type RosterTab = "expected" | "checked-in" | "waitlist" | "cancelled" | "no-show";

const previewSessionId = "52c08e84-4abd-45a5-a4f7-0d70700fd7b4";
const previewPersonId = "b8db9ed0-8ac3-4861-901f-810436236819";
const previewAccess = { id: "d756f94e-63bd-4d07-8e4d-848e8d75edfe", email: "staff-preview@example.test", role: "admin" as const };

const previewSession: AdminSession = {
  id: previewSessionId,
  classId: "0a1d3f5b-97d8-44cb-8f4e-2e8f91cf5d91",
  courseId: "0a1d3f5b-97d8-44cb-8f4e-2e8f91cf5d91",
  courseName: "Knowing God",
  className: "After-school study club",
  displayName: null,
  location: "Main Hall",
  startsAt: new Date("2026-10-21T16:00:00+08:00"),
  endsAt: new Date("2026-10-21T18:00:00+08:00"),
  capacity: 30,
  status: "scheduled",
  checkInToken: "70e0955d-ff4a-42bd-bd9d-ee5d9929d250",
  checkInOpensAt: new Date("2026-10-21T15:30:00+08:00"),
  checkInClosesAt: new Date("2026-10-21T16:30:00+08:00"),
  attendanceFinalizedAt: null,
  confirmedCount: 18,
  waitingCount: 3,
  failedNotificationCount: 1,
  reminderQueuedCount: 0,
  reminderSentCount: 17,
  reminderFailedCount: 1,
};

const previewSessions: AdminSession[] = [
  previewSession,
  {
    id: "c9c743fe-051e-4f6f-8d39-69e5603a6650",
    classId: previewSession.classId,
    courseId: previewSession.courseId,
    courseName: "Knowing God",
    className: "After-school study club",
    displayName: null,
    location: "Studio 2",
    startsAt: new Date("2026-10-24T16:30:00+08:00"),
    endsAt: new Date("2026-10-24T18:30:00+08:00"),
    capacity: 30,
    status: "scheduled",
    checkInToken: "c588284f-76f9-4685-909c-71a5bf0d7beb",
    checkInOpensAt: new Date("2026-10-24T16:00:00+08:00"),
    checkInClosesAt: new Date("2026-10-24T17:00:00+08:00"),
    attendanceFinalizedAt: null,
    confirmedCount: 11,
    waitingCount: 0,
    failedNotificationCount: 0,
    reminderQueuedCount: 0,
    reminderSentCount: 11,
    reminderFailedCount: 0,
  },
];

const previewRoster = {
  bookings: [
    { bookingId: "4b3559b4-8ebc-4bb2-a661-bfd2-3171afe", personId: previewPersonId, name: "Amira Khan", email: "amira@example.test", mobile: "+32 470 12 34 56", status: "confirmed" as const },
    { bookingId: "27f1e32e-1fa0-464b-8816-823855254a6f", personId: "3137b83d-2edf-48bc-8871-ac6c36ffb46e", name: "Noah Martin", email: "noah@example.test", mobile: "+32 471 98 76 54", status: "confirmed" as const },
    { bookingId: "4b0b31f3-fefe-44b6-a357-f3da6911ee1b", personId: "e5ca0e42-8058-4463-b0cb-742f631c6bb6", name: "Lina De Smet", email: "lina@example.test", mobile: "+32 474 33 22 11", status: "attended" as const },
  ],
  waitlist: [
    { id: "12ff6ba5-0c32-4c7d-a2e4-344e4d02a879", personId: "6b5515f2-9022-4966-87a1-e0a40151903f", name: "Ilias Vermeulen", email: "ilias@example.test", mobile: "+32 475 55 44 33", createdAt: new Date("2026-08-18T09:15:00+08:00") },
  ],
};

const previewMemberOptions = [
  { id: previewPersonId, name: "Amira Khan", email: "amira@example.test", mobile: "+32 470 12 34 56" },
  { id: "3137b83d-2edf-48bc-8871-ac6c36ffb46e", name: "Noah Martin", email: "noah@example.test", mobile: "+32 471 98 76 54" },
  { id: "e5ca0e42-8058-4463-b0cb-742f631c6bb6", name: "Lina De Smet", email: "lina@example.test", mobile: "+32 474 33 22 11" },
  { id: "6b5515f2-9022-4966-87a1-e0a40151903f", name: "Ilias Vermeulen", email: "ilias@example.test", mobile: "+32 475 55 44 33" },
  { id: "bb6de01c-1b12-49ed-9b95-c0ceeb6f40aa", name: "Zara Ahmed", email: "zara@example.test", mobile: "+32 476 22 14 73" },
];

const dateFormatter = new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short", timeZone: SESSION_TIME_ZONE });
const timeFormatter = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: SESSION_TIME_ZONE });

function memberHref(memberId: string, preview: boolean) {
  return preview ? `/admin/members/${memberId}?preview=1` : `/admin/members/${memberId}`;
}

function rosterHref(sessionId: string, tab: RosterTab, preview: boolean) {
  const search = new URLSearchParams({ tab });
  if (preview) search.set("preview", "1");
  return `/admin/sessions/${sessionId}?${search}`;
}

export default async function SessionPage({ params, searchParams }: SessionPageProps) {
  const [{ id: sessionId }, query] = await Promise.all([params, searchParams]);
  const preview = process.env.NODE_ENV === "development" && query.preview === "1";
  const access = preview ? previewAccess : await getCurrentAdminAccess();
  if (!access) redirect("/dashboard");

  const [session, roster, members] = preview
    ? [
        previewSessions.find((session) => session.id === sessionId) ?? null,
        previewSessions.some((session) => session.id === sessionId) ? previewRoster : null,
        previewMemberOptions,
      ]
    : await Promise.all([
        getAdminSession(sessionId),
        getSessionRoster(sessionId),
        listAdminMembers(),
      ]);
  if (!session || !roster) notFound();
  const transferTargetSessions = session.status === "scheduled" && session.startsAt > new Date() && !session.attendanceFinalizedAt
    ? preview
      ? previewSessions.filter((candidate) => candidate.classId === session.classId && candidate.id !== session.id && candidate.status === "scheduled")
      : await listTransferTargetSessions(session.classId, session.id)
    : [];
  const transferTargets = transferTargetSessions
    .filter((candidate) => candidate.confirmedCount < candidate.capacity)
    .map((candidate) => ({ id: candidate.id, label: `${dateFormatter.format(candidate.startsAt)} at ${timeFormatter.format(candidate.startsAt)} · ${candidate.capacity - candidate.confirmedCount} places left` }));

  const activeTab: RosterTab = query.tab === "checked-in" || query.tab === "waitlist" || query.tab === "cancelled" || query.tab === "no-show" ? query.tab : "expected";
  const expectedBookings = roster.bookings.filter((booking) => booking.status === "confirmed");
  const checkedInBookings = roster.bookings.filter((booking) => booking.status === "attended");
  const cancelledBookings = roster.bookings.filter((booking) => booking.status === "cancelled");
  const noShowBookings = roster.bookings.filter((booking) => booking.status === "no_show");
  const displayedBookings = activeTab === "expected" ? expectedBookings : activeTab === "checked-in" ? checkedInBookings : activeTab === "cancelled" ? cancelledBookings : noShowBookings;
  const missingContactCount = [...roster.bookings, ...roster.waitlist].filter((person) => !person.mobile || !person.email).length;
  const readinessChecks = [
    { label: "Location", ready: Boolean(session.location), detail: session.location || "Add a location" },
    { label: "Check-in window", ready: Boolean(session.checkInOpensAt && session.checkInClosesAt), detail: session.checkInOpensAt && session.checkInClosesAt ? `${timeFormatter.format(session.checkInOpensAt)}–${timeFormatter.format(session.checkInClosesAt)}` : "Set both times" },
    { label: "Contact details", ready: missingContactCount === 0, detail: missingContactCount ? `${missingContactCount} incomplete` : "Complete" },
    { label: "Waitlist pressure", ready: session.waitingCount === 0, detail: session.waitingCount ? `${session.waitingCount} waiting` : "None waiting" },
    { label: "Reminder delivery", ready: session.reminderFailedCount === 0, detail: session.reminderFailedCount ? `${session.reminderFailedCount} failed` : session.reminderSentCount ? `${session.reminderSentCount} sent` : session.reminderQueuedCount ? `${session.reminderQueuedCount} queued` : "Not due yet" },
  ];

  const requestHeaders = await headers();
  const siteUrl = process.env.SITE_URL ?? `${requestHeaders.get("x-forwarded-proto") ?? "https"}://${requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host")}`;
  const checkInUrl = new URL(`/check-in/${session.checkInToken}`, siteUrl).toString();
  const checkInQrCode = await toDataURL(checkInUrl, { width: 300, margin: 1, color: { dark: "#000000", light: "#ffffff" } });

  return (
    <AdminShell currentPath="/admin" email={access.email} preview={preview} role={access.role}>
          <header className="border-b bg-background px-4 py-6 md:px-8 lg:px-10">
            <Button asChild className="px-0" variant="link"><Link href={preview ? "/admin?preview=1" : "/admin"}>All Sessions</Link></Button>
            <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{session.courseName}</p>
                <h1 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">{session.className}</h1>
                <p className="mt-2 text-sm text-muted-foreground">{dateFormatter.format(session.startsAt)} · {timeFormatter.format(session.startsAt)}–{timeFormatter.format(session.endsAt)}{session.location ? ` · ${session.location}` : ""}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <SessionSettingsDrawer action={updateSessionAction.bind(null, session.id)}>
                  <div className="grid gap-4">
                    <p className="text-sm font-semibold">Session details</p>
                    <div className="grid gap-2"><Label htmlFor="session-start">Starts</Label><Input defaultValue={formatSessionDateTimeInput(session.startsAt)} id="session-start" name="startsAt" required type="datetime-local" /></div>
                    <div className="grid gap-2"><Label htmlFor="session-end">Ends</Label><Input defaultValue={formatSessionDateTimeInput(session.endsAt)} id="session-end" name="endsAt" required type="datetime-local" /></div>
                    <div className="grid gap-2"><Label>Status</Label><Select defaultValue={session.status} name="status"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="scheduled">Scheduled</SelectItem><SelectItem value="cancelled">Cancelled</SelectItem></SelectContent></Select></div>
                    <div className="grid gap-2"><Label htmlFor="session-capacity">Capacity</Label><Input defaultValue={session.capacity} id="session-capacity" max="500" min="1" name="capacity" required type="number" /></div>
                    <div className="grid gap-2"><Label htmlFor="session-location">Location</Label><Input defaultValue={session.location ?? ""} id="session-location" maxLength={200} name="location" placeholder="For example, Main Hall" /></div>
                    <div className="grid gap-2"><Label htmlFor="session-display-name">Display name</Label><Input defaultValue={session.displayName ?? ""} id="session-display-name" maxLength={180} name="displayName" placeholder="Leave blank to use the Class name" /></div>
                    <div className="grid gap-2"><Label htmlFor="session-cancellation">Cancellation note</Label><Input id="session-cancellation" name="cancellationReason" placeholder="Optional note" /></div>
                    <div className="grid gap-2"><Label htmlFor="check-in-opens">Check-in opens</Label><Input defaultValue={session.checkInOpensAt ? formatSessionDateTimeInput(session.checkInOpensAt) : ""} id="check-in-opens" name="checkInOpensAt" required type="datetime-local" /></div>
                    <div className="grid gap-2"><Label htmlFor="check-in-closes">Check-in closes</Label><Input defaultValue={session.checkInClosesAt ? formatSessionDateTimeInput(session.checkInClosesAt) : ""} id="check-in-closes" name="checkInClosesAt" required type="datetime-local" /></div>
                    <Button className="w-fit" type="submit">Save Session</Button>
                  </div>
                </SessionSettingsDrawer>
              </div>
            </div>
          </header>

          <div className="px-4 py-8 md:px-8 lg:px-10">
            <Card aria-label="Run controls">
              <CardHeader className="min-w-0 xl:flex-row xl:items-center xl:justify-between">
                <div><CardTitle>Run controls</CardTitle><CardDescription>Use these during arrival, then complete attendance after the Session.</CardDescription></div>
                <div className="flex min-w-0 flex-wrap items-start gap-3"><AddPersonDrawer members={members} preview={preview} sessionId={session.id} />{session.status === "scheduled" && !session.attendanceFinalizedAt ? <WalkInDrawer members={members} preview={preview} sessionId={session.id} /> : null}<Button asChild variant="outline"><a href={`/admin/export?session=${session.id}`}><Download aria-hidden="true" />Export roster</a></Button>{session.attendanceFinalizedAt ? <ReopenAttendanceButton sessionId={session.id} /> : <FinalizeAttendanceButton action={finalizeAttendanceAction.bind(null, session.id)} canFinalize={session.endsAt <= new Date()} finalized={false} remainingCount={expectedBookings.length} />}</div>
              </CardHeader>
              <CardContent>
              {session.status === "scheduled" ? <div className="grid gap-5 md:grid-cols-[auto_minmax(0,1fr)]"><Image alt={`QR code for ${session.className} check-in`} className="size-36 rounded-lg border bg-white p-2" height={144} src={checkInQrCode} unoptimized width={144} /><div><div className="flex items-center gap-2"><QrCode aria-hidden="true" className="size-4 text-muted-foreground" /><h3 className="font-semibold">QR check-in</h3></div><p className="mt-2 text-sm text-muted-foreground">Open {session.checkInOpensAt ? timeFormatter.format(session.checkInOpensAt) : "at the scheduled time"}–{session.checkInClosesAt ? timeFormatter.format(session.checkInClosesAt) : "until the Session ends"}. Show or project this code for self check-in.</p><Button asChild className="mt-2 px-0" variant="link"><a href={checkInUrl} target="_blank">Open check-in link</a></Button></div></div> : <Alert variant="destructive"><AlertDescription>This Session is cancelled. Roster and export remain available; live check-in is unavailable.</AlertDescription></Alert>}
              </CardContent>
            </Card>

            <section className="mt-8" aria-labelledby="readiness-heading">
              <div className="flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-xl font-semibold tracking-tight" id="readiness-heading">Session readiness</h2><p className="mt-1 text-sm text-muted-foreground">Resolve practical and communication gaps before people arrive.</p></div>{session.failedNotificationCount > 0 && !preview ? <RetryNotificationsButton action={retryFailedNotificationsAction.bind(null, session.id)} /> : null}</div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">{readinessChecks.map((check) => <Card className={check.ready ? "border-border" : "border-amber-500/50 bg-amber-50/50"} key={check.label}><CardContent className="flex items-start gap-3 py-4">{check.ready ? <CheckCircle2 aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-emerald-600" /> : <TriangleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-amber-700" />}<div><p className="text-sm font-medium">{check.label}</p><p className="mt-1 text-xs text-muted-foreground">{check.detail}</p></div></CardContent></Card>)}</div>
            </section>

            <section className="mt-10">
              <div className="flex items-center justify-between gap-4">
                <div><h2 className="text-xl font-semibold tracking-tight">Roster board</h2><p className="mt-1 text-sm text-muted-foreground">People are separated by their current operational state.</p></div>
              </div>
              <nav aria-label="Session bookings" className="mt-6 overflow-x-auto" role="tablist">
                <div className="inline-flex min-w-max justify-start gap-1 rounded-lg bg-muted p-1">
                  {[
                    { id: "expected" as const, label: "Expected", count: expectedBookings.length },
                    { id: "checked-in" as const, label: "Checked in", count: checkedInBookings.length },
                    { id: "waitlist" as const, label: "Waitlist", count: roster.waitlist.length },
                    { id: "cancelled" as const, label: "Cancelled", count: cancelledBookings.length },
                    { id: "no-show" as const, label: "No shows", count: noShowBookings.length },
                  ].map((tab) => (
                    <Link
                      aria-selected={activeTab === tab.id}
                      className={cn("rounded-md px-3 py-1.5 text-left text-sm font-medium no-underline", activeTab === tab.id ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground")}
                      href={rosterHref(session.id, tab.id, preview)}
                      key={tab.id}
                      role="tab"
                    >
                      {tab.label} <span className="tabular-nums">{tab.count}</span>
                    </Link>
                  ))}
                </div>
              </nav>
              <Card className="mt-6 py-0">
                <Table className="min-w-150">
                  <TableHeader><TableRow><TableHead>Person</TableHead><TableHead>Contact</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Action</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {activeTab === "waitlist" ? roster.waitlist.map((person) => (
                      <TableRow key={person.id}><TableCell className="font-medium"><Link className="hover:underline" href={memberHref(person.personId, preview)}>{person.name}</Link></TableCell><TableCell className="text-muted-foreground">{person.mobile} · {person.email ?? "No login email"}</TableCell><TableCell><Badge variant="secondary">Waiting</Badge></TableCell><TableCell className="text-right">{preview ? null : <WaitlistActions entryId={person.id} name={person.name} />}</TableCell></TableRow>
                    )) : displayedBookings.map((booking) => (
                      <TableRow key={booking.bookingId}>
                        <TableCell className="font-medium"><Link className="hover:underline" href={memberHref(booking.personId, preview)}>{booking.name}</Link></TableCell>
                        <TableCell className="text-muted-foreground">{booking.mobile} · {booking.email ?? "No login email"}</TableCell>
                        <TableCell><Badge variant={booking.status === "cancelled" || booking.status === "no_show" ? "destructive" : "secondary"}>{booking.status === "confirmed" ? "Expected" : booking.status === "attended" ? "Checked in" : booking.status === "cancelled" ? "Cancelled" : "No show"}</Badge></TableCell>
                        <TableCell className="text-right">{preview ? <ManualCheckInButton bookingId={booking.bookingId} name={booking.name} preview status={booking.status} transferTargets={transferTargets} /> : <ManualCheckInButton bookingId={booking.bookingId} name={booking.name} status={booking.status} transferTargets={transferTargets} />}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
              {(activeTab === "waitlist" ? roster.waitlist : displayedBookings).length === 0 ? <p className="py-10 text-center text-sm text-muted-foreground">No {activeTab === "expected" ? "people are expected" : activeTab === "checked-in" ? "one has checked in" : activeTab === "waitlist" ? "one is waiting" : activeTab === "cancelled" ? "cancelled bookings" : "no shows"} for this Session.</p> : null}
            </section>
          </div>
    </AdminShell>
  );
}
