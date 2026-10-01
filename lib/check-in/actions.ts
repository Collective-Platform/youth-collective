"use server";

import { revalidatePath } from "next/cache";

import { getCurrentUser } from "../auth/user";
import { selfCheckIn, type SelfCheckInResult } from "../db/repositories/check-in";
import { findPersonProfileForUserAccount } from "../db/repositories/people";

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type CheckInActionResult =
  | SelfCheckInResult
  | { kind: "authentication_required" }
  | { kind: "profile_required" }
  | { kind: "invalid_request" };

/** Authenticated member action for self-checking in to only their own Booking. */
export async function selfCheckInAction(token: string, confirmWalkIn = false): Promise<CheckInActionResult> {
  if (!uuidPattern.test(token)) return { kind: "invalid_request" };
  const user = await getCurrentUser();
  if (!user) return { kind: "authentication_required" };
  const personId = (await findPersonProfileForUserAccount(user.id))?.id ?? null;
  if (!personId) return { kind: "profile_required" };

  const result = await selfCheckIn(personId, user.id, token, confirmWalkIn);
  if (result.kind === "checked_in") {
    revalidatePath(`/check-in/${token}`);
    revalidatePath("/dashboard");
  }
  return result;
}
