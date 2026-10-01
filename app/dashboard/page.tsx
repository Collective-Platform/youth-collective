import Link from "next/link";
import type { Metadata } from "next";
import { ArrowUpRight, BookOpen, CalendarDays, CalendarPlus, Check, Circle, CircleHelp, CircleX, Clock3, LayoutDashboard, MapPin, UserRound } from "lucide-react";

import Container from "../components/Container";
import Navbar from "../components/Navbar";
import CancelBookingButton from "./CancelBookingButton";
import EmailOtpForm from "./EmailOtpForm";
import LeaveWaitlistButton from "./LeaveWaitlistButton";
import ProfileForm from "./ProfileForm";
import { getCurrentUser } from "../../lib/auth/user";
import { listBookingsForAuthSubject, listSeriesSessionsForClassIds, listWaitlistForAuthSubject, type MemberBooking, type MemberSeriesSession, type MemberWaitlist } from "../../lib/db/repositories/bookings";
import { findPersonProfileForUserAccount } from "../../lib/db/repositories/people";
import { listMemberRegistrationsForEmail, type MemberRegistration } from "../../lib/member-registrations";
import { SESSION_TIME_ZONE } from "../../lib/session-time";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dashboard | Strictly Students",
  description: "See what is next, your Learning Labs commitments, and your participation record.",
};

const dateFormatter = new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long", timeZone: SESSION_TIME_ZONE });
const shortDateFormatter = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: SESSION_TIME_ZONE });
const timeFormatter = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: SESSION_TIME_ZONE });
const dayNumberFormatter = new Intl.DateTimeFormat("en-GB", { day: "2-digit", timeZone: SESSION_TIME_ZONE });
const monthFormatter = new Intl.DateTimeFormat("en-GB", { month: "short", timeZone: SESSION_TIME_ZONE });

const bookingStatusLabel: Record<MemberBooking["status"], string> = { confirmed: "Booked", cancelled: "Cancelled", attended: "Attended", no_show: "No show" };
const bookingStatusClasses: Record<MemberBooking["status"], string> = {
  confirmed: "bg-black text-white",
  cancelled: "bg-neutral-200 text-black",
  attended: "bg-neutral-800 text-white",
  no_show: "bg-neutral-300 text-black",
};

type NextStep = { kind: "booking"; booking: MemberBooking; checkInOpen: boolean } | { kind: "registration-action"; registration: MemberRegistration } | null;
type StoryEntry = { kind: "booking"; date: Date; booking: MemberBooking } | { kind: "registration"; date: Date; registration: MemberRegistration };
type SessionStatus = "attended" | "booked" | "cancelled" | "no_show" | "not_booked" | "unknown";
type SeriesSession = MemberSeriesSession & { status: SessionStatus };
type SeriesProgress = { id: string; title: string; sessions: SeriesSession[]; attendedCount: number; nextSession?: SeriesSession };

function getFirstName(name: string) {
  return name.trim().split(/\s+/)[0] || "there";
}

const dashboardLinks = [
  { href: "#next-up", label: "Overview", icon: LayoutDashboard },
  { href: "#right-now", label: "Bookings", icon: CalendarDays },
  { href: "#learning-record", label: "Learning record", icon: BookOpen },
  { href: "#your-details", label: "My details", icon: UserRound },
];

function DashboardNavigation({ compact = false }: { compact?: boolean }) {
  return <nav aria-label="Dashboard sections" className={compact ? "flex gap-2 overflow-x-auto pb-1 text-sm font-semibold" : "mt-8 grid gap-1"}>
    {dashboardLinks.map(({ href, label, icon: Icon }, index) => <a className={compact ? `inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border px-4 transition-colors focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-[#625e85]/50 ${index === 0 ? "border-[#dce8c6] bg-[#dce8c6] text-[#273022]" : "border-black/15 bg-white text-black hover:bg-black/5"}` : `flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-semibold transition-colors focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-[#625e85]/50 ${index === 0 ? "bg-[#dce8c6] text-[#273022]" : "text-black/65 hover:bg-black/5 hover:text-black"}`} href={href} key={href}><Icon aria-hidden="true" className="size-4" />{label}</a>)}
  </nav>;
}

