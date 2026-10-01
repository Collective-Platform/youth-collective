import { MapPin, UsersRound } from "lucide-react";

import type { PublicSession } from "../../lib/db/repositories/sessions";
import { SESSION_TIME_ZONE } from "../../lib/session-time";
import BookingControl from "./BookingControl";

type ScheduleListProps = {
  bookingIdsBySessionId: Record<string, string>;
  resumeSessionId?: string;
  sessions: PublicSession[];
  waitlistIdsBySessionId: Record<string, string>;
};

const timeFormatter = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: SESSION_TIME_ZONE });
const dateFormatter = new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short", timeZone: SESSION_TIME_ZONE });

function lowAvailabilityLabel(availableSpaces: number) {
  if (availableSpaces === 0) return "Full — waitlist available";
  if (availableSpaces > 5) return null;
  return `${availableSpaces} ${availableSpaces === 1 ? "space" : "spaces"} left`;
}

function displayAudience(audience: string) {
  return audience.replace("College/Uni", "Campus").replace(/\s+[—-]\s+(Fridays|Sundays)$/i, "");
}

function SessionCard({ bookingId, resume, session, waitlistEntryId }: { bookingId?: string; resume: boolean; session: PublicSession; waitlistEntryId?: string }) {
  const isFull = session.availableSpaces === 0;
  const availabilityLabel = lowAvailabilityLabel(session.availableSpaces);
  return (
    <li className="bg-white px-5 py-6 text-left md:px-7 md:py-8 lg:rounded-2xl lg:border lg:border-black/10">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1"><p className="text-sm font-bold text-[#292823] md:text-base">{dateFormatter.format(session.startsAt)}</p><span aria-hidden="true">|</span><p className="text-sm font-bold text-[#292823] md:text-base">{timeFormatter.format(session.startsAt)} – {timeFormatter.format(session.endsAt)}</p></div>
      <p className="mt-4 text-xs font-bold uppercase tracking-[0.12em] text-black/50">{session.courseName}</p>
      <h3 className="mt-2 break-words text-xl font-bold leading-[1.1] tracking-[-0.03em] text-[#292823]">{session.className}</h3>
      {session.description || session.courseDescription ? <p className="mt-3 line-clamp-3 text-sm leading-6 text-black/65">{session.description || session.courseDescription}</p> : null}
      {availabilityLabel ? <p className="mt-3 text-sm font-semibold text-[#a9470f]">{availabilityLabel}</p> : null}
      <div className="mt-3 space-y-1 text-sm leading-6 text-[#292823]">
        {session.location ? <p className="flex items-start gap-2"><MapPin aria-hidden="true" className="mt-1 size-4 shrink-0" strokeWidth={1.5} />{session.location}</p> : null}
        {session.audience ? <p className="flex items-start gap-2"><UsersRound aria-hidden="true" className="mt-1 size-4 shrink-0" strokeWidth={1.5} />{displayAudience(session.audience)}</p> : null}
      </div>
      <div className="mt-5"><BookingControl audience={session.audience} bookingId={bookingId} className={session.className} endsAt={session.endsAt} isFull={isFull} location={session.location} resume={resume} sessionId={session.id} startsAt={session.startsAt} waitlistEntryId={waitlistEntryId} /></div>
    </li>
  );
}

export default function ScheduleList({ bookingIdsBySessionId, resumeSessionId, sessions, waitlistIdsBySessionId }: ScheduleListProps) {
  const upcomingSessions = sessions.toSorted((first, second) => first.startsAt.getTime() - second.startsAt.getTime());

  if (sessions.length === 0) return <div className="rounded-2xl border border-black/10 bg-[#fdfcf9] px-6 py-8 text-base leading-7 text-black/65">There are no future classes to join right now; please check back soon.</div>;

  return <ol aria-label="Upcoming classes" className="-mx-4 grid gap-px border-y border-black/10 bg-black/10 md:mx-0 md:border-0 lg:grid-cols-3 lg:gap-5 lg:bg-transparent">{upcomingSessions.map((session) => <SessionCard bookingId={bookingIdsBySessionId[session.id]} key={session.id} resume={resumeSessionId === session.id} session={session} waitlistEntryId={waitlistIdsBySessionId[session.id]} />)}</ol>;
}
