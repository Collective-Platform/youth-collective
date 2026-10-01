import "server-only";

import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres, { type Sql } from "postgres";

import * as schema from "./schema.ts";

type Database = PostgresJsDatabase<typeof schema>;

type DatabaseConnection = {
  database: Database;
  sql: Sql;
};

const globalForDatabase = globalThis as typeof globalThis & {
  bookingDatabase?: DatabaseConnection;
};

function getDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required before using the booking database.");
  }

  return databaseUrl;
}

/**
 * Returns the server-only Postgres connection used by booking repositories.
 * The client is created lazily so linting and static builds do not require
 * deployment credentials.
 */
export function getDatabase() {
  if (!globalForDatabase.bookingDatabase) {
    const sql = postgres(getDatabaseUrl(), { prepare: false });

    globalForDatabase.bookingDatabase = {
      sql,
      database: drizzle(sql, { schema }),
    };
  }

  return globalForDatabase.bookingDatabase.database;
}

/** Exported for repository transactions without leaking database setup. */
export function getSqlClient() {
  getDatabase();
  return globalForDatabase.bookingDatabase!.sql;
}
