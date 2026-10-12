import type { Metadata } from "next";
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

export default function ProgramPage() {
  return <LearningLabsExperience />;
}
