"use client";

import { createCourseAction, setCourseArchiveAction, updateCourseAction } from "../../lib/admin/actions";
import type { AdminCourse } from "../../lib/db/repositories/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { ClassesPanel } from "./ClassesPanel";

const publicStatusLabel = {
  active: "Now running",
  coming_next: "Coming next",
  hidden: "Hidden from members",
} as const;

function CourseCard({ course }: { course: AdminCourse }) {
  const archiveAction = setCourseArchiveAction.bind(null, course.id, !course.isArchived);
  const updateAction = updateCourseAction.bind(null, course.id);

  return (
    <Card>
      <CardHeader className="sm:flex-row sm:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2.5">
            <CardTitle>{course.name}</CardTitle>
            <Badge variant={course.isArchived ? "destructive" : "secondary"}>
              {course.isArchived ? "Archived" : publicStatusLabel[course.publicStatus]}
            </Badge>
          </div>
          <CardDescription className="max-w-2xl">{course.description || "No Course summary yet."}</CardDescription>
        </div>
        <form action={archiveAction}>
          <Button type="submit" variant={course.isArchived ? "default" : "destructive"}>{course.isArchived ? "Restore Course" : "Archive Course"}</Button>
        </form>
      </CardHeader>

      <CardContent>
      <details>
        <summary className="w-fit cursor-pointer text-sm font-medium hover:underline">Edit Course</summary>
        <form action={updateAction} className="mt-4 grid max-w-xl gap-4 rounded-lg border bg-muted/40 p-4">
          <div className="grid gap-2"><Label htmlFor={`course-name-${course.id}`}>Course name</Label><Input defaultValue={course.name} id={`course-name-${course.id}`} name="name" required /></div>
          <div className="grid gap-2"><Label htmlFor={`course-description-${course.id}`}>Course summary</Label><Textarea defaultValue={course.description ?? ""} id={`course-description-${course.id}`} name="description" /></div>
          <div className="grid gap-2"><Label>Member visibility</Label><Select defaultValue={course.publicStatus} name="publicStatus"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="active">Now running — Sessions can be booked</SelectItem><SelectItem value="coming_next">Coming next — informational only</SelectItem><SelectItem value="hidden">Hidden</SelectItem></SelectContent></Select></div>
          <Button className="w-fit" type="submit">Save Course</Button>
        </form>
      </details>

      <Separator className="my-6" />
      <section aria-label={`${course.name} Classes`}>
        <div className="mb-4 flex items-baseline justify-between gap-3"><h3 className="text-sm font-semibold">Classes</h3><span className="text-sm text-muted-foreground">{course.classes.length}</span></div>
        <ClassesPanel classes={course.classes} />
      </section>
      </CardContent>
    </Card>
  );
}

export function CoursesPanel({ courses }: { courses: AdminCourse[] }) {
  return <div className="grid gap-6"><Card className="border-dashed"><CardHeader><CardTitle>New Course</CardTitle><CardDescription>Create the programme container before adding dated Sessions.</CardDescription></CardHeader><CardContent><form action={createCourseAction} className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_14rem_auto] md:items-end"><div className="grid gap-2"><Label htmlFor="new-course">Course name</Label><Input id="new-course" name="name" placeholder="For example, Knowing God" required /></div><div className="grid gap-2"><Label htmlFor="new-course-summary">Short summary</Label><Textarea className="min-h-9" id="new-course-summary" name="description" placeholder="What will members explore?" required /></div><div className="grid gap-2"><Label>Member visibility</Label><Select defaultValue="hidden" name="publicStatus"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="hidden">Hidden</SelectItem><SelectItem value="coming_next">Coming next</SelectItem><SelectItem value="active">Now running</SelectItem></SelectContent></Select></div><Button type="submit">Create Course</Button></form></CardContent></Card>{courses.length > 0 ? courses.map((course) => <CourseCard course={course} key={course.id} />) : <Card className="border-dashed"><CardContent className="py-10 text-center text-sm text-muted-foreground">No Courses yet. Create a Course, then add its first Class from the Sessions workspace.</CardContent></Card>}</div>;
}
