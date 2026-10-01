import { NextResponse } from "next/server";

import { getCurrentAdminAccess } from "../../../lib/admin/authorization";
import { csvDocument } from "../../../lib/csv";
import { getRosterCsvRows } from "../../../lib/db/repositories/admin";

export async function GET(request: Request) {
  const access = await getCurrentAdminAccess();
  if (!access) {
    return new NextResponse("Administrator permission is required.", { status: 403 });
  }
  const sessionId = new URL(request.url).searchParams.get("session");

  if (!sessionId) {
    return new NextResponse("A Session is required.", { status: 400 });
  }

  const { bookings, waitlist } = await getRosterCsvRows(sessionId);
  const rows = [
    ["list", "name", "email", "mobile", "status", "waitlist_joined"],
    ...bookings.map((booking) => ["booking", booking.name, booking.email, booking.mobile, booking.status, ""]),
    ...waitlist.map((entry) => [
      "waitlist",
      entry.name,
      entry.email,
      entry.mobile,
      "waiting",
      entry.createdAt.toISOString(),
    ]),
  ];
  const body = csvDocument(rows);

  return new NextResponse(body, {
    headers: {
      "Content-Disposition": `attachment; filename="session-${sessionId}-roster.csv"`,
      "Content-Type": "text/csv; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
