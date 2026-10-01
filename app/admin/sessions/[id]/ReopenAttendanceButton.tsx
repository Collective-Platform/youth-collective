"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { reopenAttendanceAction } from "../../../../lib/admin/actions";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ReopenAttendanceButton({ sessionId }: { sessionId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  function submit(formData: FormData) { startTransition(async () => { try { await reopenAttendanceAction(sessionId, formData); setOpen(false); router.refresh(); } catch (error) { setMessage(error instanceof Error ? error.message : "Couldn’t reopen attendance."); } }); }
  return <Dialog onOpenChange={setOpen} open={open}><DialogTrigger asChild><Button variant="outline">Reopen attendance</Button></DialogTrigger><DialogContent><form action={submit}><DialogHeader><DialogTitle>Reopen finalized attendance?</DialogTitle><DialogDescription>This restores editing and check-in controls. The reason is retained in the Session audit trail.</DialogDescription></DialogHeader><div className="my-5 grid gap-2"><Label htmlFor="reopen-reason">Reason</Label><Input id="reopen-reason" maxLength={500} name="reason" required /></div>{message ? <p className="mb-4 text-sm text-destructive">{message}</p> : null}<DialogFooter><DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose><Button disabled={isPending} type="submit">{isPending ? "Reopening…" : "Reopen attendance"}</Button></DialogFooter></form></DialogContent></Dialog>;
}
