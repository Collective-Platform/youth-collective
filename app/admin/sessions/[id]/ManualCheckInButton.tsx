"use client";

import { Ellipsis } from "lucide-react";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { adjustBookingStatusAction, transferBookingAction } from "../../../../lib/admin/actions";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type BookingStatus = "confirmed" | "cancelled" | "attended" | "no_show";
const statusLabel: Record<BookingStatus, string> = { confirmed: "Expected", attended: "Checked in", no_show: "No show", cancelled: "Cancelled" };

export default function ManualCheckInButton({ bookingId, name, preview = false, status, transferTargets }: { bookingId: string; name: string; preview?: boolean; status: BookingStatus; transferTargets: { id: string; label: string }[] }) {
  const router = useRouter();
  const [nextStatus, setNextStatus] = useState<BookingStatus | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [transferOpen, setTransferOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function updateAttendance(formData: FormData) {
    if (!nextStatus) return;
    formData.set("status", nextStatus);
    startTransition(async () => {
      try {
        if (!preview) await adjustBookingStatusAction(bookingId, formData);
        setNextStatus(null);
        router.refresh();
      } catch (error) { setMessage(error instanceof Error ? error.message : "Couldn’t update attendance."); }
    });
  }

  function transferBooking(formData: FormData) {
    startTransition(async () => {
      try {
        if (!preview) await transferBookingAction(bookingId, formData);
        setTransferOpen(false);
        router.refresh();
      } catch (error) { setMessage(error instanceof Error ? error.message : "Couldn’t transfer this Booking."); }
    });
  }

  const choices = (["confirmed", "attended", "no_show", "cancelled"] as BookingStatus[]).filter((choice) => choice !== status);
  return <>
    <DropdownMenu><DropdownMenuTrigger asChild><Button aria-label={`Attendance actions for ${name}`} disabled={isPending} size="icon" variant="ghost"><Ellipsis /></Button></DropdownMenuTrigger><DropdownMenuContent align="end">{status === "confirmed" && transferTargets.length > 0 ? <DropdownMenuItem onSelect={() => { setMessage(null); setTransferOpen(true); }}>Transfer to another Session</DropdownMenuItem> : null}{choices.map((choice) => <DropdownMenuItem className={choice === "cancelled" ? "text-destructive focus:text-destructive" : ""} key={choice} onSelect={() => { setMessage(null); setNextStatus(choice); }}>Mark as {statusLabel[choice].toLowerCase()}</DropdownMenuItem>)}</DropdownMenuContent></DropdownMenu>
    <Dialog onOpenChange={(open) => { if (!open) setNextStatus(null); }} open={Boolean(nextStatus)}><DialogContent><form action={updateAttendance}><DialogHeader><DialogTitle>Change {name} to {nextStatus ? statusLabel[nextStatus].toLowerCase() : "another status"}?</DialogTitle><DialogDescription>This correction is recorded with your account, the previous status, and a required reason.</DialogDescription></DialogHeader><div className="my-5 grid gap-2"><Label htmlFor={`attendance-reason-${bookingId}`}>Reason (required)</Label><Input id={`attendance-reason-${bookingId}`} maxLength={500} name="reason" required /></div>{message ? <p className="mb-4 text-sm text-destructive" role="status">{message}</p> : null}<DialogFooter><DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose><Button disabled={isPending} type="submit" variant={nextStatus === "cancelled" ? "destructive" : "default"}>{isPending ? "Saving…" : "Save correction"}</Button></DialogFooter></form></DialogContent></Dialog>
    <Dialog onOpenChange={setTransferOpen} open={transferOpen}><DialogContent><form action={transferBooking}><DialogHeader><DialogTitle>Transfer {name}</DialogTitle><DialogDescription>Move this Booking to another upcoming Session. If someone is waiting here, the first person in line gets the released place.</DialogDescription></DialogHeader><div className="my-5 grid gap-4"><div className="grid gap-2"><Label htmlFor={`transfer-session-${bookingId}`}>New Session</Label><Select name="targetSessionId" required><SelectTrigger id={`transfer-session-${bookingId}`}><SelectValue placeholder="Choose a Session" /></SelectTrigger><SelectContent>{transferTargets.map((target) => <SelectItem key={target.id} value={target.id}>{target.label}</SelectItem>)}</SelectContent></Select></div><div className="grid gap-2"><Label htmlFor={`transfer-reason-${bookingId}`}>Reason (required)</Label><Input id={`transfer-reason-${bookingId}`} maxLength={500} name="reason" required /></div></div>{message ? <p className="mb-4 text-sm text-destructive" role="status">{message}</p> : null}<DialogFooter><DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose><Button disabled={isPending} type="submit">{isPending ? "Transferring…" : "Transfer Booking"}</Button></DialogFooter></form></DialogContent></Dialog>
  </>;
}
