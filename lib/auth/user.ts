import "server-only";

import { cache } from "react";

import { getSessionUser } from "./session";

export type AuthenticatedUser = {
  id: string;
  email: string;
  role: "user" | "admin" | "su";
};

/** Returns the signed-in identity from the first-party server-side session. */
export const getCurrentUser = cache(async (): Promise<AuthenticatedUser | null> => getSessionUser());

export async function requireCurrentUser() {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Authentication is required.");
  }

  return user;
}
