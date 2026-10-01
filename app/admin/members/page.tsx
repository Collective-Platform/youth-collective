import Link from "next/link";
import { Search, UsersRound } from "lucide-react";
import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AdminPageHeader, AdminShell } from "../AdminShell";
import { getCurrentAdminAccess } from "../../../lib/admin/authorization";
import { listAdminMembers, type AdminMember } from "../../../lib/db/repositories/admin";

export const dynamic = "force-dynamic";

type MembersPageProps = {
  searchParams: Promise<{ preview?: string; q?: string }>;
};

const previewAccess = { id: "d756f94e-63bd-4d07-8e4d-848e8d75edfe", email: "staff-preview@example.test", role: "admin" as const };
const previewMembers = [
  { id: "b8db9ed0-8ac3-4861-901f-810436236819", name: "Amira Khan", email: "amira@example.test", mobile: "+32 470 12 34 56", birthDate: "2010-05-14", createdAt: new Date("2026-07-02T10:00:00+08:00"), bookingCount: 4 },
  { id: "3137b83d-2edf-48bc-8871-ac6c36ffb46e", name: "Noah Martin", email: "noah@example.test", mobile: "+32 471 98 76 54", birthDate: "2011-11-03", createdAt: new Date("2026-07-12T10:00:00+08:00"), bookingCount: 2 },
  { id: "e5ca0e42-8058-4463-b0cb-742f631c6bb6", name: "Lina De Smet", email: "lina@example.test", mobile: "+32 474 33 22 11", birthDate: "2014-02-22", createdAt: new Date("2026-07-29T10:00:00+08:00"), bookingCount: 6 },
  { id: "6b5515f2-9022-4966-87a1-e0a40151903f", name: "Ilias Vermeulen", email: "ilias@example.test", mobile: "+32 475 55 44 33", birthDate: null, createdAt: new Date("2026-08-18T09:15:00+08:00"), bookingCount: 1 },
] satisfies AdminMember[];

const joinedFormatter = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" });
const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function formatBirthDate(value: string) {
  const [year, month, day] = value.split("-");
  return `${Number(day)} ${monthNames[Number(month) - 1]} ${year}`;
}

function includesQuery(member: AdminMember, query: string) {
  const normalizedQuery = query.toLocaleLowerCase();
  return [member.name, member.email, member.mobile].some((value) => value?.toLocaleLowerCase().includes(normalizedQuery));
}

/**
 * THESIS: The member directory makes the People staff need reachable in one focused scan.
 * STORY: Staff search a name, email, or mobile number, then confirm the correct member from their core details.
 * FIRST VIEWPORT: Search and the filtered member count lead directly into a clear, responsive directory.
 */
export default async function MembersPage({ searchParams }: MembersPageProps) {
  const params = await searchParams;
  const preview = process.env.NODE_ENV === "development" && params.preview === "1";
  const access = preview ? previewAccess : await getCurrentAdminAccess();
  if (!access) redirect("/dashboard");

  const query = params.q?.trim() ?? "";
  const members = preview ? previewMembers.filter((member) => includesQuery(member, query)) : await listAdminMembers(query);

  return (
    <AdminShell currentPath="/admin/members" email={access.email} preview={preview} previewMessage="Sample data only · Member data remains protected" role={access.role}>
      <AdminPageHeader description="Find a person and check their contact and participation record." title="People" />
          <section className="px-4 py-8 md:px-8 lg:px-10">
            <div className="max-w-5xl">
              <form action="/admin/members" className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]" method="get" role="search">
                {preview ? <input name="preview" type="hidden" value="1" /> : null}
                <label className="relative block">
                  <span className="sr-only">Search members</span>
                  <Search aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input className="h-10 pl-10" defaultValue={query} name="q" placeholder="Search by name, email, or mobile" type="search" />
                </label>
                <Button type="submit">Search</Button>
              </form>

              <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
                <p className="text-base font-semibold">{members.length} {members.length === 1 ? "member" : "members"}{query ? ` matching “${query}”` : ""}</p>
                {query ? <Button asChild variant="link"><Link href={preview ? "/admin/members?preview=1" : "/admin/members"}>Clear search</Link></Button> : null}
              </div>

              {members.length > 0 ? (
                <Card className="mt-4 py-0">
                  <Table className="min-w-180">
                    <TableHeader><TableRow><TableHead>Member</TableHead><TableHead>Contact</TableHead><TableHead>Birthday</TableHead><TableHead className="text-right">Bookings</TableHead><TableHead>Joined</TableHead></TableRow></TableHeader>
                    <TableBody>
                      {members.map((member) => (
                        <TableRow key={member.id}>
                          <TableCell className="font-medium"><Link className="hover:underline" href={preview ? `/admin/members/${member.id}?preview=1` : `/admin/members/${member.id}`}>{member.name ?? "Unnamed member"}</Link></TableCell>
                          <TableCell className="text-muted-foreground">{member.email ? <a className="hover:underline" href={`mailto:${member.email}`}>{member.email}</a> : "No login email"}<br />{member.mobile ?? "No mobile number"}</TableCell>
                          <TableCell className="text-muted-foreground">{member.birthDate ? formatBirthDate(member.birthDate) : "Not provided"}</TableCell>
                          <TableCell className="text-right font-medium tabular-nums">{member.bookingCount}</TableCell>
                          <TableCell className="text-muted-foreground">{joinedFormatter.format(member.createdAt)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              ) : (
                <Card className="mt-4 border-dashed"><CardContent className="py-10 text-center">
                  <UsersRound aria-hidden="true" className="mx-auto size-6 text-muted-foreground" />
                  <h2 className="mt-4 text-lg font-semibold">No members found</h2>
                  <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">Try a different name, email address, or mobile number.</p>
                </CardContent></Card>
              )}
            </div>
          </section>
    </AdminShell>
  );
}
