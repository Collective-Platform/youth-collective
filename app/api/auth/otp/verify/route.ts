import { and, eq, gt, isNull } from "drizzle-orm";
import { NextResponse } from "next/server";

import { createSession, setSessionCookie } from "../../../../../lib/auth/session";
import { hashAuthToken } from "../../../../../lib/auth/crypto";
import { checkAuthRateLimit, resetAuthRateLimit } from "../../../../../lib/auth/rate-limit";
import { getDatabase } from "../../../../../lib/db/client";
import { people, pendingAuth, userAccounts } from "../../../../../lib/db/schema";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const otpPattern = /^\d{6}$/;

export async function POST(request: Request) {
  let email = "";
  let otp = "";
  let mode: "login" | "signup" = "login";
  let privacyConsent = false;
  try {
    const body = await request.json();
    email = String(body.email ?? "").trim().toLowerCase();
    otp = String(body.otp ?? "").trim();
    mode = body.mode === "signup" ? "signup" : "login";
    privacyConsent = body.privacyConsent === true;
  } catch {
    return NextResponse.json({ ok: false, message: "Enter your email and six-digit code." }, { status: 400 });
  }
  if (!emailPattern.test(email) || !otpPattern.test(otp)) {
    return NextResponse.json({ ok: false, message: "Enter your email and six-digit code." }, { status: 400 });
  }
  if (mode === "signup" && !privacyConsent) {
    return NextResponse.json({ ok: false, message: "Agree to the Terms of Use, Privacy Policy and Refund Policy to create an account." }, { status: 400 });
  }

  const { allowed } = await checkAuthRateLimit({
    identifier: email,
    action: "otp_verify",
    maxAttempts: 10,
    windowMinutes: 5,
  });
  if (!allowed) {
    return NextResponse.json({ ok: false, message: "Too many attempts. Please try again later." }, { status: 429 });
  }

  const now = new Date();
  const database = getDatabase();
  const [pending] = await database
    .update(pendingAuth)
    .set({ consumedAt: now })
    .where(
      and(
        eq(pendingAuth.email, email),
        eq(pendingAuth.mode, mode),
        eq(pendingAuth.tokenHash, hashAuthToken(otp)),
        gt(pendingAuth.expiresAt, now),
        isNull(pendingAuth.consumedAt),
      ),
    )
    .returning({ id: pendingAuth.id });
  if (!pending) {
    return NextResponse.json({ ok: false, message: "That code is invalid or has expired." }, { status: 401 });
  }

  let userAccount: { id: string } | undefined;
  if (mode === "signup") {
    await database.transaction(async (transaction) => {
      const [person] = await transaction.insert(people).values({ privacyConsentAt: now, createdAt: now, updatedAt: now }).returning({ id: people.id });
      [userAccount] = await transaction
        .insert(userAccounts)
        .values({ personId: person.id, email, emailVerifiedAt: now, updatedAt: now })
        .onConflictDoNothing()
        .returning({ id: userAccounts.id });
      if (!userAccount) {
        await transaction.delete(people).where(eq(people.id, person.id));
      }
    });
  } else {
    [userAccount] = await database
      .update(userAccounts)
      .set({ emailVerifiedAt: now, updatedAt: now })
      .where(eq(userAccounts.email, email))
      .returning({ id: userAccounts.id });
  }
  if (!userAccount) return NextResponse.json({ ok: false, message: "That code is invalid or has expired." }, { status: 401 });
  await resetAuthRateLimit(email, "otp_verify");
  await setSessionCookie(await createSession(userAccount.id));

  return NextResponse.json({ ok: true });
}
