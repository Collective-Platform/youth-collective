export type CalendarSession = {
  id: string;
  title: string;
  description?: string | null;
  location?: string | null;
  startsAt: Date;
  endsAt: Date;
};

function escapeIcs(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/\r?\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
}

function formatUtc(value: Date) {
  return value.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

/** Produces a portable UTC iCalendar event for one public Session. */
export function createSessionCalendar(session: CalendarSession, generatedAt = new Date()) {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Collective//Strictly Students Classes//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${session.id}@collective.my`,
    `DTSTAMP:${formatUtc(generatedAt)}`,
    `DTSTART:${formatUtc(session.startsAt)}`,
    `DTEND:${formatUtc(session.endsAt)}`,
    `SUMMARY:${escapeIcs(session.title)}`,
  ];
  if (session.description) lines.push(`DESCRIPTION:${escapeIcs(session.description)}`);
  if (session.location) lines.push(`LOCATION:${escapeIcs(session.location)}`);
  lines.push("END:VEVENT", "END:VCALENDAR", "");
  return lines.join("\r\n");
}