function DashboardRail({ email, name }: { email: string; name: string }) {
  const firstName = getFirstName(name);
  return <aside className="hidden lg:sticky lg:top-24 lg:flex lg:self-start lg:flex-col lg:overflow-hidden lg:rounded-xl lg:border lg:border-black/10 lg:bg-white">
    <div className="bg-[#2e302e] px-5 py-6 text-white"><span className="grid size-12 place-items-center rounded-full bg-[#dce8c6] font-heading text-xl text-[#273022]">{firstName.slice(0, 1).toUpperCase()}</span><p className="mt-5 font-heading text-2xl tracking-[-0.03em]">{firstName}</p><p className="mt-2 break-all text-sm leading-5 text-white/65">{email}</p></div>
    <div className="p-3"><p className="px-3 pt-1 text-xs font-extrabold uppercase tracking-[0.12em] text-black/45">Dashboard</p><DashboardNavigation /></div>
    <Link className="mx-4 mb-5 mt-1 inline-flex min-h-11 items-center gap-2 border-t border-black/10 pt-5 text-sm font-semibold text-black/70 underline decoration-black/20 underline-offset-4 transition-colors hover:text-black focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-[#625e85]/50" href="/classes">Explore Classes <ArrowUpRight aria-hidden="true" className="size-4" /></Link>
  </aside>;
}

function BookingStatus({ status }: { status: MemberBooking["status"] }) {
  return <span className={`inline-flex min-h-7 items-center rounded-full px-3 text-xs font-extrabold tracking-[0.01em] ${bookingStatusClasses[status]}`}>{status === "attended" ? <Check aria-hidden="true" className="mr-1 size-3.5 stroke-[3]" /> : null}{bookingStatusLabel[status]}</span>;
}

function RegistrationStatus({ registration }: { registration: MemberRegistration }) {
  const statusClasses = {
    "Payment confirmed": "bg-black text-white",
    "Payment plan active": "bg-neutral-800 text-white",
    "Payment pending": "bg-neutral-200 text-black",
    "Payment needs attention": "bg-neutral-300 text-black",
  } as const;

  return <span className={`inline-flex min-h-7 items-center rounded-full px-3 text-xs font-extrabold ${statusClasses[registration.paymentLabel]}`}>{registration.paymentLabel}</span>;
}

function BookingDate({ startsAt, compact = false }: { startsAt: Date; compact?: boolean }) {
  return <div className={`flex shrink-0 flex-col items-center justify-center ${compact ? "h-14 w-14 rounded-xl bg-neutral-200" : "h-[5.75rem] w-[5.75rem] rounded-xl bg-white text-black"}`}><span className={`${compact ? "text-[0.65rem]" : "text-xs"} font-extrabold uppercase tracking-[0.13em]`}>{monthFormatter.format(startsAt)}</span><span className={`${compact ? "text-2xl" : "font-heading text-4xl"} leading-none tracking-[-0.04em]`}>{dayNumberFormatter.format(startsAt)}</span></div>;
}

function getNextStep(bookings: MemberBooking[], registrations: MemberRegistration[], now: Date): NextStep {
  const registrationAction = registrations.find((registration) => registration.paymentLabel === "Payment needs attention" || registration.paymentLabel === "Payment pending");
  if (registrationAction) return { kind: "registration-action", registration: registrationAction };
  const isCheckInOpen = (booking: MemberBooking) => Boolean(booking.checkInOpensAt && booking.checkInClosesAt && now >= booking.checkInOpensAt && now <= booking.checkInClosesAt);
  const booked = bookings.filter((booking) => booking.status === "confirmed");
  const readyToCheckIn = booked.filter(isCheckInOpen).toSorted((left, right) => left.startsAt.getTime() - right.startsAt.getTime())[0];
  if (readyToCheckIn) return { kind: "booking", booking: readyToCheckIn, checkInOpen: true };
  const upcomingBooking = booked.filter((booking) => booking.startsAt >= now).toSorted((left, right) => left.startsAt.getTime() - right.startsAt.getTime())[0];
  if (upcomingBooking) return { kind: "booking", booking: upcomingBooking, checkInOpen: false };
  const recentlyAttended = bookings.filter((booking) => booking.status === "attended" && booking.endsAt >= new Date(now.getTime() - 12 * 60 * 60 * 1000)).toSorted((left, right) => right.startsAt.getTime() - left.startsAt.getTime())[0];
  return recentlyAttended ? { kind: "booking", booking: recentlyAttended, checkInOpen: false } : null;
}

