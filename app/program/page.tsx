import type { Metadata } from "next";
import MemoryWallExperience from "./MemoryWallExperience";

export const metadata: Metadata = {
  title: "Learning Labs: Experience",
  description:
    "A week away from distractions to experience God for yourself, while having fun.",
};

export default function ProgramPage() {
  return <MemoryWallExperience />;
}
