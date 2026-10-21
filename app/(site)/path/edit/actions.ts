"use server";

import { writeFile } from "node:fs/promises";
import path from "node:path";
import type { TreeSpec } from "../tree-spec";

/** Saves the rearranged tree into tree-data.json. Only works on your own computer (npm run dev). */
export async function saveTree(tree: TreeSpec): Promise<{ ok: boolean; error?: string }> {
  if (process.env.NODE_ENV !== "development") return { ok: false, error: "Saving only works in dev mode." };
  const file = path.join(process.cwd(), "app", "(site)", "path", "tree-data.json");
  await writeFile(file, JSON.stringify(tree, null, 2) + "\n");
  return { ok: true };
}
