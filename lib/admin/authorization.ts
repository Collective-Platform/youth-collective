import "server-only";

import { getCurrentUser, requireCurrentUser } from "../auth/user";

/** Safe page-level lookup; it exposes no records when the caller is not an administrator. */
export async function getCurrentAdminAccess() {
  const user = await getCurrentUser();
  return user && (user.role === "admin" || user.role === "su") ? user : null;
}

/** Required inside every admin mutation and protected export route. */
export async function requireAdminAccess() {
  const user = await requireCurrentUser();
  if (user.role !== "admin" && user.role !== "su") {
    throw new Error("Administrator permission is required.");
  }
  return user;
}
