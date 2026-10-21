import type { Metadata } from "next";
import FileTree from "./FileTree";

export const metadata: Metadata = {
  title: "Path",
  description: "Explore the path, one folder at a time.",
};

export default function PathPage() {
  return (
    <main className="bg-white">
      <FileTree />
    </main>
  );
}
