import assert from "node:assert/strict";
import test from "node:test";

import type { TransactionSql } from "postgres";

import { selfCheckInInTransaction } from "./check-in.ts";

test("self check-in is blocked after attendance is finalized", async () => {
  let queryCount = 0;
  const transaction = (async () => {
    queryCount += 1;
    return [{
      id: "session-1",
      status: "scheduled",
      check_in_opens_at: new Date("2030-01-01T11:30:00Z"),
      check_in_closes_at: new Date("2030-01-01T12:30:00Z"),
      attendance_finalized_at: new Date("2030-01-01T12:05:00Z"),
    }];
  }) as unknown as TransactionSql;

  const result = await selfCheckInInTransaction(
    transaction,
    "person-1",
    "account-1",
    "token-1",
    false,
    new Date("2030-01-01T12:10:00Z"),
  );

  assert.deepEqual(result, { kind: "session_unavailable" });
  assert.equal(queryCount, 1);
});
