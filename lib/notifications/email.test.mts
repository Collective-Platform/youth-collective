import assert from "node:assert/strict";
import test from "node:test";

import type { TransactionSql } from "postgres";

import { listPendingNotificationDeliveryIdsInTransaction } from "./email.ts";

test("notification recovery includes stale sending deliveries", async () => {
  let query = "";
  const transaction = (async (strings: TemplateStringsArray) => {
    query = strings.join("?").replace(/\s+/g, " ").trim();
    return [{ id: "delivery-1" }];
  }) as unknown as TransactionSql;

  const ids = await listPendingNotificationDeliveryIdsInTransaction(transaction, 25);

  assert.deepEqual(ids, ["delivery-1"]);
  assert.match(query, /status = 'sending'/);
  assert.match(query, /last_attempted_at < now\(\) - interval '10 minutes'/);
});
