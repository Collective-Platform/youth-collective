import type { Metadata } from "next";

import { getCurrentUser } from "@/lib/auth/user";
import { findPersonProfileForUserAccount } from "@/lib/db/repositories/people";

import LearningLabsExperience from "./LearningLabsExperience";

export const metadata: Metadata = {
  title: "Learning Labs: Experience",
  description:
    "A week away from distractions to experience God for yourself (while having fun).",
  openGraph: {
    title: "Learning Labs: Experience",
    description:
      "A week away from distractions to experience God for yourself (while having fun).",
  },
};

export const dynamic = "force-dynamic";

export default async function ProgramPage() {
  const user = await getCurrentUser();
  const profile = user ? await findPersonProfileForUserAccount(user.id) : null;

  return (
    <LearningLabsExperience
      registrationPrefill={
        user
          ? {
              email: user.email,
              fullName: profile?.name ?? "",
              dateOfBirth: profile?.birthDate ?? "",
              whatsAppNumber: profile?.mobile ?? "",
            }
          : undefined
      }
    />
  );
}
