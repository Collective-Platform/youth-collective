import { redirect } from "next/navigation";

import { CoursesPanel } from "../CoursesPanel";
import { AdminPageHeader, AdminShell } from "../AdminShell";
import { getCurrentAdminAccess } from "../../../lib/admin/authorization";
import { listAdminCourses, type AdminCourse } from "../../../lib/db/repositories/admin";

export const dynamic = "force-dynamic";

type ClassesPageProps = {
  searchParams: Promise<{ preview?: string }>;
};

const previewAccess = { id: "d756f94e-63bd-4d07-8e4d-848e8d75edfe", email: "staff-preview@example.test", role: "admin" as const };
const previewCourses = [{ id: "0a1d3f5b-97d8-44cb-8f4e-2e8f91cf5d91", name: "Knowing God", description: "Practical faith conversations.", publicStatus: "active", isArchived: false, classes: [{ id: "0a1d3f5b-97d8-44cb-8f4e-2e8f91cf5d91", courseId: "0a1d3f5b-97d8-44cb-8f4e-2e8f91cf5d91", courseName: "Knowing God", name: "Who is God?", description: "A focused study session with peer support.", audience: "Years 10–13", isArchived: false }] }] satisfies AdminCourse[];

export default async function ClassesPage({ searchParams }: ClassesPageProps) {
  const params = await searchParams;
  const preview = process.env.NODE_ENV === "development" && params.preview === "1";
  const access = preview ? previewAccess : await getCurrentAdminAccess();
  if (!access) redirect("/dashboard");

  const courses = preview ? previewCourses : await listAdminCourses();

  return (
    <AdminShell currentPath="/admin/classes" email={access.email} preview={preview} role={access.role}>
      <AdminPageHeader description="Manage the Courses and Classes members can see. Create dated Sessions from Today & Upcoming when the programme is ready to run." title="Programme Setup" />
      <section className="max-w-5xl px-4 py-8 md:px-8 lg:px-10">
        <CoursesPanel courses={courses} />
      </section>
    </AdminShell>
  );
}
