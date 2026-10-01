"use client";

import { Plus, Search } from "lucide-react";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { addPersonToSessionAction } from "../../../../lib/admin/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

type MemberOption = {
  id: string;
  name: string | null;
  email: string | null;
  mobile: string | null;
};

export default function AddPersonDrawer({
  members,
  preview,
  sessionId,
}: {
  members: MemberOption[];
  preview: boolean;
  sessionId: string;
}) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const matchingMembers = useMemo(
    () => members.filter((member) => [member.name, member.email, member.mobile].some((value) => value?.toLocaleLowerCase().includes(normalizedQuery))).slice(0, 12),
    [members, normalizedQuery],
  );

  function resetDrawer() {
    setQuery("");
    setSelectedPersonId(null);
    setMessage(null);
  }

  function addPerson() {
    if (!selectedPersonId) return;
    if (preview) {
      setMessage("Preview only — people can’t be added here.");
      return;
    }

    setMessage(null);
    startTransition(async () => {
      try {
        const result = await addPersonToSessionAction(sessionId, selectedPersonId);
        if (result.kind === "confirmed" || result.kind === "waitlisted") {
          setIsOpen(false);
          resetDrawer();
          router.refresh();
          return;
        }
        setMessage(
          result.kind === "already_booked" ? "This person has already joined this Session."
            : result.kind === "already_waitlisted" ? "This person is already on the waitlist."
              : "This Session is no longer available.",
        );
      } catch {
        setMessage("Couldn’t add this person. Try again.");
      }
    });
  }

  return (
    <Sheet onOpenChange={(open) => { setIsOpen(open); if (!open) resetDrawer(); }} open={isOpen}>
      <SheetTrigger asChild>
        <Button type="button">
          <Plus aria-hidden="true" />
          Add people
        </Button>
      </SheetTrigger>
        <SheetContent className="flex w-full flex-col sm:max-w-xl">
          <SheetHeader><SheetTitle>Add a person</SheetTitle><SheetDescription>Choose an existing person to join this Session.</SheetDescription></SheetHeader>
          <div className="min-h-0 flex-1 overflow-y-auto px-4">
            <label className="relative block">
              <span className="sr-only">Find a person</span>
              <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input className="pl-9" onChange={(event) => setQuery(event.target.value)} placeholder="Search name, email, or mobile" type="search" value={query} />
            </label>
            <div aria-label="People" className="mt-5 grid gap-2" role="listbox">
              {matchingMembers.map((member) => {
                const selected = selectedPersonId === member.id;
                return <Button aria-selected={selected} className={cn("h-auto w-full justify-start whitespace-normal px-4 py-3 text-left", selected && "border-primary bg-accent")} key={member.id} onClick={() => setSelectedPersonId(member.id)} role="option" type="button" variant="outline"><span><span className="block text-sm font-medium">{member.name ?? "Unnamed member"}</span><span className="mt-1 block text-sm font-normal text-muted-foreground">{member.email ?? "No login email"} · {member.mobile ?? "No mobile number"}</span></span></Button>;
              })}
              {matchingMembers.length === 0 ? <p className="py-8 text-center text-sm text-muted-foreground">No people match that search.</p> : null}
            </div>
            {message ? <p className="mt-5 text-sm text-destructive" role="status">{message}</p> : null}
          </div>
          <SheetFooter><Button className="w-full" disabled={!selectedPersonId || isPending} onClick={addPerson} type="button">{isPending ? "Adding…" : "Add to Session"}</Button></SheetFooter>
        </SheetContent>
    </Sheet>
  );
}
