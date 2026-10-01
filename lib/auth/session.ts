import "server-only";

import { timingSafeEqual } from "node:crypto";

import { and, eq, gt } from "drizzle-orm";
import { cookies } from "next/headers";
import { cache } from "react";

import { getDatabase } from "../db/client";
import { authSessions, userAccounts } from "../db/schema";
import { generateRawSessionToken, generateSessionId, hashAuthToken } from "./crypto";

const SESSION_COOKIE_NAME = "__session";
const SESSION_DURATION_SECONDS = 30 * 24 * 60 * 60;
const SESSION_RENEWAL_SECONDS = 7 * 24 * 60 * 60;
const SESSION_WRITE_THROTTLE_MS = 24 * 60 * 60 * 1000;

export type SessionUser = { id: string; email: string; role: "user" | "admin" | "su" };

async function getSessionUserInternal(): Promise<SessionUser | null> {
  if (!process.env.DATABASE_URL) return null;
  const cookieStore = await cookies();
  const value = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!value) return null;
  const separator = value.indexOf(".");
  if (separator <= 0 || separator === value.length - 1) return null;

  const sessionId = value.slice(0, separator);
  const rawToken = value.slice(separator + 1);
  const [session] = await getDatabase()
    .select({
      tokenHash: authSessions.tokenHash,
      expiresAt: authSessions.expiresAt,
      updatedAt: authSessions.updatedAt,
      userAccountId: userAccounts.id,
      email: userAccounts.email,
      role: userAccounts.role,
    })
    .from(authSessions)
    .innerJoin(userAccounts, eq(authSessions.userAccountId, userAccounts.id))
    .where(and(eq(authSessions.id, sessionId), gt(authSessions.expiresAt, new Date())))
    .limit(1);
  if (!session) return null;

  const expected = Buffer.from(session.tokenHash, "hex");
  const actual = Buffer.from(hashAuthToken(rawToken), "hex");
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null;

  const now = Date.now();
  if (
    session.expiresAt.getTime() - now < SESSION_RENEWAL_SECONDS * 1000 &&
    now - session.updatedAt.getTime() > SESSION_WRITE_THROTTLE_MS
  ) {
    await getDatabase()
      .update(authSessions)
      .set({ expiresAt: new Date(now + SESSION_DURATION_SECONDS * 1000), updatedAt: new Date() })
      .where(eq(authSessions.id, sessionId));
  }

  return { id: session.userAccountId, email: session.email, role: session.role };
}

export const getSessionUser = cache(getSessionUserInternal);

export async function createSession(userAccountId: string) {
  const id = generateSessionId();
  const rawToken = generateRawSessionToken();
  const now = new Date();
  await getDatabase().insert(authSessions).values({
    id,
    userAccountId,
    tokenHash: hashAuthToken(rawToken),
    expiresAt: new Date(now.getTime() + SESSION_DURATION_SECONDS * 1000),
    createdAt: now,
    updatedAt: now,
  });
  return `${id}.${rawToken}`;
}

export async function setSessionCookie(value: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_SECONDS,
  });
}

export async function destroyCurrentSession() {
  const cookieStore = await cookies();
  const value = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  cookieStore.delete(SESSION_COOKIE_NAME);
  if (!value) return;
  const separator = value.indexOf(".");
  if (separator <= 0 || separator === value.length - 1) return;
  const id = value.slice(0, separator);
  const rawToken = value.slice(separator + 1);
  await getDatabase().delete(authSessions).where(and(eq(authSessions.id, id), eq(authSessions.tokenHash, hashAuthToken(rawToken))));
}
