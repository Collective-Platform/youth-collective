import { NextResponse } from "next/server";

import { getCurrentAdminAccess } from "../../../../lib/admin/authorization";
import { reportDateRange } from "../../../../lib/admin/reporting";
import { csvDocument } from "../../../../lib/csv";
import { getHistoricalRosterExport } from "../../../../lib/db/repositories/admin-reports";

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function GET(request: Request) {
  const access = await getCurrentAdminAccess();
  if (!access) return new NextResponse("Administrator permission is required.", { status: 403 });

  const params = new URL(request.url).searchParams;
  const range = reportDateRange(params.get("from") ?? undefined, params.get("to") ?? undefined);
  const requestedCourseId = params.get("course") ?? "";
  if (requestedCourseId && !uuidPattern.test(requestedCourseId)) return new NextResponse("Invalid Course.", { status: 400 });
  const rows = await getHistoricalRosterExport({ from: range.fromDate, to: range.toDate, courseId: requestedCourseId || undefined });
  const body = csvDocument([
    ["session_id", "course", "class", "session", "starts_at", "location", "person", "email", "mobile", "booking_status", "privacy_consent_at", "booking_consent_at"],
    ...rows.map((row) => [
      row.sessionId,
      row.courseName,
      row.className,
      row.sessionName,
      row.startsAt.toISOString(),
      row.location,
      row.personName,
      row.email,
      row.mobile,
      row.bookingStatus,
      row.privacyConsentAt?.toISOString() ?? "",
      row.bookingConsentAt?.toISOString() ?? "",
    ]),
  ]);

  return new NextResponse(body, {
    headers: {
      "Content-Disposition": `attachment; filename="programme-history-${range.from}-to-${range.to}.csv"`,
      "Content-Type": "text/csv; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
