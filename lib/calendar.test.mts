import assert from "node:assert/strict";
import test from "node:test";

import { createSessionCalendar } from "./calendar.ts";

test("calendar events use UTC and escape participant-facing text", () => {
  const calendar = createSessionCalendar({
    id: "session-1",
    title: "Prayer, Practice; Presence",
    description: "Bring notes\nand questions",
    location: "Room 1, Collective",
    startsAt: new Date("2030-05-02T11:30:00.000Z"),
    endsAt: new Date("2030-05-02T13:00:00.000Z"),
  }, new Date("2030-01-01T00:00:00.000Z"));

  assert.match(calendar, /DTSTART:20300502T113000Z/);
  assert.match(calendar, /DTEND:20300502T130000Z/);
  assert.match(calendar, /SUMMARY:Prayer\\, Practice\\; Presence/);
  assert.match(calendar, /DESCRIPTION:Bring notes\\nand questions/);
  assert.match(calendar, /LOCATION:Room 1\\, Collective/);
});
