import Link from "next/link";
import { CalendarDays, UserRound } from "lucide-react";
import { notFound, redirect } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { AdminShell } from "../../AdminShell";
import { getCurrentAdminAccess } from "../../../../lib/admin/authorization";
import { getAdminMember, getMemberBookingHistory, type AdminMemberDetail, type MemberHistoryEntry } from "../../../../lib/db/repositories/admin";
import { SESSION_TIME_ZONE } from "../../../../lib/session-time";

export const dynamic = "force-dynamic";

type MemberDetailPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ preview?: string; tab?: string }>;
};

const previewAccess = { id: "d756f94e-63bd-4d07-8e4d-848e8d75edfe", email: "staff-preview@example.test", role: "admin" as const };
const previewMembers = [
  { id: "b8db9ed0-8ac3-4861-901f-810436236819", name: "Amira Khan", email: "amira@example.test", mobile: "+32 470 12 34 56", birthDate: "2010-05-14", createdAt: new Date("2026-07-02T10:00:00+08:00") },
  { id: "3137b83d-2edf-48bc-8871-ac6c36ffb46e", name: "Noah Martin", email: "noah@example.test", mobile: "+32 471 98 76 54", birthDate: "2011-11-03", createdAt: new Date("2026-07-12T10:00:00+08:00") },
  { id: "e5ca0e42-8058-4463-b0cb-742f631c6bb6", name: "Lina De Smet", email: "lina@example.test", mobile: "+32 474 33 22 11", birthDate: "2014-02-22", createdAt: new Date("2026-07-29T10:00:00+08:00") },
  { id: "6b5515f2-9022-4966-87a1-e0a40151903f", name: "Ilias Vermeulen", email: "ilias@example.test", mobile: "+32 475 55 44 33", birthDate: null, createdAt: new Date("2026-08-18T09:15:00+08:00") },
] satisfies AdminMemberDetail[];
const previewHistory = [
  { id: "f2818475-a351-41d9-a9d4-af787b767f0b", className: "Creative lab", startsAt: new Date("2026-08-10T16:30:00+08:00"), status: "attended" as const },
  { id: "9d642c8e-9b52-4e08-8cc0-87d45c4a6319", className: "After-school study club", startsAt: new Date("2026-07-27T16:00:00+08:00"), status: "attended" as const },
  { id: "2e3b0fb2-d266-4a64-b7f2-1ca482ef714e", className: "After-school study club", startsAt: new Date("2026-08-03T16:00:00+08:00"), status: "confirmed" as const },
] satisfies MemberHistoryEntry[];

const joinedFormatter = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric" });
const sessionDateFormatter = new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric", timeZone: SESSION_TIME_ZONE });
const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function formatBirthDate(value: string) {
  const [year, month, day] = value.split("-");
  return `${Number(day)} ${monthNames[Number(month) - 1]} ${year}`;
}

function detailHref(memberId: string, tab: "personal" | "participation", preview: boolean) {
  const params = new URLSearchParams({ tab });
  if (preview) params.set("preview", "1");
  return `/admin/members/${memberId}?${params}`;
}

/**
 * THESIS: A person record keeps contact details and their operational participation history close at hand.
 * STORY: Staff identify the person, then scan all booking states rather than an attended-only subset.
 */
