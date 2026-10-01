import Link from "next/link";
import type { Metadata } from "next";
import { CalendarPlus, CheckCircle2, Clock3, MapPin } from "lucide-react";

import Container from "../components/Container";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import ScheduleList from "./ScheduleList";
import { getCurrentUser } from "../../lib/auth/user";
import { listBookingsForAuthSubject, listWaitlistForAuthSubject } from "../../lib/db/repositories/bookings";
import { listUpcomingPublicSessions } from "../../lib/db/repositories/sessions";
import { SESSION_TIME_ZONE } from "../../lib/session-time";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Learning Labs: Classes | Strictly Students",
  description: "A few hours where we dive into the deeper questions of God, relationship, and life.",
};

type ClassesPageProps = {
  searchParams: Promise<{ booking?: string; resume?: string; session?: string; waitlist?: string }>;
};

const receiptDateFormatter = new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long", timeZone: SESSION_TIME_ZONE });
const receiptTimeFormatter = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: SESSION_TIME_ZONE });

/**
 * THESIS: A member can scan every upcoming Class and join the one that fits their week.
 * OWN-WORLD: Strictly Students’ warm neutral base, quiet record cards, and bold display type.
 * STORY: Time leads each card, followed by the Class, location, and a single clear booking action.
 * FIRST VIEWPORT: A quiet neutral field establishes the invitation; the first upcoming Class and its action follow directly below.
 * FORM: Chronological booking feed — one card per Session, without course-level grouping.
 */
