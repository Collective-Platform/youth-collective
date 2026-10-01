import "server-only";

import type { TransactionSql } from "postgres";

import { getSqlClient } from "./client.ts";

/**
 * Runs booking data changes in one Postgres transaction. Repository modules
 * are the only place booking features should access this helper.
 */
export async function withDatabaseTransaction<T>(
  work: (transaction: TransactionSql) => Promise<T>,
) {
  return getSqlClient().begin(async (transaction) => {
    await transaction`set local search_path to collective, public`;
    return work(transaction);
  });
}
