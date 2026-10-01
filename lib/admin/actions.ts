"use server";

import { revalidatePath } from "next/cache";
import { after } from "next/server";

import { requireAdminAccess } from "./authorization";
import { parseSessionDateTime } from "../session-time";
import {
  createSessionRecords,
  createCourseRecord,
  createWalkInRecord,
  checkInPersonByStaff,
  finalizeAttendanceRecord,
  promoteWaitlistEntryByStaff,
  removeWaitlistEntryByStaff,
  reopenAttendanceRecord,
  retryFailedSessionNotifications,
  transferBookingRecord,
  setClassArchiveStatus,
  setCourseArchiveStatus,
  setBookingStatusByStaff,
  updateClassRecord,
  updateCourseRecord,
  updateSessionRecord,
  setUpcomingSessionLocationsForClass,
} from "../db/repositories/admin-commands";
import { reserveSession, type ReserveSessionResult } from "../db/repositories/booking-commands";
import { dispatchNotificationDelivery } from "../notifications/email";

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const sessionDatePattern = /^\d{4}-\d{2}-\d{2}$/;
const sessionTimePattern = /^\d{2}:\d{2}$/;

function requiredText(formData: FormData, name: string, maximum = 500) {
  const value = String(formData.get(name) ?? "").trim();
  if (!value || value.length > maximum) throw new Error(`Enter a valid ${name}.`);
  return value;
}

function optionalText(formData: FormData, name: string, maximum = 500) {
  const value = String(formData.get(name) ?? "").trim();
  if (value.length > maximum) throw new Error(`Enter a valid ${name}.`);
  return value;
}

function coursePublicStatus(formData: FormData) {
  const value = formData.get("publicStatus");
  if (value === "active" || value === "coming_next" || value === "hidden") return value;
  throw new Error("Choose a valid public Course status.");
}

function dateTime(formData: FormData, name: string) {
  const value = requiredText(formData, name, 40);
  const date = parseSessionDateTime(value);
  if (Number.isNaN(date.valueOf())) throw new Error(`Enter a valid ${name}.`);
  return date;
}

function selectedSessionDates(formData: FormData) {
  const dates = [...new Set(String(formData.get("dates") ?? "").split(",").filter(Boolean))].sort();
  if (dates.length === 0 || dates.length > 100) throw new Error("Select between 1 and 100 Session dates.");
  for (const value of dates) {
    if (!sessionDatePattern.test(value)) throw new Error("Select valid Session dates.");
    const parsed = new Date(`${value}T00:00:00Z`);
    if (Number.isNaN(parsed.valueOf()) || parsed.toISOString().slice(0, 10) !== value) throw new Error("Select valid Session dates.");
  }
  return dates;
}

function sessionTime(formData: FormData, name: string) {
  const value = requiredText(formData, name, 5);
  if (!sessionTimePattern.test(value)) throw new Error(`Enter a valid ${name}.`);
  return value;
}

function capacity(formData: FormData) {
  const value = Number(formData.get("capacity"));
  if (!Number.isInteger(value) || value < 1 || value > 500) throw new Error("Capacity must be a whole number from 1 to 500.");
  return value;
}

function refreshAdmin() {
  revalidatePath("/admin", "layout");
  revalidatePath("/classes");
  revalidatePath("/dashboard");
}

export async function updateClassAction(classId: string, formData: FormData) {
  await requireAdminAccess();
  if (!uuidPattern.test(classId)) throw new Error("Invalid Class.");
  await updateClassRecord(classId, {
    name: requiredText(formData, "name", 120),
    description: String(formData.get("description") ?? "").trim(),
    audience: String(formData.get("audience") ?? "").trim(),
  });
  refreshAdmin();
}

export async function createCourseAction(formData: FormData) {
  await requireAdminAccess();
  await createCourseRecord({
    name: requiredText(formData, "name", 120),
    description: optionalText(formData, "description", 2_000),
    publicStatus: coursePublicStatus(formData),
  });
  refreshAdmin();
}

export async function updateCourseAction(courseId: string, formData: FormData) {
  await requireAdminAccess();
  if (!uuidPattern.test(courseId)) throw new Error("Invalid Course.");
  await updateCourseRecord(courseId, {
    name: requiredText(formData, "name", 120),
    description: optionalText(formData, "description", 2_000),
    publicStatus: coursePublicStatus(formData),
  });
  refreshAdmin();
}