function CourseName({ courseName }: { courseName: string }) {
  return <p className="mt-2 text-xs font-bold uppercase tracking-[0.12em] text-current/65">{courseName}</p>;
}

function NextUp({ nextStep }: { nextStep: NextStep }) {
  if (!nextStep) {
    return <section id="next-up" className="scroll-mt-6 rounded-xl border border-black/15 bg-white px-6 py-10 text-center md:px-10"><CalendarDays aria-hidden="true" className="mx-auto size-8" /><h2 className="mt-5 font-heading text-3xl leading-none tracking-[-0.03em] text-black">Your next step starts here.</h2><p className="mx-auto mt-3 max-w-lg leading-7 text-black/65">Choose a Learning Lab when you&apos;re ready. Your upcoming places and registrations will stay together here.</p><Link className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full bg-black px-5 text-sm font-semibold text-white transition-colors hover:bg-black/75 focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-black/30" href="/classes">Explore Classes <ArrowUpRight aria-hidden="true" className="size-4" /></Link></section>;
  }

  if (nextStep.kind === "registration-action") {
    const { registration } = nextStep;
    return <section id="next-up" className="scroll-mt-6 rounded-xl bg-neutral-900 px-6 py-10 text-center text-white md:px-10"><RegistrationStatus registration={registration} /><h2 className="mt-4 font-heading text-3xl leading-[0.95] tracking-[-0.03em] md:text-4xl">{registration.title}</h2><p className="mt-3 text-base font-semibold text-white/80">{registration.dates}</p><p className="mx-auto mt-4 max-w-xl leading-7 text-white/70">{registration.paymentDetail ?? "Your registration needs a quick check before the programme."}</p><Link className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-5 text-sm font-semibold text-black transition-colors hover:bg-neutral-200 focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-white/60" href={registration.href}>View registration <ArrowUpRight aria-hidden="true" className="size-4" /></Link></section>;
  }

  const { booking } = nextStep;
  const checkInHref = `/check-in/${booking.checkInToken}`;
  const checkInNote = booking.status === "attended"
    ? "This Class is saved as attended in your dashboard."
    : nextStep.checkInOpen
      ? "You can check in now."
      : booking.checkInOpensAt
        ? `Check-in opens ${dateFormatter.format(booking.checkInOpensAt)} at ${timeFormatter.format(booking.checkInOpensAt)}.`
        : "Check-in timing will be shared by the team.";
  return <section id="next-up" className="scroll-mt-6 rounded-xl bg-black px-6 py-10 text-center text-white md:px-10"><div className="flex flex-col items-center"><BookingDate startsAt={booking.startsAt} /><CourseName courseName={booking.courseName} /><h2 className="mt-3 font-heading text-3xl leading-[0.95] tracking-[-0.03em] md:text-4xl">{booking.className}</h2><p className="mt-3 text-sm font-semibold text-white/75">{dateFormatter.format(booking.startsAt)} · {timeFormatter.format(booking.startsAt)}–{timeFormatter.format(booking.endsAt)}</p><p className="mt-2 flex items-center gap-2 text-sm text-white/70"><MapPin aria-hidden="true" className="size-4" />{booking.location || "Location to be confirmed"}</p><div className="mt-4"><BookingStatus status={booking.status} /></div><p className="mt-4 text-sm font-semibold text-white/75">{checkInNote}</p></div>{booking.status === "confirmed" ? <div className="mx-auto mt-7 flex max-w-lg flex-col gap-3 border-t border-white/20 pt-5">{nextStep.checkInOpen ? <Link className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#c1fe01] px-5 text-sm font-bold text-black transition-colors hover:bg-white focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-white/60" href={checkInHref}>Check in</Link> : null}<CancelBookingButton bookingId={booking.id} inverted /></div> : null}</section>;
}

function CurrentBooking({ booking }: { booking: MemberBooking }) {
  return <article className="grid gap-4 border-b border-black/10 py-5 text-left last:border-b-0 sm:grid-cols-[3.5rem_minmax(0,1fr)_auto] sm:items-center"><BookingDate compact startsAt={booking.startsAt} /><div className="min-w-0"><CourseName courseName={booking.courseName} /><div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-2"><h3 className="font-heading text-xl leading-none tracking-[-0.03em] text-black">{booking.className}</h3><BookingStatus status={booking.status} /></div><p className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-sm font-medium text-black/65"><span className="inline-flex items-center gap-1.5"><Clock3 aria-hidden="true" className="size-3.5" />{dateFormatter.format(booking.startsAt)} · {timeFormatter.format(booking.startsAt)}–{timeFormatter.format(booking.endsAt)}</span>{booking.location ? <span className="inline-flex items-center gap-1.5"><MapPin aria-hidden="true" className="size-3.5" />{booking.location}</span> : null}</p></div>{booking.status === "confirmed" ? <div className="sm:text-right"><a className="inline-flex min-h-10 items-center gap-1.5 text-sm font-semibold underline underline-offset-4 hover:text-black/60" href={`/api/calendar/session/${booking.sessionId}`}><CalendarPlus aria-hidden="true" className="size-4" />Add to calendar</a><CancelBookingButton bookingId={booking.id} className={booking.className} /></div> : null}</article>;
}

function CurrentWaitlist({ entry }: { entry: MemberWaitlist }) {
  return <article className="grid gap-4 border-b border-black/10 py-5 text-left last:border-b-0 sm:grid-cols-[3.5rem_minmax(0,1fr)_auto] sm:items-center"><BookingDate compact startsAt={entry.startsAt} /><div><CourseName courseName={entry.courseName} /><div className="mt-1 flex flex-wrap items-center gap-2"><h3 className="font-heading text-xl leading-none tracking-[-0.03em]">{entry.className}</h3><span className="rounded-full bg-[#f1dfb5] px-3 py-1 text-xs font-extrabold text-[#654a10]">Waitlist</span></div><p className="mt-2 text-sm text-black/65">{dateFormatter.format(entry.startsAt)} · {timeFormatter.format(entry.startsAt)}–{timeFormatter.format(entry.endsAt)}{entry.location ? ` · ${entry.location}` : ""}</p><p className="mt-2 text-sm leading-5 text-black/60">We’ll email you if a place opens. This is not a confirmed booking yet.</p></div><LeaveWaitlistButton className={entry.className} waitlistEntryId={entry.id} /></article>;
}

function RightNow({ bookings, registrations, waitlist }: { bookings: MemberBooking[]; registrations: MemberRegistration[]; waitlist: MemberWaitlist[] }) {
  return <section id="right-now" className="scroll-mt-6 mt-12 border-t border-black/15 pt-8 text-left"><h2 className="font-heading text-3xl leading-none tracking-[-0.03em] text-black">Right now</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-black/60">The Learning Labs you&apos;re part of and the details that matter next.</p><Link className="mt-4 inline-flex items-center gap-1 text-sm font-semibold underline decoration-1 underline-offset-4 hover:text-black/60 focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-black/30" href="/classes">Find a Class <ArrowUpRight aria-hidden="true" className="size-3.5" /></Link><div className={`mt-6 grid gap-5 ${registrations.length > 0 ? "lg:grid-cols-2" : ""}`}><section className="rounded-xl border border-black/10 bg-white p-6 text-center md:p-7"><p className="text-sm font-semibold text-black/65">Confirmed Classes</p>{bookings.length > 0 ? <ul className="mt-3 list-none text-left">{bookings.map((booking) => <CurrentBooking booking={booking} key={booking.id} />)}</ul> : <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-black/60">No upcoming Classes yet. When you book one, its date and practical details will appear here.</p>}{waitlist.length > 0 ? <div className="mt-7 border-t border-black/10 pt-6"><p className="text-sm font-semibold text-black/65">Waitlists</p><ul className="mt-3 list-none text-left">{waitlist.map((entry) => <CurrentWaitlist entry={entry} key={entry.id} />)}</ul></div> : null}</section>{registrations.length > 0 ? <section className="rounded-xl border border-black/10 bg-white p-6 text-center md:p-7"><p className="text-sm font-semibold text-black/65">Experience</p><div className="mt-4 space-y-5 text-left">{registrations.map((registration) => <article key={registration.id}><div className="flex flex-wrap items-center gap-3"><h3 className="font-heading text-2xl leading-none tracking-[-0.03em] text-black">{registration.title}</h3><RegistrationStatus registration={registration} /></div><p className="mt-3 text-sm font-semibold text-black/65">{registration.dates}</p>{registration.paymentDetail ? <p className="mt-2 text-sm leading-6 text-black/60">{registration.paymentDetail}</p> : null}<Link className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-full bg-black px-4 text-sm font-semibold text-white no-underline transition-colors hover:bg-black/75 focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-black/30" href={registration.href}>View registration <ArrowUpRight aria-hidden="true" className="size-4" /></Link></article>)}</div></section> : null}</div></section>;
}

function getStoryEntries(bookings: MemberBooking[], registrations: MemberRegistration[]): StoryEntry[] {
  return [...bookings.map((booking) => ({ kind: "booking" as const, date: booking.startsAt, booking })), ...registrations.map((registration) => ({ kind: "registration" as const, date: registration.startsAt, registration }))].toSorted((left, right) => right.date.getTime() - left.date.getTime());
}

const sessionStatusMeta: Record<SessionStatus, { label: string; classes: string; Icon: typeof Check }> = {
  attended: { label: "Attended", classes: "border-[#625e85]/25 bg-[#efedf6] text-[#4f4a75]", Icon: Check },
  booked: { label: "Booked", classes: "border-[#cadab0] bg-[#dce8c6] text-[#273022]", Icon: CalendarDays },
  cancelled: { label: "Cancelled", classes: "border-black/15 bg-neutral-100 text-black/70", Icon: CircleX },
  no_show: { label: "No show", classes: "border-[#e6bac7] bg-[#f8e8ed] text-[#9e4059]", Icon: CircleX },
  not_booked: { label: "Not booked", classes: "border-dashed border-black/20 bg-white text-black/55", Icon: Circle },
  unknown: { label: "Unknown", classes: "border-black/15 bg-neutral-100 text-black/60", Icon: CircleHelp },
};

function getSeriesProgress(bookings: MemberBooking[], sessions: MemberSeriesSession[], now: Date): SeriesProgress[] {
  const bookingsBySessionId = new Map(bookings.map((booking) => [booking.sessionId, booking]));
  const seriesByClassId = new Map<string, SeriesProgress>();

  for (const session of sessions) {
    const booking = bookingsBySessionId.get(session.id);
    const status: SessionStatus = booking ? (booking.status === "confirmed" ? "booked" : booking.status) : "not_booked";
    const series = seriesByClassId.get(session.classId) ?? { id: session.classId, title: session.seriesName, sessions: [], attendedCount: 0 };
    const seriesSession = { ...session, status };
    series.sessions.push(seriesSession);
    if (status === "attended") series.attendedCount += 1;
    seriesByClassId.set(session.classId, series);
  }

  return [...seriesByClassId.values()].map((series) => ({ ...series, sessions: series.sessions.toSorted((left, right) => left.startsAt.getTime() - right.startsAt.getTime()), nextSession: series.sessions.find((session) => session.status === "booked" && session.startsAt >= now) })).toSorted((left, right) => {
    const leftDate = left.nextSession?.startsAt ?? left.sessions.at(-1)?.startsAt;
    const rightDate = right.nextSession?.startsAt ?? right.sessions.at(-1)?.startsAt;
    return (rightDate?.getTime() ?? 0) - (leftDate?.getTime() ?? 0);
  });
}

function SessionTile({ session }: { session: SeriesSession }) {
  const { label, classes, Icon } = sessionStatusMeta[session.status];
  return <li className={`min-w-24 rounded-lg border p-3 ${classes}`}><time className="block text-xs font-extrabold uppercase tracking-[0.1em]" dateTime={session.startsAt.toISOString()}>{shortDateFormatter.format(session.startsAt)}</time><Icon aria-hidden="true" className="mt-3 size-4 stroke-[2.5]" /><span className="mt-2 block text-xs font-bold leading-4">{label}</span></li>;
}

function SeriesCard({ series }: { series: SeriesProgress }) {
  const isComplete = series.sessions.length > 0 && series.attendedCount === series.sessions.length;
  return <article className="rounded-xl border border-black/10 bg-white p-5 text-left md:p-6"><div className="flex flex-wrap items-start justify-between gap-x-5 gap-y-3"><div><h3 className="font-heading text-2xl leading-none tracking-[-0.03em] text-black">{series.title}</h3><p className="mt-2 text-sm font-semibold text-[#4f4a75]">{series.attendedCount} of {series.sessions.length} {series.sessions.length === 1 ? "session" : "sessions"} attended{isComplete ? " · Complete for now" : ""}</p></div>{series.nextSession ? <p className="rounded-full bg-[#dce8c6] px-3 py-1.5 text-xs font-extrabold text-[#273022]">Next: {shortDateFormatter.format(series.nextSession.startsAt)}</p> : null}</div><ul aria-label={`${series.title} session progress`} className="mt-5 flex gap-2 overflow-x-auto pb-1">{series.sessions.map((session) => <SessionTile key={session.id} session={session} />)}</ul></article>;
}

function RecentActivity({ entries }: { entries: StoryEntry[] }) {
  if (entries.length === 0) return null;
  return <div className="mt-10 border-t border-black/10 pt-7 text-left"><h3 className="font-heading text-2xl leading-none tracking-[-0.03em] text-black">Recent activity</h3><ol className="mt-5 list-none border-l border-black/15 pl-5">{entries.map((entry) => <li className="relative pb-6 last:pb-0" key={entry.kind === "booking" ? `booking-${entry.booking.id}` : `registration-${entry.registration.id}`}><span aria-hidden="true" className="absolute -left-[1.56rem] top-1.5 size-2.5 rounded-full border-2 border-white bg-[#625e85]" />{entry.kind === "booking" ? <article><p className="text-xs font-bold uppercase tracking-[0.08em] text-black/55">{shortDateFormatter.format(entry.booking.startsAt)}</p><div className="mt-1 flex flex-wrap items-center gap-2"><h4 className="font-semibold text-black">{entry.booking.className}</h4><BookingStatus status={entry.booking.status} /></div><p className="mt-1 text-sm text-black/60">{entry.booking.courseName}</p></article> : <article><p className="text-xs font-bold uppercase tracking-[0.08em] text-black/55">{entry.registration.dates}</p><div className="mt-1 flex flex-wrap items-center gap-2"><h4 className="font-semibold text-black">{entry.registration.title}</h4><RegistrationStatus registration={entry.registration} /></div><p className="mt-1 text-sm text-black/60">Experience registration</p></article>}</li>)}</ol></div>;
}

function YourLearningRecord({ series, entries }: { series: SeriesProgress[]; entries: StoryEntry[] }) {
  return <section id="learning-record" className="scroll-mt-6 mt-12 border-t border-black/15 pt-8 text-left"><h2 className="font-heading text-3xl leading-none tracking-[-0.03em] text-black">Your Learning Record</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-black/60">See your Classes as a journey, one series at a time.</p><div className="mt-6 max-w-3xl text-left"><h3 className="font-heading text-2xl leading-none tracking-[-0.03em] text-black">Series progress</h3>{series.length > 0 ? <div className="mt-5 space-y-4">{series.map((item) => <SeriesCard key={item.id} series={item} />)}</div> : <div className="mt-5 rounded-xl border border-dashed border-black/20 bg-white px-6 py-8"><p className="font-semibold text-black">Your learning record will grow here.</p><p className="mt-2 max-w-xl text-sm leading-6 text-black/60">When you join a Class, its sessions and your progress will appear here.</p><Link className="mt-4 inline-flex items-center gap-1 text-sm font-semibold underline decoration-1 underline-offset-4 hover:text-black/60 focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-black/30" href="/classes">Explore Classes <ArrowUpRight aria-hidden="true" className="size-3.5" /></Link></div>}<RecentActivity entries={entries} /></div></section>;
}

function SignInPanel({ returnTo }: { returnTo: string }) {
  return <section className="mx-auto max-w-3xl bg-white px-6 py-10 text-center md:px-10 md:py-12"><EmailOtpForm returnTo={returnTo} /></section>;
}

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ next?: string; cancelled?: string; waitlistLeft?: string }> }) {
  const params = await searchParams;
  const returnTo = params.next?.startsWith("/") && !params.next.startsWith("//") ? params.next : "/dashboard";
  const hasCancellationConfirmation = params.cancelled === "1";
  const user = await getCurrentUser();

  if (!user) return <><Navbar /><main className="min-h-[70vh] py-16 md:py-24"><Container className="text-center"><SignInPanel returnTo={returnTo} /></Container></main></>;

  const profile = await findPersonProfileForUserAccount(user.id);
  if (!profile) return <><Navbar userEmail={user.email} /><main className="min-h-[70vh] py-16 md:py-24"><Container className="text-center"><h1 className="mx-auto max-w-3xl font-heading text-5xl leading-[0.9] tracking-[-0.04em] text-black md:text-7xl">Start your dashboard.</h1><section className="mx-auto mt-10 max-w-3xl bg-white px-6 py-9 md:px-10 md:py-11"><p className="mb-5 text-sm font-bold text-black/65">Signed in as {user.email}</p><p className="mx-auto max-w-2xl text-lg leading-8 text-black/75">Add the details we need to hold your place and send essential updates. Guardian information is not collected.</p><ProfileForm next={returnTo} /></section></Container></main></>;

  const [bookings, registrations, waitlist] = await Promise.all([listBookingsForAuthSubject(user.id), listMemberRegistrationsForEmail(user.email), listWaitlistForAuthSubject(user.id)]);
  const now = new Date();
  const seriesSessions = await listSeriesSessionsForClassIds([...new Set(bookings.map((booking) => booking.classId))]);
  const upcomingBookings = bookings.filter((booking) => booking.status === "confirmed" && booking.startsAt >= now).toSorted((left, right) => left.startsAt.getTime() - right.startsAt.getTime());
  const nextStep = getNextStep(bookings, registrations, now);
  const storyEntries = getStoryEntries(bookings.filter((booking) => booking.startsAt < now || booking.status !== "confirmed"), registrations);
  const seriesProgress = getSeriesProgress(bookings, seriesSessions, now);

  return <><Navbar userEmail={user.email} /><main className="min-h-[calc(100vh-5rem)] py-6 md:py-10"><Container><div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[15.5rem_minmax(0,1fr)] lg:items-start lg:gap-10"><DashboardRail email={user.email} name={profile.name} /><div className="min-w-0">{hasCancellationConfirmation ? <p className="mb-6 rounded-xl border border-[#cadab0] bg-[#e4eddc] px-5 py-4 text-sm font-semibold text-[#334230]" role="status">Your Class booking has been cancelled.</p> : null}{params.waitlistLeft === "1" ? <p className="mb-6 rounded-xl border border-[#cadab0] bg-[#e4eddc] px-5 py-4 text-sm font-semibold text-[#334230]" role="status">You’ve left the waitlist.</p> : null}<header className="border-b border-black/15 pb-7 text-center lg:text-left"><div className="flex items-center gap-4 lg:hidden"><span className="grid size-11 place-items-center rounded-full bg-[#2e302e] font-heading text-lg text-white">{getFirstName(profile.name).slice(0, 1).toUpperCase()}</span><div className="min-w-0 text-left"><p className="font-heading text-2xl leading-none tracking-[-0.03em] text-black">{getFirstName(profile.name)}</p><p className="mt-1 truncate text-sm text-black/55">{user.email}</p></div></div><h1 className="mt-6 font-heading text-5xl leading-[0.92] tracking-[-0.04em] text-black md:text-6xl lg:mt-0">Welcome back, {getFirstName(profile.name)}.</h1><p className="mt-4 max-w-2xl text-base leading-7 text-black/60 lg:text-lg lg:leading-8">Your dashboard, kept clear and up to date.</p><div className="mt-6 flex justify-center lg:justify-start"><Link className="inline-flex min-h-12 items-center gap-2 rounded-full bg-[#2e302e] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#414441] focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[#625e85]/50" href="/classes">Explore Classes <ArrowUpRight aria-hidden="true" className="size-4" /></Link></div><div className="mt-7 lg:hidden"><DashboardNavigation compact /></div></header><div className="mt-8"><NextUp nextStep={nextStep} /><RightNow bookings={upcomingBookings} registrations={registrations} waitlist={waitlist} /><YourLearningRecord entries={storyEntries} series={seriesProgress} /><section id="your-details" className="mt-12 scroll-mt-6 border-t border-black/15 pt-8 text-center lg:text-left"><h2 className="font-heading text-3xl leading-none tracking-[-0.03em] text-black">Your details</h2><p className="mt-3 max-w-xl text-sm leading-6 text-black/60">Keep these details current so we can hold your place and send essential updates.</p><div className="mt-6 rounded-xl border border-black/10 bg-white p-6 md:p-8"><ProfileForm profile={profile} /></div></section></div></div></div></Container></main></>;
}