export default async function MemberDetailPage({ params, searchParams }: MemberDetailPageProps) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const preview = process.env.NODE_ENV === "development" && query.preview === "1";
  const access = preview ? previewAccess : await getCurrentAdminAccess();
  if (!access) redirect("/dashboard");

  const tab = query.tab === "participation" || query.tab === "classes" ? "participation" : "personal";
  const [member, history] = preview
    ? [previewMembers.find((previewMember) => previewMember.id === id) ?? null, id === previewMembers[0].id ? previewHistory : []]
    : await Promise.all([getAdminMember(id), getMemberBookingHistory(id)]);
  if (!member) notFound();

  const participationCounts = {
    attended: history.filter((entry) => entry.status === "attended").length,
    confirmed: history.filter((entry) => entry.status === "confirmed").length,
    cancelled: history.filter((entry) => entry.status === "cancelled").length,
    noShow: history.filter((entry) => entry.status === "no_show").length,
  };
  const backHref = preview ? "/admin/members?preview=1" : "/admin/members";

  return (
    <AdminShell currentPath="/admin/members" email={access.email} preview={preview} previewMessage="Sample data only · Member data remains protected" role={access.role}>
          <header className="border-b bg-background px-4 py-6 md:px-8 lg:px-10">
            <Button asChild className="px-0" variant="link"><Link href={backHref}>All members</Link></Button>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight md:text-3xl">{member.name ?? "Unnamed member"}</h1>
          </header>
          <section className="px-4 py-8 md:px-8 lg:px-10">
            <div className="max-w-4xl">
              <nav aria-label="Member record sections" className="inline-flex rounded-lg bg-muted p-1" role="tablist">
                <Link aria-selected={tab === "personal"} className={cn("rounded-md px-3 py-1.5 text-sm font-medium no-underline", tab === "personal" ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground")} href={detailHref(member.id, "personal", preview)} role="tab">Personal information</Link>
                <Link aria-selected={tab === "participation"} className={cn("rounded-md px-3 py-1.5 text-sm font-medium no-underline", tab === "participation" ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground")} href={detailHref(member.id, "participation", preview)} role="tab">Participation</Link>
              </nav>

              {tab === "personal" ? (
                <Card className="mt-8" role="tabpanel"><CardHeader><CardTitle id="personal-information-heading">Personal information</CardTitle></CardHeader><CardContent><dl className="grid gap-6 sm:grid-cols-2"><div><dt className="text-sm text-muted-foreground">Email</dt><dd className="mt-1 break-all text-sm">{member.email ? <a className="hover:underline" href={`mailto:${member.email}`}>{member.email}</a> : "No login email"}</dd></div><div><dt className="text-sm text-muted-foreground">Mobile</dt><dd className="mt-1 text-sm">{member.mobile ? <a className="hover:underline" href={`tel:${member.mobile}`}>{member.mobile}</a> : "No mobile number"}</dd></div><div><dt className="text-sm text-muted-foreground">Birthday</dt><dd className="mt-1 text-sm">{member.birthDate ? formatBirthDate(member.birthDate) : "Not provided"}</dd></div><div><dt className="text-sm text-muted-foreground">Joined</dt><dd className="mt-1 text-sm">{joinedFormatter.format(member.createdAt)}</dd></div></dl></CardContent></Card>
              ) : (
                <Card className="mt-8" role="tabpanel"><CardHeader><CardTitle id="participation-heading">Participation</CardTitle></CardHeader><CardContent><div className="grid grid-cols-2 gap-4 sm:grid-cols-4">{[["Attended", participationCounts.attended], ["Expected", participationCounts.confirmed], ["Cancelled", participationCounts.cancelled], ["No show", participationCounts.noShow]].map(([label, value]) => <div key={label}><p className="text-sm text-muted-foreground">{label}</p><p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p></div>)}</div><Separator className="my-6" />{history.length > 0 ? <ul className="grid gap-3">{history.map((entry) => <li className="flex items-center justify-between gap-4 border-b pb-4 last:border-0 last:pb-0" key={entry.id}><div className="flex items-center gap-4"><CalendarDays aria-hidden="true" className="size-5 shrink-0 text-muted-foreground" /><div><p className="font-medium">{entry.className}</p><p className="mt-1 text-sm text-muted-foreground">{sessionDateFormatter.format(entry.startsAt)}</p></div></div><Badge variant={entry.status === "cancelled" || entry.status === "no_show" ? "destructive" : "secondary"}>{entry.status === "attended" ? "Attended" : entry.status === "confirmed" ? "Expected" : entry.status === "cancelled" ? "Cancelled" : "No show"}</Badge></li>)}</ul> : <div className="rounded-lg border border-dashed px-6 py-10 text-center"><UserRound aria-hidden="true" className="mx-auto size-6 text-muted-foreground" /><p className="mt-4 text-sm text-muted-foreground">No participation has been recorded yet.</p></div>}</CardContent></Card>
              )}
            </div>
          </section>
    </AdminShell>
  );
}
