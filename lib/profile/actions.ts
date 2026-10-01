"use server";

import { revalidatePath } from "next/cache";

import { requireCurrentUser } from "../auth/user";
import { findPersonProfileForUserAccount, saveMyPersonProfile } from "../db/repositories/people";

export type SaveProfileInput = {
  name: string;
  mobile: string;
  birthDate?: string;
  ageBand?: string;
  bookingConsent?: boolean;
};

export type SaveProfileResult = { ok: true } | { ok: false; message: string };

const datePattern = /^\d{4}-\d{2}-\d{2}$/;

/** Authenticated member action for creating or updating only the caller's booking profile. */
export async function saveMyProfileAction(input: SaveProfileInput): Promise<SaveProfileResult> {
  const user = await requireCurrentUser();
  const name = input.name.trim();
  const mobile = input.mobile.trim();
  const ageBand = input.ageBand?.trim();
  const existingProfile = await findPersonProfileForUserAccount(user.id);

  if (name.length < 2 || name.length > 120) return { ok: false, message: "Enter your full name." };
  if (mobile.length < 7 || mobile.length > 30) return { ok: false, message: "Enter a valid mobile number." };
  if (!existingProfile && !input.bookingConsent) return { ok: false, message: "Consent to record your Booking and attendance is required to book." };
  if (input.birthDate && !datePattern.test(input.birthDate)) return { ok: false, message: "Enter a valid birth date." };
  if (ageBand && ageBand.length > 40) return { ok: false, message: "Choose a valid age band." };

  await saveMyPersonProfile({
    userAccountId: user.id,
    name,
    mobile,
    birthDate: input.birthDate,
    ageBand,
    recordBookingConsent: !existingProfile,
  });
  revalidatePath("/dashboard");
  revalidatePath("/classes");
  return { ok: true };
}
