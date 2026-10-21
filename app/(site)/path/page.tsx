import type { Metadata } from "next";
import { preconnect } from "react-dom";
import FileTree from "./FileTree";

const EMBED_HOSTS = [
  "https://www.youtube.com",
  "https://i.ytimg.com",
  "https://www.instagram.com",
  "https://www.tiktok.com",
];

export const metadata: Metadata = {
  title: "Path",
  description: "Explore the path, one folder at a time.",
};

export default function PathPage() {
  // open connections to the embed hosts now, so the first preview doesn't pay for the handshake
  for (const host of EMBED_HOSTS) preconnect(host);
  return (
    <main className="bg-white">
      <FileTree />
    </main>
  );
}