export async function setCourseArchiveAction(courseId: string, isArchived: boolean) {
  await requireAdminAccess();
  if (!uuidPattern.test(courseId)) throw new Error("Invalid Course.");
  await setCourseArchiveStatus(courseId, isArchived);
  refreshAdmin();
}

export async function setClassArchiveAction(classId: string, isArchived: boolean) {
  await requireAdminAccess();
  if (!uuidPattern.test(classId)) throw new Error("Invalid Class.");
  await setClassArchiveStatus(classId, isArchived);
  refreshAdmin();
}

export async function setUpcomingSessionLocationsAction(classId: string, formData: FormData) {
  await requireAdminAccess();
  if (!uuidPattern.test(classId)) throw new Error("Invalid Class.");
  await setUpcomingSessionLocationsForClass(classId, optionalText(formData, "location", 200));
  refreshAdmin();
}

export async function createSessionsAction(formData: FormData) {
  await requireAdminAccess();
  const classSelection = requiredText(formData, "classId", 50);
  const courseSelection = requiredText(formData, "courseId", 50);
  const newCourse = courseSelection === "__create_new_course__"
    ? { name: requiredText(formData, "newCourseName", 120), description: optionalText(formData, "newCourseDescription", 2_000) }
    : null;
  const newClass = classSelection === "__create_new_class__"
    ? {
        courseId: newCourse ? undefined : courseSelection,
        name: requiredText(formData, "newClassName", 120),
        audience: requiredText(formData, "newClassAudience", 120),
        description: requiredText(formData, "newClassDescription", 2_000),
      }
    : null;
  if (!newClass && !uuidPattern.test(classSelection)) throw new Error("Invalid Class.");
  if (newClass && !newCourse && !uuidPattern.test(courseSelection)) throw new Error("Invalid Course.");
  const dates = selectedSessionDates(formData);
  const startsAtTime = sessionTime(formData, "startsAtTime");
  const endsAtTime = sessionTime(formData, "endsAtTime");
  const occurrences = dates.map((date) => ({
    startsAt: parseSessionDateTime(`${date}T${startsAtTime}`),
    endsAt: parseSessionDateTime(`${date}T${endsAtTime}`),
  }));
  if (occurrences.some((occurrence) => Number.isNaN(occurrence.startsAt.valueOf()) || Number.isNaN(occurrence.endsAt.valueOf()) || occurrence.endsAt <= occurrence.startsAt)) {
    throw new Error("Each Session must end after it starts.");
  }
  await createSessionRecords({
    classId: newClass ? undefined : classSelection,
    newClass,
    newCourse,
    occurrences,
    capacity: capacity(formData),
    location: optionalText(formData, "location", 200),
    autoLabel: formData.get("autoLabel") === "on",
  });
  refreshAdmin();
}

export async function updateSessionAction(sessionId: string, formData: FormData) {
  const user = await requireAdminAccess();
  if (!uuidPattern.test(sessionId)) throw new Error("Invalid Session.");
  const startsAt = dateTime(formData, "startsAt");
  const endsAt = dateTime(formData, "endsAt");
  if (endsAt <= startsAt) throw new Error("A Session must end after it starts.");
  const status = formData.get("status") === "cancelled" ? "cancelled" : "scheduled";
  const sessionCapacity = capacity(formData);
  const checkInOpensAt = dateTime(formData, "checkInOpensAt");
  const checkInClosesAt = dateTime(formData, "checkInClosesAt");
  if (checkInClosesAt <= checkInOpensAt) throw new Error("Check-in must close after it opens.");
  const notificationDeliveryIds = await updateSessionRecord(sessionId, {
    startsAt,
    endsAt,
    capacity: sessionCapacity,
    location: optionalText(formData, "location", 200),
    displayName: optionalText(formData, "displayName", 180),
    status,
    cancellationReason: String(formData.get("cancellationReason") ?? "").trim(),
    checkInOpensAt,
    checkInClosesAt,
  }, user.id);
  if (notificationDeliveryIds.length > 0) {
    after(() => Promise.allSettled(notificationDeliveryIds.map(dispatchNotificationDelivery)));
  }
  refreshAdmin();
}

export async function finalizeAttendanceAction(sessionId: string) {
  const user = await requireAdminAccess();
  if (!uuidPattern.test(sessionId)) throw new Error("Invalid Session.");
  await finalizeAttendanceRecord(sessionId, user.id);
  refreshAdmin();
}

