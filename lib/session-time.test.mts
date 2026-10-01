import assert from "node:assert/strict";
import test from "node:test";

import { formatSessionDateTimeInput, parseSessionDateTime } from "./session-time.ts";

test("Session times preserve their Kuala Lumpur wall-clock time regardless of the server timezone", () => {
  const input = "2026-08-21T12:30";
  const stored = parseSessionDateTime(input);

  assert.equal(stored.toISOString(), "2026-08-21T04:30:00.000Z");
  assert.equal(formatSessionDateTimeInput(stored), input);
});
