import "server-only";

import { and, eq, sql } from "drizzle-orm";

import { getDatabase } from "../db/client";
import { authRateLimitAttempts } from "../db/schema";

export type AuthRateLimitAction = "otp_request" | "otp_verify";

export async function checkAuthRateLimit(input: {
  identifier: string;
  action: AuthRateLimitAction;
  maxAttempts: number;
  windowMinutes: number;
}) {
  const now = new Date();
  const windowStart = new Date(now.getTime() - input.windowMinutes * 60 * 1000);
  const [attempt] = await getDatabase()
    .insert(authRateLimitAttempts)
    .values({
      identifier: input.identifier,
      action: input.action,
      attemptCount: 1,
      windowStartedAt: now,
      lastAttemptAt: now,
    })
    .onConflictDoUpdate({
      target: [authRateLimitAttempts.identifier, authRateLimitAttempts.action],
      set: {
        attemptCount: sql`CASE WHEN ${authRateLimitAttempts.windowStartedAt} <= ${windowStart.toISOString()} THEN 1 ELSE ${authRateLimitAttempts.attemptCount} + 1 END`,
windowStartedAt: sql`CASE WHEN ${authRateLimitAttempts.windowStartedAt} <= ${windowStart.toISOString()} THEN ${now.toISOString()} ELSE ${authRateLimitAttempts.windowStartedAt} END`,
        lastAttemptAt: now,
      },
    })
    .returning({ attemptCount: authRateLimitAttempts.attemptCount });

  return { allowed: attempt.attemptCount <= input.maxAttempts };
}

export async function resetAuthRateLimit(identifier: string, action: AuthRateLimitAction) {
  await getDatabase()
    .delete(authRateLimitAttempts)
    .where(and(eq(authRateLimitAttempts.identifier, identifier), eq(authRateLimitAttempts.action, action)));
}