export default async function ClassesPage({ searchParams }: ClassesPageProps) {
  const user = await getCurrentUser();
  const [sessions, params, bookings, waitlist] = await Promise.all([
    listUpcomingPublicSessions(),
    searchParams,
    user ? listBookingsForAuthSubject(user.id) : Promise.resolve([]),
    user ? listWaitlistForAuthSubject(user.id) : Promise.resolve([]),
  ]);
  const bookingIdsBySessionId = Object.fromEntries(
    bookings
      .filter((booking) => booking.status === "confirmed")
      .map((booking) => [booking.sessionId, booking.id]),
  );
  const waitlistIdsBySessionId = Object.fromEntries(waitlist.map((entry) => [entry.sessionId, entry.id]));
  const receiptSession = sessions.find((session) => session.id === params.session);
  const hasBookingConfirmation = params.booking === "confirmed" && receiptSession && bookingIdsBySessionId[receiptSession.id];
  const hasWaitlistConfirmation = params.waitlist === "confirmed" && receiptSession && waitlistIdsBySessionId[receiptSession.id];
  const resumeSessionId = sessions.some((session) => session.id === params.resume) ? params.resume : undefined;

  return (
    <>
      <Navbar userEmail={user?.email} />
      <main className="overflow-hidden bg-white pb-20">
        <section className="bg-white">
          <Container className="pt-14 md:pt-20">
            <div className="flex flex-col items-center justify-center gap-9 border-b border-black/10 pb-14 text-center md:pb-20">
              <div className="max-w-3xl">
                <h1 className="font-heading text-5xl leading-[0.9] tracking-[-0.04em] text-[#292823] md:text-6xl">
                  Learning Labs: Classes
                </h1>
                <p className="mx-auto mt-5 max-w-2xl text-sm leading-5 md:text-lg md:leading-7">
                  Learning Labs is our rhythm of eating together, learning together, and making space for the deeper questions of God, relationship, and life.
                </p>
              </div>
            </div>
          </Container>
        </section>

        <Container className="pt-14 md:pt-20">
          {(hasBookingConfirmation || hasWaitlistConfirmation) && receiptSession ? <section className="mb-12 rounded-2xl bg-[#dce8c6] p-6 text-[#273022] md:p-8" role="status">
            <CheckCircle2 aria-hidden="true" className="size-7" />
            <h2 className="mt-4 font-heading text-3xl leading-none tracking-[-0.03em]">{hasBookingConfirmation ? "Your place is confirmed." : "You’re on the waitlist."}</h2>
            <p className="mt-3 max-w-2xl leading-7">{hasBookingConfirmation ? "We’ll send essential updates by email. You can manage or cancel this booking from your dashboard." : "This is not a confirmed place yet. We’ll email you if one opens, so keep an eye on your inbox."}</p>
            <p className="mt-5 font-bold">{receiptSession.className}</p>
            <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2 text-sm"><span className="inline-flex items-center gap-2"><Clock3 aria-hidden="true" className="size-4" />{receiptDateFormatter.format(receiptSession.startsAt)} · {receiptTimeFormatter.format(receiptSession.startsAt)}–{receiptTimeFormatter.format(receiptSession.endsAt)}</span><span className="inline-flex items-center gap-2"><MapPin aria-hidden="true" className="size-4" />{receiptSession.location || "Location to be confirmed"}</span></div>
            <div className="mt-6 flex flex-wrap gap-3"><Link className="inline-flex min-h-11 items-center rounded-full bg-[#273022] px-5 text-sm font-bold text-white" href="/dashboard">View my classes</Link>{hasBookingConfirmation ? <a className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[#273022]/25 px-5 text-sm font-bold" href={`/api/calendar/session/${receiptSession.id}`}><CalendarPlus aria-hidden="true" className="size-4" />Add to calendar</a> : null}</div>
          </section> : null}

          <div className="mb-9 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              {user ? <p className="mb-3 text-sm font-semibold text-[#292823]">Welcome back, {user.email}</p> : null}
              <h2 className="font-heading text-4xl leading-none tracking-[-0.03em] text-[#292823] md:text-5xl">
                Upcoming Classes
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-black/60">Book the individual Session that fits your week. Returning for a full series helps your group go deeper, but each date is reserved separately.</p>
            </div>
            <Link className="text-sm font-semibold text-[#292823] underline decoration-1 underline-offset-4 hover:text-black/65 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#292823]" href="/dashboard">
              My Classes
            </Link>
          </div>

          <ScheduleList bookingIdsBySessionId={bookingIdsBySessionId} resumeSessionId={resumeSessionId} sessions={sessions} waitlistIdsBySessionId={waitlistIdsBySessionId} />

        </Container>

        <section aria-labelledby="what-we-do-heading" className="mt-16 bg-[#f7f4ed] md:mt-24">
          <Container className="py-14 md:py-20">
            <div className="grid gap-10 lg:grid-cols-[minmax(15rem,0.8fr)_minmax(0,2fr)] lg:gap-16">
              <h2 className="font-heading text-4xl leading-[0.92] tracking-[-0.035em] text-[#292823] md:text-5xl" id="what-we-do-heading">What happens in a Class?</h2>
              <div className="divide-y divide-black/10">
                <article className="grid gap-4 pb-7 md:grid-cols-[12rem_1fr] md:gap-8 md:pb-8"><h3 className="font-heading text-2xl leading-[0.95] tracking-[-0.025em] text-[#292823]">Eat Together</h3><p className="max-w-2xl text-sm leading-6 md:text-lg md:leading-7">We gather around the table to eat together and talk to each other. Sometimes a few of us whip up something for the rest, but most of the time we grab food together.</p></article>
                <article className="grid gap-4 py-7 md:grid-cols-[12rem_1fr] md:gap-8 md:py-8"><h3 className="font-heading text-2xl leading-[0.95] tracking-[-0.025em] text-[#292823]">Learn Together</h3><p className="max-w-2xl text-sm leading-6 md:text-lg md:leading-7">We learn about a practice from the way of Jesus and discuss what it is like for us after trying it out. We stay with the same small group across a series, so it gets less awkward and more honest over time.</p></article>
              </div>
            </div>
          </Container>
        </section>
      </main>
      <div className="bg-white">
        <Footer />
      </div>
    </>
  );
}
