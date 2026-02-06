import type { Metadata } from "next";
import InternshipContent from "./InternshipContent";

export const metadata: Metadata = {
  title: "Internship",
  description:
    "Get ready for the best school break week. Discover God, learn essential life skills, and connect meaningfully with the world beyond you.",
};

export default function ProgramPage() {
  return <InternshipContent />;
}
