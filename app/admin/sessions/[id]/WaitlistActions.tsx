"use client";

import { Ellipsis } from "lucide-react";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { promoteWaitlistEntryAction, removeWaitlistEntryAction } from "../../../../lib/admin/actions";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function WaitlistActions({ entryId, name }: { entryId: string; name: string }) {
  const router = useRouter();
  const [action, setAction] = useState<"promote" | "remove" | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  function submit(formData: FormData) {
    if (!action) return;
    startTransition(async () => {
      try {
        await (action === "promote" ? promoteWaitlistEntryAction(entryId, formData) : removeWaitlistEntryAction(entryId, formData));
        setAction(null);
        router.refresh();
      } catch (error) { setMessage(error instanceof Error ? error.message : "Couldn’t update the Waitlist."); }
    });
  }
  return <><DropdownMenu><DropdownMenuTrigger asChild><Button aria-label={`Waitlist actions for ${name}`} size="icon" variant="ghost"><Ellipsis /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onSelect={() => setAction("promote")}>Promote into available place</DropdownMenuItem><DropdownMenuItem className="text-destructive focus:text-destructive" onSelect={() => setAction("remove")}>Remove from waitlist</DropdownMenuItem></DropdownMenuContent></DropdownMenu><Dialog onOpenChange={(open) => { if (!open) setAction(null); }} open={Boolean(action)}><DialogContent><form action={submit}><DialogHeader><DialogTitle>{action === "promote" ? `Promote ${name}?` : `Remove ${name}?`}</DialogTitle><DialogDescription>{action === "promote" ? "Promotion is blocked when confirmed capacity is full and sends the participant an email." : "The Person will lose their place in this Waitlist."}</DialogDescription></DialogHeader><div className="my-5 grid gap-2"><Label htmlFor={`waitlist-reason-${entryId}`}>Reason</Label><Input id={`waitlist-reason-${entryId}`} maxLength={500} name="reason" required /></div>{message ? <p className="mb-4 text-sm text-destructive" role="status">{message}</p> : null}<DialogFooter><DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose><Button disabled={isPending} type="submit" variant={action === "remove" ? "destructive" : "default"}>{isPending ? "Saving…" : action === "promote" ? "Promote Person" : "Remove from waitlist"}</Button></DialogFooter></form></DialogContent></Dialog></>;
}
