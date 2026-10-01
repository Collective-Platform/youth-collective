import "server-only";

import { and, eq } from "drizzle-orm";

import { getDatabase } from "../client";
import { people, userAccounts } from "../schema";

export type PersonProfile = {
  id: string;
  name: string;
  email: string;
  mobile: string;
  birthDate: string | null;
  ageBand: string | null;
};

/** The profile seam: callers operate on their account while this module owns account-to-person lookup. */
export async function findPersonProfileForUserAccount(userAccountId: string): Promise<PersonProfile | null> {
  if (!process.env.DATABASE_URL) return null;
  const [person] = await getDatabase()
    .select({
      id: people.id,
      name: people.name,
      email: userAccounts.email,
      mobile: people.mobile,
      birthDate: people.birthDate,
      ageBand: people.ageBand,
    })
    .from(userAccounts)
    .innerJoin(people, eq(userAccounts.personId, people.id))
    .where(eq(userAccounts.id, userAccountId))
    .limit(1);
  if (!person?.name || !person.mobile) return null;
  return person as PersonProfile;
}

export async function saveMyPersonProfile(input: {
  userAccountId: string;
  name: string;
  mobile: string;
  birthDate?: string;
  ageBand?: string;
  recordBookingConsent: boolean;
}) {
  const now = new Date();
  const [profile] = await getDatabase()
    .update(people)
    .set({
      name: input.name,
      mobile: input.mobile,
      ...(input.recordBookingConsent ? { bookingConsentAt: now } : {}),
      birthDate: input.birthDate || null,
      ageBand: input.ageBand || null,
      updatedAt: now,
    })
    .from(userAccounts)
    .where(and(eq(userAccounts.id, input.userAccountId), eq(people.id, userAccounts.personId)))
    .returning({ id: people.id });
  if (!profile) throw new Error("Authenticated user account no longer exists.");
  return profile;
}