/** Staff can add an existing Person through the same fair-capacity booking flow used by members. */
export async function addPersonToSessionAction(sessionId: string, personId: string): Promise<ReserveSessionResult | { kind: "invalid_request" }> {
  const user = await requireAdminAccess();
  if (!uuidPattern.test(sessionId) || !uuidPattern.test(personId)) return { kind: "invalid_request" };

  const result = await reserveSession(personId, sessionId, { changedByUserAccountId: user.id });
  refreshAdmin();
  const notificationDeliveryId = (result.kind === "confirmed" || result.kind === "waitlisted")
    ? result.notificationDeliveryId
    : null;
  if (notificationDeliveryId) {
    after(() => dispatchNotificationDelivery(notificationDeliveryId));
  }
  return result;
}

export async function adjustBookingStatusAction(bookingId: string, formData: FormData) {
  const user = await requireAdminAccess();
  if (!uuidPattern.test(bookingId)) throw new Error("Invalid Booking.");
  const status = formData.get("status");
  if (status !== "confirmed" && status !== "cancelled" && status !== "attended" && status !== "no_show") throw new Error("Invalid Booking status.");
  const reason = requiredText(formData, "reason", 500);
  const result = await setBookingStatusByStaff(bookingId, status, user.id, reason);
  if (typeof result === "object" && result.kind === "cancelled") {
    after(() => Promise.allSettled([
      result.notificationDeliveryId,
      result.promotionNotificationDeliveryId,
    ].filter((id): id is string => Boolean(id)).map(dispatchNotificationDelivery)));
  }
  refreshAdmin();
}

export async function checkInPersonByStaffAction(sessionId: string, personId: string, formData: FormData) {
  const user = await requireAdminAccess();
  if (!uuidPattern.test(sessionId) || !uuidPattern.test(personId)) throw new Error("Invalid Session or Person.");
  await checkInPersonByStaff(sessionId, personId, user.id, requiredText(formData, "reason", 500));
  refreshAdmin();
}

export async function createWalkInAction(sessionId: string, formData: FormData) {
  const user = await requireAdminAccess();
  if (!uuidPattern.test(sessionId)) throw new Error("Invalid Session.");
  await createWalkInRecord(sessionId, {
    name: requiredText(formData, "name", 120),
    mobile: requiredText(formData, "mobile", 30),
    reason: requiredText(formData, "reason", 500),
  }, user.id);
  refreshAdmin();
}

export async function removeWaitlistEntryAction(entryId: string, formData: FormData) {
  const user = await requireAdminAccess();
  if (!uuidPattern.test(entryId)) throw new Error("Invalid Waitlist entry.");
  await removeWaitlistEntryByStaff(entryId, user.id, requiredText(formData, "reason", 500));
  refreshAdmin();
}

export async function promoteWaitlistEntryAction(entryId: string, formData: FormData) {
  const user = await requireAdminAccess();
  if (!uuidPattern.test(entryId)) throw new Error("Invalid Waitlist entry.");
  const deliveryId = await promoteWaitlistEntryByStaff(entryId, user.id, requiredText(formData, "reason", 500));
  if (deliveryId) after(() => dispatchNotificationDelivery(deliveryId));
  refreshAdmin();
}

export async function reopenAttendanceAction(sessionId: string, formData: FormData) {
  const user = await requireAdminAccess();
  if (!uuidPattern.test(sessionId)) throw new Error("Invalid Session.");
  await reopenAttendanceRecord(sessionId, user.id, requiredText(formData, "reason", 500));
  refreshAdmin();
}

export async function retryFailedNotificationsAction(sessionId: string) {
  const user = await requireAdminAccess();
  if (!uuidPattern.test(sessionId)) throw new Error("Invalid Session.");
  const deliveries = await retryFailedSessionNotifications(sessionId, user.id);
  if (deliveries.length > 0) after(() => Promise.allSettled(deliveries.map((delivery) => dispatchNotificationDelivery(delivery.id))));
  refreshAdmin();
}

export async function transferBookingAction(bookingId: string, formData: FormData) {
  const user = await requireAdminAccess();
  const targetSessionId = requiredText(formData, "targetSessionId", 50);
  if (!uuidPattern.test(bookingId) || !uuidPattern.test(targetSessionId)) throw new Error("Invalid Booking or target Session.");
  const deliveryIds = await transferBookingRecord(bookingId, targetSessionId, user.id, requiredText(formData, "reason", 500));
  if (deliveryIds.length > 0) after(() => Promise.allSettled(deliveryIds.map(dispatchNotificationDelivery)));
  refreshAdmin();
}
