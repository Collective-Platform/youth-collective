"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { cancelBookingAction } from "../../lib/bookings/actions";

export default function CancelBookingButton({ bookingId, className = "this Class", inverted = false }: { bookingId: string; className?: string; inverted?: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function cancel() {
    startTransition(async () => {
      const result = await cancelBookingAction(bookingId);
      if (result.kind === "cancelled") {
        router.push("/dashboard?cancelled=1");
        return;
      }
      setOpen(false);
      setMessage("This booking can no longer be cancelled.");
      router.refresh();
    });
  }

  return <div>
    <button className={`mt-3 text-sm font-semibold underline decoration-1 underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 disabled:opacity-40 ${inverted ? "text-white hover:text-white/65 focus-visible:outline-white/60" : "hover:text-black/60 focus-visible:outline-black/40"}`} disabled={isPending} onClick={() => setOpen(true)} type="button">Cancel booking</button>
    {message ? <p className={`mt-2 text-sm font-semibold ${inverted ? "text-white" : "text-black"}`} role="alert">{message}</p> : null}
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogContent className="bg-[#f7f4ed] text-[#292823]">
        <DialogHeader><DialogTitle className="font-heading text-2xl">Cancel this booking?</DialogTitle><DialogDescription className="leading-6 text-black/65">Your place for {className} will be released and may be offered to the next person on the waitlist.</DialogDescription></DialogHeader>
        <DialogFooter><DialogClose className="min-h-11 rounded-full border border-black/20 px-5 text-sm font-semibold">Keep my place</DialogClose><button className="min-h-11 rounded-full bg-black px-5 text-sm font-semibold text-white disabled:opacity-45" disabled={isPending} onClick={cancel} type="button">{isPending ? "Cancelling…" : "Yes, cancel booking"}</button></DialogFooter>
      </DialogContent>
    </Dialog>
  </div>;
}
