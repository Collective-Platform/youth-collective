"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { selfCheckInAction } from "../../../lib/check-in/actions";

export default function CheckInControl({ token }: { token: string }) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [walkInPrompt, setWalkInPrompt] = useState<{ cancelledBooking: boolean } | null>(null);
  const [isPending, startTransition] = useTransition();

  function checkIn(confirmWalkIn = false) {
    setMessage(null);
    startTransition(async () => {
      const result = await selfCheckInAction(token, confirmWalkIn);
      if (result.kind === "authentication_required" || result.kind === "profile_required") {
        router.push(`/dashboard?next=${encodeURIComponent(`/check-in/${token}`)}`);
        return;
      }
      const messages: Record<Exclude<typeof result.kind, "authentication_required" | "profile_required">, string> = {
        checked_in: "You’re checked in. Your dashboard now shows this Class as attended.",
        already_checked_in: "You’re already checked in. This Class is saved as attended in your dashboard.",
        walk_in_confirmation_required: "",
        window_closed: "Check-in isn’t open for this Class right now.",
        booking_unavailable: "This booking can’t be changed through check-in. Ask a team member if you’re unsure.",
        session_unavailable: "This Session is unavailable for check-in.",
        invalid_request: "This check-in link is invalid.",
      };
      if (result.kind === "walk_in_confirmation_required") {
        setWalkInPrompt({ cancelledBooking: result.cancelledBooking });
      } else {
        setWalkInPrompt(null);
        setMessage(messages[result.kind]);
      }
      router.refresh();
    });
  }

  return <div className="mt-8">
    {walkInPrompt ? <div className="rounded-xl bg-white p-5 text-black"><p className="font-bold">{walkInPrompt.cancelledBooking ? "Your booking for this Class was cancelled." : "You’re not booked for this Class."}</p><p className="mt-2 text-sm leading-6 text-black/70">If you&apos;ve been invited to join in person, you can check in as a walk-in.</p><button className="mt-5 min-h-13 w-full rounded-full bg-black px-6 py-4 text-lg font-bold text-white hover:bg-[#5038e1] disabled:bg-black/40" disabled={isPending} onClick={() => checkIn(true)} type="button">{isPending ? "Checking in…" : "Check in as walk-in"}</button><button className="mt-3 min-h-11 w-full rounded-full border border-black/15 px-5 text-sm font-bold hover:bg-black/5" disabled={isPending} onClick={() => setWalkInPrompt(null)} type="button">Not now</button></div> : <button className="min-h-13 w-full rounded-full bg-black px-6 py-4 text-lg font-bold text-white hover:bg-[#5038e1] disabled:bg-black/40" disabled={isPending} onClick={() => checkIn()} type="button">{isPending ? "Checking in…" : "Check in"}</button>}
    {message ? <p className="mt-4 text-center text-base font-semibold" role="status">{message}</p> : null}
  </div>;
}
