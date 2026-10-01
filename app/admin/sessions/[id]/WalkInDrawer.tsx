"use client";

import { Search, UserRoundPlus } from "lucide-react";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { checkInPersonByStaffAction, createWalkInAction } from "../../../../lib/admin/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

type MemberOption = { id: string; name: string | null; email: string | null; mobile: string | null };

export default function WalkInDrawer({ members, preview, sessionId }: { members: MemberOption[]; preview: boolean; sessionId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"existing" | "new">("existing");
  const [query, setQuery] = useState("");
  const [selectedPersonId, setSelectedPersonId] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const matchingMembers = members.filter((member) => [member.name, member.email, member.mobile].some((value) => value?.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()))).slice(0, 8);

  function submit(formData: FormData) {
    if (preview) { setMessage("Preview only — walk-ins can’t be recorded here."); return; }
    setMessage(null);
    startTransition(async () => {
      try {
        if (mode === "existing") {
          if (!selectedPersonId) { setMessage("Choose a Person first."); return; }
          await checkInPersonByStaffAction(sessionId, selectedPersonId, formData);
        } else {
          await createWalkInAction(sessionId, formData);
        }
        setOpen(false);
        setQuery("");
        setSelectedPersonId("");
        router.refresh();
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Couldn’t record this walk-in.");
      }
    });
  }

  return <Sheet onOpenChange={setOpen} open={open}>
    <SheetTrigger asChild><Button type="button"><UserRoundPlus aria-hidden="true" />Record walk-in</Button></SheetTrigger>
    <SheetContent className="flex w-full flex-col sm:max-w-xl">
      <SheetHeader><SheetTitle>Record and check in a walk-in</SheetTitle><SheetDescription>Use an existing Person or create a minimal record, then mark them attended immediately.</SheetDescription></SheetHeader>
      <form action={submit} className="flex min-h-0 flex-1 flex-col">
        <div className="flex-1 overflow-y-auto px-4">
          <div className="grid grid-cols-2 gap-2 rounded-lg bg-muted p-1"><Button onClick={() => setMode("existing")} type="button" variant={mode === "existing" ? "default" : "ghost"}>Existing Person</Button><Button onClick={() => setMode("new")} type="button" variant={mode === "new" ? "default" : "ghost"}>New Person</Button></div>
          {mode === "existing" ? <div className="mt-5"><label className="relative block"><span className="sr-only">Find a person</span><Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input className="pl-9" onChange={(event) => setQuery(event.target.value)} placeholder="Search name, email, or mobile" value={query} /></label><div className="mt-3 grid gap-2">{matchingMembers.map((member) => <Button className="h-auto justify-start py-3 text-left" key={member.id} onClick={() => setSelectedPersonId(member.id)} type="button" variant={selectedPersonId === member.id ? "default" : "outline"}><span><span className="block">{member.name ?? "Unnamed Person"}</span><span className="block text-xs opacity-70">{member.mobile ?? "No mobile"} · {member.email ?? "No login email"}</span></span></Button>)}</div></div> : <div className="mt-5 grid gap-4"><div className="grid gap-2"><Label htmlFor="walk-in-name">Full name</Label><Input id="walk-in-name" maxLength={120} name="name" required /></div><div className="grid gap-2"><Label htmlFor="walk-in-mobile">Mobile</Label><Input id="walk-in-mobile" maxLength={30} name="mobile" required /></div></div>}
          <div className="mt-5 grid gap-2"><Label htmlFor="walk-in-reason">Reason</Label><Input defaultValue="Arrived without a Booking" id="walk-in-reason" maxLength={500} name="reason" required /></div>
          {message ? <p className="mt-4 text-sm text-destructive" role="status">{message}</p> : null}
        </div>
        <SheetFooter><Button disabled={isPending || (mode === "existing" && !selectedPersonId)} type="submit">{isPending ? "Recording…" : "Check in walk-in"}</Button></SheetFooter>
      </form>
    </SheetContent>
  </Sheet>;
}
