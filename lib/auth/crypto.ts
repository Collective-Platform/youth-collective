import "server-only";

import { createHmac, randomBytes, randomInt } from "node:crypto";

function getSessionSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET is required for email OTP authentication.");
  return secret;
}

export function generateOtp() {
  return randomInt(0, 1_000_000).toString().padStart(6, "0");
}

export function hashAuthToken(value: string) {
  return createHmac("sha256", getSessionSecret()).update(value).digest("hex");
}

export function generateRawSessionToken() {
  return randomBytes(32).toString("hex");
}

export function generateSessionId() {
  return randomBytes(21).toString("base64url");
}
