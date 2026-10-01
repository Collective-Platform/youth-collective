import { createSessionCalendar } from "../../../../../lib/calendar";
import { listUpcomingPublicSessions } from "../../../../../lib/db/repositories/sessions";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = (await listUpcomingPublicSessions()).find((item) => item.id === id);
  if (!session) return new Response("Class not found", { status: 404 });

  const calendar = createSessionCalendar({
    id: session.id,
    title: session.className,
    description: session.description || session.courseDescription,
    location: session.location,
    startsAt: session.startsAt,
    endsAt: session.endsAt,
  });
  return new Response(calendar, {
    headers: {
      "Cache-Control": "private, no-store",
      "Content-Disposition": `attachment; filename="class-${session.id}.ics"`,
      "Content-Type": "text/calendar; charset=utf-8",
    },
  });
}
