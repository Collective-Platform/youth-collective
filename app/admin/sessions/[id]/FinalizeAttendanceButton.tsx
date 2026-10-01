"use client";

import { ClipboardCheck } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function FinalizeAttendanceButton({
  action,
  canFinalize,
  finalized,
  remainingCount,
}: {
  action: () => Promise<void>;
  canFinalize: boolean;
  finalized: boolean;
  remainingCount: number;
}) {
  const [isPending, setIsPending] = useState(false);

  async function finalize() {
    setIsPending(true);
    try {
      await action();
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="border-t pt-4 sm:border-l sm:border-t-0 sm:pl-4 sm:pt-0">
      <p className="text-xs font-medium text-muted-foreground">After the Session</p>
      <Dialog>
        <DialogTrigger asChild><Button className="mt-2" disabled={isPending || !canFinalize || finalized} type="button" variant="destructive"><ClipboardCheck aria-hidden="true" />{isPending ? "Finalizing…" : finalized ? "Attendance finalized" : !canFinalize ? "Available after Session" : "Finalize attendance"}</Button></DialogTrigger>
        <DialogContent>
          <DialogHeader><DialogTitle>Finalize attendance?</DialogTitle><DialogDescription>{remainingCount === 1 ? "1 remaining expected person" : `${remainingCount} remaining expected people`} will be marked as no-show. This is a bulk correction.</DialogDescription></DialogHeader>
          <DialogFooter><DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose><Button disabled={isPending} onClick={finalize} variant="destructive">{isPending ? "Finalizing…" : "Finalize attendance"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
      <p className="mt-1.5 max-w-70 text-xs text-muted-foreground">{finalized ? "Attendance is complete. Individual corrections remain available." : !canFinalize ? "Finalization opens after the Session ends." : remainingCount === 0 ? "Everyone is accounted for. Finalize to close attendance." : `${remainingCount} still expected will become no-show.`}</p>
    </div>
  );
}
