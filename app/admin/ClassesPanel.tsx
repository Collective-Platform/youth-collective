"use client";

import { Pencil } from "lucide-react";
import { useState } from "react";

import { setClassArchiveAction, setUpcomingSessionLocationsAction, updateClassAction } from "../../lib/admin/actions";
import type { AdminClass } from "../../lib/db/repositories/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";

function ClassSettingsDrawer({ classRecord }: { classRecord: AdminClass }) {
  const [open, setOpen] = useState(false);
  const archiveAction = setClassArchiveAction.bind(null, classRecord.id, !classRecord.isArchived);
  const updateUpcomingSessionLocationsAction = setUpcomingSessionLocationsAction.bind(null, classRecord.id);

  async function closeAfter(action: () => Promise<void>) {
    await action();
    setOpen(false);
  }

  async function saveClass(formData: FormData) {
    await updateClassAction(classRecord.id, formData);
    setOpen(false);
  }

  async function updateLocations(formData: FormData) {
    await updateUpcomingSessionLocationsAction(formData);
    setOpen(false);
  }

  return (
    <Sheet onOpenChange={setOpen} open={open}>
      <SheetTrigger asChild>
        <Button type="button" variant="outline">
          <Pencil aria-hidden="true" />
          Edit
        </Button>
      </SheetTrigger>
        <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
          <SheetHeader><SheetTitle>Edit Class</SheetTitle><SheetDescription>Update the details members see for this Class.</SheetDescription></SheetHeader>
          <div className="grid gap-6 px-4 pb-6">
            <form action={saveClass} className="grid gap-4">
              <div className="grid gap-2"><Label htmlFor={`class-name-${classRecord.id}`}>Class name</Label><Input autoFocus defaultValue={classRecord.name} id={`class-name-${classRecord.id}`} name="name" required /></div>
              <div className="grid gap-2"><Label htmlFor={`class-audience-${classRecord.id}`}>Audience</Label><Input defaultValue={classRecord.audience ?? ""} id={`class-audience-${classRecord.id}`} name="audience" placeholder="For example, Years 10–13" /></div>
              <div className="grid gap-2"><Label htmlFor={`class-description-${classRecord.id}`}>Description</Label><Textarea defaultValue={classRecord.description ?? ""} id={`class-description-${classRecord.id}`} name="description" placeholder="What is this Class about?" /></div>
              <Button className="w-fit" type="submit">Save changes</Button>
            </form>

            <Separator />
            <section aria-labelledby={`class-session-location-${classRecord.id}`}>
              <h3 className="font-semibold" id={`class-session-location-${classRecord.id}`}>Upcoming Session location</h3>
              <p className="mt-2 text-sm text-muted-foreground">Apply one location to every upcoming scheduled Session for this Class. Individual Sessions can still be changed separately.</p>
              <form action={updateLocations} className="mt-4 flex flex-col gap-3 sm:flex-row">
                <Label className="sr-only" htmlFor={`class-session-location-input-${classRecord.id}`}>Location</Label>
                <Input className="flex-1" id={`class-session-location-input-${classRecord.id}`} maxLength={200} name="location" placeholder="For example, Main Hall" />
                <Button type="submit" variant="outline">Apply to all</Button>
              </form>
            </section>

            <Separator />
            <section aria-labelledby={`class-visibility-${classRecord.id}`}>
              <h3 className="font-semibold" id={`class-visibility-${classRecord.id}`}>Class visibility</h3>
              <p className="mt-2 text-sm text-muted-foreground">{classRecord.isArchived ? "This Class is hidden from members along with its future Sessions." : "Archive this Class to hide its future Sessions from members while keeping its records."}</p>
              <form action={closeAfter.bind(null, archiveAction)} className="mt-4">
                <Button type="submit" variant={classRecord.isArchived ? "default" : "destructive"}>{classRecord.isArchived ? "Restore Class" : "Archive Class"}</Button>
              </form>
            </section>
          </div>
        </SheetContent>
    </Sheet>
  );
}

function ClassRow({ classRecord }: { classRecord: AdminClass }) {
  return (
    <article className="flex flex-col gap-4 border-b py-5 first:pt-0 last:border-b-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2.5">
          <h2 className="font-semibold">{classRecord.name}</h2>
          <Badge variant={classRecord.isArchived ? "destructive" : "secondary"}>{classRecord.isArchived ? "Archived" : "Active"}</Badge>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">{[classRecord.audience, classRecord.description].filter(Boolean).join(" · ") || "No Class details yet."}</p>
      </div>
      <ClassSettingsDrawer classRecord={classRecord} />
    </article>
  );
}

export function ClassesPanel({ classes }: { classes: AdminClass[] }) {
  if (classes.length === 0) {
    return <Card className="border-dashed"><CardContent className="py-10 text-center text-sm text-muted-foreground">No Classes yet. Create a Session from the Overview to create the first Class.</CardContent></Card>;
  }

  return <div>{classes.map((classRecord) => <ClassRow classRecord={classRecord} key={classRecord.id} />)}</div>;
}
