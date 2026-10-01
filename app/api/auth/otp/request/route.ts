import { and, eq, gt, isNull } from "drizzle-orm";
import { NextResponse } from "next/server";

import { generateOtp, hashAuthToken } from "../../../../../lib/auth/crypto";
import { sendSignInOtp } from "../../../../../lib/auth/email";
import { checkAuthRateLimit } from "../../../../../lib/auth/rate-limit";
import { getDatabase } from "../../../../../lib/db/client";
import { pendingAuth, userAccounts } from "../../../../../lib/db/schema";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const OTP_TTL_MS = 10 * 60 * 1000;

export async function POST(request: Request) {
  let email = "";
  let mode: "login" | "signup" = "login";
  try {
    const body = await request.json();
    email = String(body.email ?? "").trim().toLowerCase();
    mode = body.mode === "signup" ? "signup" : "login";
  } catch {
    return NextResponse.json({ ok: false, message: "Enter a valid email address." }, { status: 400 });
  }
  if (!emailPattern.test(email)) {
    return NextResponse.json({ ok: false, message: "Enter a valid email address." }, { status: 400 });
  }

  const [existingUser] = await getDatabase()
    .select({ id: userAccounts.id })
    .from(userAccounts)
    .where(eq(userAccounts.email, email))
    .limit(1);
  if (mode === "login" && !existingUser) {
    return NextResponse.json({ ok: false, code: "NOT_EXISTS", message: "No account exists for this email. Please sign up." }, { status: 404 });
  }
  if (mode === "signup" && existingUser) {
    return NextResponse.json({ ok: false, code: "ALREADY_EXISTS", message: "An account already exists for this email. Please sign in." }, { status: 409 });
  }

  const { allowed } = await checkAuthRateLimit({
    identifier: email,
    action: "otp_request",
    maxAttempts: 5,
    windowMinutes: 15,
  });
  if (!allowed) {
    return NextResponse.json({ ok: false, message: "Too many codes requested. Please wait 15 minutes." }, { status: 429 });
  }

  const now = new Date();
  await getDatabase()
    .update(pendingAuth)
    .set({ consumedAt: now })
    .where(and(eq(pendingAuth.email, email), eq(pendingAuth.mode, mode), isNull(pendingAuth.consumedAt), gt(pendingAuth.expiresAt, now)));

  const otp = generateOtp();
  await getDatabase().insert(pendingAuth).values({
    email,
    mode,
    tokenHash: hashAuthToken(otp),
    expiresAt: new Date(now.getTime() + OTP_TTL_MS),
  });

  try {
    await sendSignInOtp(email, otp);
  } catch (error) {
    console.error("Unable to send email OTP", error);
    return NextResponse.json({ ok: false, message: "We could not send a verification code. Please try again." }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
