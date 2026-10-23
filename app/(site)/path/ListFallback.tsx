"use client";

import { useState } from "react";
import treeData from "./tree-data.json";
import { inView, keyOf, loadDone, saveDone } from "./path-progress";
import type { TreeSpec } from "./tree-spec";
import { VIEW_LABEL, type PathView } from "./tree-views";

const ROOT = treeData as TreeSpec;
const VIEWS: PathView[] = ["us", "reach"];

type Ctx = { view: PathView; done: Set<string>; toggle: (key: string) => void };

/** Files under a folder that show in this view, as [done, total]. */
function tally(n: TreeSpec, trail: string[], ctx: Pick<Ctx, "view" | "done">): [number, number] {
  const { view, done } = ctx;
  if (!n.children) return inView(n, view) ? [done.has(keyOf(trail, n.name)) ? 1 : 0, 1] : [0, 0];
  return n.children.reduce<[number, number]>(
    (s, c) => {
      const [d, t] = tally(c, [...trail, n.name], ctx);
      return [s[0] + d, s[1] + t];
    },
    [0, 0],
  );
}

function Item({ n, trail, ctx }: { n: TreeSpec; trail: string[]; ctx: Ctx }) {
  const key = keyOf(trail, n.name);
  const isDone = ctx.done.has(key);
  return (
    <div className="flex items-center">
      <button
        role="checkbox"
        aria-checked={isDone}
        aria-label={`Mark "${n.name}" as done`}
        onClick={() => ctx.toggle(key)}
        className="flex size-11 shrink-0 items-center justify-center"
      >
        <span
          className={
            "flex size-5 items-center justify-center rounded-full border text-[11px] leading-none transition-colors duration-150 ease-out " +
            (isDone ? "border-[#93c83a] bg-[#93c83a] text-white" : "border-neutral-300 bg-white text-transparent")
          }
        >
          ✓
        </span>
      </button>
      {n.url ? (
        <a
          href={n.url}
          target="_blank"
          rel="noopener noreferrer"
          className={"flex min-h-11 flex-1 items-center justify-between gap-3 py-2 pr-1 text-[15px] hover:underline " + (isDone ? "text-neutral-400" : "")}
        >
          <span>{n.name}</span>
          <span aria-hidden="true" className="text-neutral-400">↗</span>
        </a>
      ) : (
        <p className={"flex-1 py-2 text-[15px] " + (isDone ? "text-neutral-400" : "text-neutral-500")}>{n.text ?? n.name}</p>
      )}
    </div>
  );
}

function Folder({ n, trail, depth, ctx, open }: { n: TreeSpec; trail: string[]; depth: number; ctx: Ctx; open?: boolean }) {
  const [done, total] = tally(n, trail, ctx);
  const here = [...trail, n.name];
  return (
    <details className="group" open={open}>
      <summary className="flex min-h-12 cursor-pointer list-none items-center gap-3 rounded-xl px-2 py-2 hover:bg-neutral-50 [&::-webkit-details-marker]:hidden">
        <span aria-hidden="true" className="text-neutral-400 transition-transform duration-150 ease-out group-open:rotate-90">›</span>
        <span className={depth === 0 ? "font-heading text-xl" : "font-medium"}>{n.name}</span>
        <span className="ml-auto text-xs tabular-nums text-neutral-400">{done}/{total}</span>
      </summary>
      <div className="ml-4 border-l border-neutral-200 pl-1">
        {n.children!.filter((c) => inView(c, ctx.view)).map((c) =>
          c.children ? <Folder key={c.name} n={c} trail={here} depth={depth + 1} ctx={ctx} /> : <Item key={c.name} n={c} trail={here} ctx={ctx} />,
        )}
      </div>
    </details>
  );
}

/** A plain list of the path, for browsers where the 3D tree can't run. Shares its done marks with the tree. */
export default function ListFallback() {
  const [view, setView] = useState<PathView>("us");
  // only ever rendered in the browser (after the 3D tree failed to start), so reading storage here is safe
  const [done, setDone] = useState(loadDone);
  const toggle = (key: string) => {
    const next = new Set(done);
    if (!next.delete(key)) next.add(key);
    setDone(next);
    saveDone(next);
  };
  const ctx: Ctx = { view, done, toggle };
  const [d, t] = tally(ROOT, [], ctx);
  const percent = t ? Math.round((d / t) * 100) : 0;
  const stages = ROOT.children!.filter((s) => inView(s, view));
  return (
    <section className="mx-auto max-w-xl px-4 py-8">
      <h1 className="font-heading text-3xl">Path</h1>
      <p className="mt-1 text-sm text-neutral-500">We couldn&apos;t load the 3D view here, so here&apos;s the list. Tap a folder to open it.</p>
      <div className="mt-5 flex items-center justify-between gap-3">
        <div role="group" aria-label="Show" className="flex rounded-full border border-neutral-200 p-0.5">
          {VIEWS.map((v) => (
            <button
              key={v}
              aria-pressed={view === v}
              onClick={() => setView(v)}
              className={"rounded-full px-4 py-2 text-sm transition-colors duration-150 ease-out " + (view === v ? "bg-black text-white" : "text-neutral-600")}
            >
              {VIEW_LABEL[v]}
            </button>
          ))}
        </div>
        <p aria-live="polite" className="text-sm tabular-nums text-neutral-500">
          {percent}% complete
        </p>
      </div>
      <div className="mt-4">
        {stages.map((s, i) => (
          <Folder key={s.name} n={s} trail={[ROOT.name]} depth={0} ctx={ctx} open={i === 0} />
        ))}
      </div>
    </section>
  );
}
