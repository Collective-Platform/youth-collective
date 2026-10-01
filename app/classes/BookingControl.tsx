"use client";

import { CalendarDays, Clock3, MapPin, UsersRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { bookSessionAction, cancelBookingAction, leaveWaitlistAction } from "../../lib/bookings/actions";
import { SESSION_TIME_ZONE } from "../../lib/session-time";

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  weekday: "long",
  day: "numeric",
  month: "long",
  timeZone: SESSION_TIME_ZONE,
});
const timeFormatter = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: SESSION_TIME_ZONE,
});

function displayAudience(audience: string) {
  return audience.replace("College/Uni", "Campus").replace(/\s+[—-]\s+(Fridays|Sundays)$/i, "");
}

type BookingControlProps = {
  audience: string | null;
  bookingId?: string;
  className: string;
  endsAt: Date;
  isFull: boolean;
  location: string | null;
  resume?: boolean;
  sessionId: string;
  startsAt: Date;
  waitlistEntryId?: string;
};

export default function BookingControl({
  audience,
  bookingId: initialBookingId,
  className,
  endsAt,
  isFull,
  location,
  resume = false,
  sessionId,
  startsAt,
  waitlistEntryId: initialWaitlistEntryId,
}: BookingControlProps) {
  const router = useRouter();
  const resumeStarted = useRef(false);
  const [bookingId, setBookingId] = useState(initialBookingId);
  const [waitlistEntryId, setWaitlistEntryId] = useState(initialWaitlistEntryId);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const isBooked = Boolean(bookingId);
  const isWaitlisted = Boolean(waitlistEntryId);

  useEffect(() => setBookingId(initialBookingId), [initialBookingId]);
  useEffect(() => setWaitlistEntryId(initialWaitlistEntryId), [initialWaitlistEntryId]);

  function reservePlace() {
    setMessage(null);
    startTransition(async () => {
      const result = await bookSessionAction(sessionId);
      if (result.kind === "authentication_required" || result.kind === "profile_required") {
        const returnTo = `/classes?resume=${encodeURIComponent(sessionId)}`;
        router.push(`/dashboard?next=${encodeURIComponent(returnTo)}`);
        return;
      }
      if (result.kind === "confirmed" || result.kind === "already_booked") {
        setBookingId(result.bookingId);
        setWaitlistEntryId(undefined);
        router.replace(`/classes?booking=confirmed&session=${encodeURIComponent(sessionId)}`);
        return;
      }
      if (result.kind === "waitlisted" || result.kind === "already_waitlisted") {
        setWaitlistEntryId(result.waitlistEntryId);
        router.replace(`/classes?waitlist=confirmed&session=${encodeURIComponent(sessionId)}`);
        return;
      }
      setMessage("This class is no longer available. Refresh to see the latest schedule.");
      setReviewOpen(false);
      router.refresh();
    });
  }

  useEffect(() => {
    if (!resume || resumeStarted.current || isBooked || isWaitlisted) return;
    resumeStarted.current = true;
    reservePlace();
  // reservePlace intentionally uses this render's selected Session details.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resume, isBooked, isWaitlisted]);

  function cancelBooking() {
    if (!bookingId) return;
    setMessage(null);
    startTransition(async () => {
      const result = await cancelBookingAction(bookingId);
      setCancelOpen(false);
      if (result.kind === "cancelled") {
        setBookingId(undefined);
        setMessage("Your booking has been cancelled. You can rebook while a place is available.");
      } else {
        setMessage("This booking can no longer be cancelled.");
      }
      router.refresh();
    });
  }

  function leaveWaitlist() {
    if (!waitlistEntryId) return;
    setMessage(null);
    startTransition(async () => {
      const result = await leaveWaitlistAction(waitlistEntryId);
      setLeaveOpen(false);
      if (result.kind === "left_waitlist") {
        setWaitlistEntryId(undefined);
        setMessage("You’ve left the waitlist. You can join it again while this class is full.");
      } else {
        setMessage("This waitlist entry is no longer active.");
      }
      router.refresh();
    });
  }

  const actionLabel = isBooked ? "You’re booked" : isWaitlisted ? "On waitlist" : isFull ? "Join waitlist" : "Join this class";

  return (
    <div>
      <button
        className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[#292823] px-5 py-3 text-center text-sm font-semibold text-white transition-colors duration-200 hover:bg-black focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#292823] disabled:cursor-not-allowed disabled:bg-black/45"
        disabled={isPending || isBooked || isWaitlisted}
        onClick={() => setReviewOpen(true)}
        type="button"
      >
        {isPending ? "Saving your place…" : actionLabel}
      </button>

      {isBooked ? <button className="mx-auto mt-3 block text-sm font-semibold underline underline-offset-4 hover:text-black/60" onClick={() => setCancelOpen(true)} type="button">Cancel booking</button> : null}
      {isWaitlisted ? <button className="mx-auto mt-3 block text-sm font-semibold underline underline-offset-4 hover:text-black/60" onClick={() => setLeaveOpen(true)} type="button">Leave waitlist</button> : null}
      {message ? <p className="mt-3 text-center text-sm leading-5 text-black/65" role="status">{message}</p> : null}

      <Dialog onOpenChange={setReviewOpen} open={reviewOpen}>
        <DialogContent className="border-0 bg-[#f7f4ed] p-6 text-[#292823] sm:max-w-xl sm:p-8">
          <DialogHeader>
            <DialogTitle className="font-heading text-3xl leading-none tracking-[-0.03em]">{isFull ? "Join the waitlist?" : "Ready to join?"}</DialogTitle>
            <DialogDescription className="text-base leading-6 text-black/65">Review the details before we save your {isFull ? "waitlist request" : "place"}.</DialogDescription>
          </DialogHeader>
          <div className="mt-2 border-y border-black/15 py-5">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-black/50">{className}</p>
            <dl className="mt-4 grid gap-3 text-sm font-medium">
              <div className="flex gap-3"><CalendarDays aria-hidden="true" className="mt-0.5 size-4 shrink-0" /><div><dt className="sr-only">Date</dt><dd>{dateFormatter.format(startsAt)}</dd></div></div>
              <div className="flex gap-3"><Clock3 aria-hidden="true" className="mt-0.5 size-4 shrink-0" /><div><dt className="sr-only">Time</dt><dd>{timeFormatter.format(startsAt)}–{timeFormatter.format(endsAt)}</dd></div></div>
              <div className="flex gap-3"><MapPin aria-hidden="true" className="mt-0.5 size-4 shrink-0" /><div><dt className="sr-only">Location</dt><dd>{location || "Location to be confirmed"}</dd></div></div>
              {audience ? <div className="flex gap-3"><UsersRound aria-hidden="true" className="mt-0.5 size-4 shrink-0" /><div><dt className="sr-only">Audience</dt><dd>{displayAudience(audience)}</dd></div></div> : null}
            </dl>
          </div>
          <p className="text-sm leading-6 text-black/65">If plans change, cancel from your dashboard so someone else can take the place. A full class places you on the waitlist; it does not confirm attendance.</p>
          <DialogFooter className="mt-2">
            <DialogClose className="min-h-11 rounded-full border border-black/20 px-5 text-sm font-semibold hover:bg-black/5">Not now</DialogClose>
            <button className="min-h-11 rounded-full bg-[#292823] px-5 text-sm font-semibold text-white hover:bg-black disabled:opacity-45" disabled={isPending} onClick={reservePlace} type="button">{isPending ? "Saving…" : isFull ? "Join waitlist" : "Confirm my place"}</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog onOpenChange={setCancelOpen} open={cancelOpen}>
        <DialogContent className="bg-[#f7f4ed] text-[#292823]">
          <DialogHeader><DialogTitle className="font-heading text-2xl">Cancel this booking?</DialogTitle><DialogDescription className="leading-6 text-black/65">Your place for {className} will be released and may be offered to the next person on the waitlist.</DialogDescription></DialogHeader>
          <DialogFooter><DialogClose className="min-h-11 rounded-full border border-black/20 px-5 text-sm font-semibold">Keep my place</DialogClose><button className="min-h-11 rounded-full bg-black px-5 text-sm font-semibold text-white disabled:opacity-45" disabled={isPending} onClick={cancelBooking} type="button">{isPending ? "Cancelling…" : "Yes, cancel booking"}</button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog onOpenChange={setLeaveOpen} open={leaveOpen}>
        <DialogContent className="bg-[#f7f4ed] text-[#292823]">
          <DialogHeader><DialogTitle className="font-heading text-2xl">Leave this waitlist?</DialogTitle><DialogDescription className="leading-6 text-black/65">You will no longer be offered a place for {className}. You can join again later, at the back of the queue.</DialogDescription></DialogHeader>
          <DialogFooter><DialogClose className="min-h-11 rounded-full border border-black/20 px-5 text-sm font-semibold">Stay on waitlist</DialogClose><button className="min-h-11 rounded-full bg-black px-5 text-sm font-semibold text-white disabled:opacity-45" disabled={isPending} onClick={leaveWaitlist} type="button">{isPending ? "Leaving…" : "Leave waitlist"}</button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
