"use client";

import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useState } from "react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type AdminAction = (formData: FormData) => Promise<void>;

type ClassOption = {
  id: string;
  courseId: string;
  courseName: string;
  name: string;
};

type AdminCreateControlsProps = {
  classes: ClassOption[];
  createSessionsAction: AdminAction;
};

const createNewClassValue = "__create_new_class__";
const createNewCourseValue = "__create_new_course__";

function SubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return <Button disabled={pending} type="submit">{pending ? "Saving…" : children}</Button>;
}

const monthFormatter = new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric" });
const selectedDateFormatter = new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short" });
const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function dateKey(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function CalendarDatePicker({ selectedDates, onChange }: { selectedDates: string[]; onChange: (dates: string[]) => void }) {
  const now = new Date();
  const [visibleMonth, setVisibleMonth] = useState({ year: now.getFullYear(), month: now.getMonth() });
  const daysInMonth = new Date(visibleMonth.year, visibleMonth.month + 1, 0).getDate();
  const firstWeekday = new Date(visibleMonth.year, visibleMonth.month, 1).getDay();
  const visibleDate = new Date(visibleMonth.year, visibleMonth.month, 1);

  function moveMonth(offset: number) {
    const next = new Date(visibleMonth.year, visibleMonth.month + offset, 1);
    setVisibleMonth({ year: next.getFullYear(), month: next.getMonth() });
  }

  function toggleDate(value: string) {
    onChange(selectedDates.includes(value) ? selectedDates.filter((date) => date !== value) : [...selectedDates, value].sort());
  }

  return (
    <div className="rounded-lg border bg-muted/40 p-3">
      <div className="flex items-center justify-between gap-3">
        <Button aria-label="Previous month" onClick={() => moveMonth(-1)} size="icon" type="button" variant="ghost"><ChevronLeft aria-hidden="true" /></Button>
        <p className="text-sm font-semibold">{monthFormatter.format(visibleDate)}</p>
        <Button aria-label="Next month" onClick={() => moveMonth(1)} size="icon" type="button" variant="ghost"><ChevronRight aria-hidden="true" /></Button>
      </div>
      <div className="mt-3 grid grid-cols-7 gap-1 text-center" role="group" aria-label="Choose Session dates">
        {weekdayLabels.map((day) => <span className="py-1 text-xs text-muted-foreground" key={day}>{day}</span>)}
        {Array.from({ length: firstWeekday }, (_, index) => <span aria-hidden="true" key={`blank-${index}`} />)}
        {Array.from({ length: daysInMonth }, (_, index) => {
          const day = index + 1;
          const value = dateKey(visibleMonth.year, visibleMonth.month, day);
          const selected = selectedDates.includes(value);
          return <Button aria-label={`${selected ? "Unselect" : "Select"} ${selectedDateFormatter.format(new Date(visibleMonth.year, visibleMonth.month, day))}`} aria-pressed={selected} className="h-9 px-0" key={value} onClick={() => toggleDate(value)} type="button" variant={selected ? "default" : "ghost"}>{day}</Button>;
        })}
      </div>
    </div>
  );
}

function NewSessionDialog({ action, classes }: { action: AdminAction; classes: ClassOption[] }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [classId, setClassId] = useState(classes[0]?.id ?? createNewClassValue);
  const [courseId, setCourseId] = useState(classes[0]?.courseId ?? createNewCourseValue);
  const isCreatingClass = classId === createNewClassValue;
  const isCreatingCourse = courseId === createNewCourseValue;
  const selectedClass = classes.find((classRecord) => classRecord.id === classId);

  async function submit(formData: FormData) {
    setError(null);
    if (selectedDates.length === 0) {
      setError("Select at least one date for this Session.");
      return;
    }
    try {
      await action(formData);
      setOpen(false);
      setSelectedDates([]);
    } catch {
      setError("We couldn't create the Sessions. Check the details and try again.");
    }
  }

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild><Button type="button"><Plus aria-hidden="true" />New Session</Button></DialogTrigger>
        <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-lg">
          <DialogHeader><DialogTitle>New Session</DialogTitle><DialogDescription>Choose every date this Class will run. The selected dates share one time and capacity.</DialogDescription></DialogHeader>
          <form action={submit} className="mt-7 grid gap-4">
            <div className="grid gap-2"><Label>Class</Label><Select name="classId" onValueChange={(nextClassId) => { setClassId(nextClassId); if (nextClassId !== createNewClassValue) setCourseId(classes.find((record) => record.id === nextClassId)?.courseId ?? createNewCourseValue); }} value={classId}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{classes.map((classRecord) => <SelectItem key={classRecord.id} value={classRecord.id}>{classRecord.courseName} · {classRecord.name}</SelectItem>)}<SelectItem value={createNewClassValue}>Create a new Class</SelectItem></SelectContent></Select></div>
            <input name="courseId" type="hidden" value={courseId} />
            {isCreatingClass ? <div className="grid gap-4 rounded-lg border bg-muted/40 p-4">
              <p className="text-sm font-medium">New Class details</p>
              <div className="grid gap-2"><Label>Course</Label><Select onValueChange={setCourseId} value={courseId}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{[...new Map(classes.map((classRecord) => [classRecord.courseId, classRecord])).values()].map((classRecord) => <SelectItem key={classRecord.courseId} value={classRecord.courseId}>{classRecord.courseName}</SelectItem>)}<SelectItem value={createNewCourseValue}>Create a new Course</SelectItem></SelectContent></Select></div>
              {isCreatingCourse ? <div className="grid gap-4 border-t pt-4"><div className="grid gap-2"><Label htmlFor="new-course-name">Course name</Label><Input id="new-course-name" name="newCourseName" required /></div><div className="grid gap-2"><Label htmlFor="new-course-description">Course summary</Label><Textarea id="new-course-description" name="newCourseDescription" placeholder="What will members explore?" required /></div></div> : null}
              <div className="grid gap-2"><Label htmlFor="new-class-name">Class name</Label><Input id="new-class-name" name="newClassName" required /></div>
              <div className="grid gap-2"><Label htmlFor="new-class-audience">Audience</Label><Input id="new-class-audience" name="newClassAudience" placeholder="For example, Years 10–13" required /></div>
              <div className="grid gap-2"><Label htmlFor="new-class-description">Description</Label><Textarea id="new-class-description" name="newClassDescription" placeholder="What is this Class about?" required /></div>
            </div> : null}
            <div><div className="flex items-baseline justify-between gap-3"><Label>Session dates</Label><p className="text-sm text-muted-foreground">{selectedDates.length} selected</p></div><input name="dates" type="hidden" value={selectedDates.join(",")} /><div className="mt-2"><CalendarDatePicker onChange={setSelectedDates} selectedDates={selectedDates} /></div></div>
            <div className="grid gap-4 sm:grid-cols-2"><div className="grid gap-2"><Label htmlFor="starts-at">Starts at</Label><Input id="starts-at" name="startsAtTime" required type="time" /></div><div className="grid gap-2"><Label htmlFor="ends-at">Ends at</Label><Input id="ends-at" name="endsAtTime" required type="time" /></div></div>
            <div className="grid gap-2"><Label htmlFor="capacity">Capacity</Label><Input defaultValue="30" id="capacity" max="500" min="1" name="capacity" required type="number" /></div>
            <div className="grid gap-2"><Label htmlFor="location">Location for all selected Sessions</Label><Input id="location" maxLength={200} name="location" placeholder="For example, Main Hall" /></div>
            <Label className="flex items-start gap-3 rounded-lg bg-muted px-4 py-3 font-normal"><Checkbox className="mt-0.5" name="autoLabel" /><span><span className="font-medium">Auto-label each Session</span><span className="block text-muted-foreground">Creates labels in date order, for example {selectedClass?.name ?? "this Class"} - 1, {selectedClass?.name ?? "this Class"} - 2.</span></span></Label>
            {error ? <p className="text-sm font-medium text-destructive" role="alert">{error}</p> : null}
            <SubmitButton>Create {selectedDates.length === 1 ? "Session" : "Sessions"}</SubmitButton>
          </form>
        </DialogContent>
    </Dialog>
  );
}

export function AdminCreateControls({ classes, createSessionsAction }: AdminCreateControlsProps) {
  return (
    <section aria-label="Create admin records">
      <NewSessionDialog action={createSessionsAction} classes={classes} />
    </section>
  );
}
