"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../components/ui/dialog";
import { leaveWaitlistAction } from "../../lib/bookings/actions";

export default function LeaveWaitlistButton({ className, waitlistEntryId }: { className: string; waitlistEntryId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function leave() {
    startTransition(async () => {
      const result = await leaveWaitlistAction(waitlistEntryId);
      if (result.kind === "left_waitlist") {
        router.push("/dashboard?waitlistLeft=1");
        return;
      }
      setOpen(false);
      setMessage("This waitlist entry is no longer active.");
      router.refresh();
    });
  }

  return <div>
    <button className="mt-3 text-sm font-semibold underline underline-offset-4 hover:text-black/60" disabled={isPending} onClick={() => setOpen(true)} type="button">Leave waitlist</button>
    {message ? <p className="mt-2 text-sm font-semibold" role="alert">{message}</p> : null}
    <Dialog onOpenChange={setOpen} open={open}><DialogContent className="bg-[#f7f4ed] text-[#292823]"><DialogHeader><DialogTitle className="font-heading text-2xl">Leave this waitlist?</DialogTitle><DialogDescription className="leading-6 text-black/65">You will no longer be offered a place for {className}. If you join again later, you will return at the back of the queue.</DialogDescription></DialogHeader><DialogFooter><DialogClose className="min-h-11 rounded-full border border-black/20 px-5 text-sm font-semibold">Stay on waitlist</DialogClose><button className="min-h-11 rounded-full bg-black px-5 text-sm font-semibold text-white disabled:opacity-45" disabled={isPending} onClick={leave} type="button">{isPending ? "Leaving…" : "Leave waitlist"}</button></DialogFooter></DialogContent></Dialog>
  </div>;
}
