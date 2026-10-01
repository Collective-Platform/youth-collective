"use server";

import { revalidatePath } from "next/cache";
import { after } from "next/server";

import { getCurrentUser } from "../auth/user";
import {
  cancelBooking,
  leaveWaitlist,
  reserveSession,
  type CancelBookingResult,
  type LeaveWaitlistResult,
  type ReserveSessionResult,
} from "../db/repositories/booking-commands";
import { findPersonProfileForUserAccount } from "../db/repositories/people";
import { dispatchNotificationDelivery } from "../notifications/email";

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type BookingActionResult =
  | ReserveSessionResult
  | CancelBookingResult
  | LeaveWaitlistResult
  | { kind: "authentication_required" }
  | { kind: "profile_required" }
  | { kind: "invalid_request" };

async function getCurrentPersonId() {
  const user = await getCurrentUser();
  if (!user) return null;
  const profile = await findPersonProfileForUserAccount(user.id);
  const personId = profile?.id ?? null;
  return { user, personId };
}

async function dispatchNotifications(...deliveryIds: Array<string | null>) {
  await Promise.allSettled(
    deliveryIds.filter((deliveryId): deliveryId is string => Boolean(deliveryId)).map(dispatchNotificationDelivery),
  );
}

/** Authenticated member action for a Session Booking or Waitlist entry. */
export async function bookSessionAction(sessionId: string): Promise<BookingActionResult> {
  if (!uuidPattern.test(sessionId)) {
    return { kind: "invalid_request" };
  }

  const current = await getCurrentPersonId();
  if (!current) return { kind: "authentication_required" };
  if (!current.personId) {
    return { kind: "profile_required" };
  }

  const result = await reserveSession(current.personId, sessionId, { changedByUserAccountId: current.user.id });
  revalidatePath("/classes");
  revalidatePath("/dashboard");
  if (result.kind === "confirmed" || result.kind === "waitlisted") {
    after(() => dispatchNotifications(result.notificationDeliveryId));
  }
  return result;
}

/** Authenticated member action for cancelling only the caller's future Booking. */
export async function cancelBookingAction(bookingId: string): Promise<BookingActionResult> {
  if (!uuidPattern.test(bookingId)) {
    return { kind: "invalid_request" };
  }

  const current = await getCurrentPersonId();
  if (!current) return { kind: "authentication_required" };
  if (!current.personId) {
    return { kind: "profile_required" };
  }

  const result = await cancelBooking(current.personId, bookingId, { changedByUserAccountId: current.user.id });
  revalidatePath("/classes");
  revalidatePath("/dashboard");
  if (result.kind === "cancelled") {
    after(() => dispatchNotifications(result.notificationDeliveryId, result.promotionNotificationDeliveryId));
  }
  return result;
}

/** Authenticated member action for leaving only the caller's active Waitlist entry. */
export async function leaveWaitlistAction(waitlistEntryId: string): Promise<BookingActionResult> {
  if (!uuidPattern.test(waitlistEntryId)) return { kind: "invalid_request" };

  const current = await getCurrentPersonId();
  if (!current) return { kind: "authentication_required" };
  if (!current.personId) return { kind: "profile_required" };

  const result = await leaveWaitlist(current.personId, waitlistEntryId);
  revalidatePath("/classes");
  revalidatePath("/dashboard");
  return result;
}
