import type { TreeSpec } from "./tree-spec";
import type { PathView } from "./tree-views";

/** Where "done" marks are kept in this browser. The 3D tree and the list fallback share it, so progress carries over between them. */
export const STORE_KEY = "path-progress-v1";

/** The key a file is saved under: the names from the root down, joined with "/" (the same as the 3D tree's own path for it). */
export const keyOf = (trail: string[], name: string) => [...trail, name].join("/");

/** Whether an item or folder shows in this view: "By us" keeps only items tagged `by: "us"`, "Reach practice" keeps everything. */
export const inView = (n: TreeSpec, view: PathView): boolean =>
  n.children ? n.children.some((c) => inView(c, view)) : view === "reach" || n.by === "us";

export function loadDone(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(STORE_KEY) ?? "{}").done ?? []);
  } catch {
    return new Set(); // private mode or bad data: start fresh
  }
}

/** Saves the done marks and leaves the rest of what the 3D tree stored there (which folders were opened) alone. */
export function saveDone(done: Set<string>) {
  try {
    const saved = JSON.parse(localStorage.getItem(STORE_KEY) ?? "{}");
    localStorage.setItem(STORE_KEY, JSON.stringify({ ...saved, done: [...done] }));
  } catch {
    /* ignore */
  }
}
