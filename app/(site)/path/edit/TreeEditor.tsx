"use client";

import { useRef, useState, useTransition } from "react";
import type { TreeSpec } from "../tree-spec";
import { saveTree } from "./actions";

type N = { id: string; name: string; text: string; url: string; logo?: boolean; newTab?: boolean; by?: TreeSpec['by']; grow?: TreeSpec['grow']; side?: TreeSpec['side']; children?: N[] };
type Pos = "before" | "after" | "inside";

let counter = 0;
const uid = () => `n${++counter}`;
const toN = (s: TreeSpec): N => ({ id: uid(), name: s.name, text: s.text ?? "", url: s.url ?? "", logo: s.logo, newTab: s.newTab, by: s.by, grow: s.grow, side: s.side, children: s.children?.map(toN) });
const toSpec = (n: N): TreeSpec => ({
  name: n.name,
  ...(n.text && { text: n.text }),
  ...(n.url && { url: n.url }),
  ...(n.logo && { logo: true }),
  ...(n.newTab && { newTab: true }),
  ...(n.by && { by: n.by }),
  ...(n.grow && { grow: n.grow }),
  ...(n.side && { side: n.side }),
  ...(n.children && { children: n.children.map(toSpec) }),
});

/** Finds a node and the list it sits in. */
function locate(root: N, id: string, parent: N | null = null): { node: N; parent: N | null; index: number } | null {
  const list = parent ? parent.children! : [root];
  const index = list.findIndex((c) => c.id === id);
  if (index >= 0) return { node: list[index], parent, index };
  for (const c of root.children ?? []) {
    const hit = locate(c, id, root);
    if (hit) return hit;
  }
  return null;
}
const contains = (n: N, id: string): boolean => n.id === id || !!n.children?.some((c) => contains(c, id));

/** Moves a node next to (or into) another. Returns a new tree, or the same one if the move isn't allowed. */
function move(tree: N, id: string, targetId: string, pos: Pos): N {
  if (id === tree.id || id === targetId) return tree;
  const next = structuredClone(tree);
  const from = locate(next, id)!;
  if (contains(from.node, targetId)) return tree; // can't drop a folder inside itself
  from.parent!.children!.splice(from.index, 1);
  const to = locate(next, targetId)!;
  if (pos === "inside") to.node.children!.push(from.node);
  else if (to.parent) to.parent.children!.splice(to.index + (pos === "after" ? 1 : 0), 0, from.node);
  else return tree;
  return next;
}

function edit(tree: N, fn: (root: N) => void): N {
  const next = structuredClone(tree);
  fn(next);
  return next;
}

export default function TreeEditor({ initial }: { initial: TreeSpec }) {
  const [tree, setTree] = useState(() => toN(initial));
  const [closed, setClosed] = useState<Set<string>>(new Set());
  const [dragId, setDragId] = useState<string | null>(null);
  const [over, setOver] = useState<{ id: string; pos: Pos } | null>(null);
  const [dirty, setDirty] = useState(false);
  const [msg, setMsg] = useState("");
  const [pending, startSave] = useTransition();
  const dragRef = useRef<string | null>(null);

  const update = (fn: (root: N) => void) => {
    setTree((t) => edit(t, fn));
    setDirty(true);
    setMsg("");
  };
  const moveTo = (id: string, targetId: string, pos: Pos) => {
    setTree((t) => move(t, id, targetId, pos));
    setDirty(true);
    setMsg("");
  };

  const nudge = (id: string, dir: -1 | 1) =>
    update((root) => {
      const { parent, index } = locate(root, id)!;
      const list = parent!.children!;
      const j = index + dir;
      if (j < 0 || j >= list.length) return;
      [list[index], list[j]] = [list[j], list[index]];
    });
  // "indent" = move into the folder just above; "outdent" = move out to the parent's level
  const indent = (id: string) =>
    update((root) => {
      const { node, parent, index } = locate(root, id)!;
      const above = parent!.children![index - 1];
      if (!above?.children) return;
      parent!.children!.splice(index, 1);
      above.children.push(node);
    });
  const outdent = (id: string) =>
    update((root) => {
      const { node, parent, index } = locate(root, id)!;
      if (!parent || parent.id === root.id) return;
      const up = locate(root, parent.id)!;
      parent.children!.splice(index, 1);
      up.parent!.children!.splice(up.index + 1, 0, node);
    });
  const add = (folderId: string, folder: boolean) =>
    update((root) => {
      const f = locate(root, folderId)!.node;
      f.children!.push({ id: uid(), name: folder ? "New folder" : "New file", text: "", url: "", children: folder ? [] : undefined });
    });
  // a copy goes right after the original; folders are copied with everything inside
  const duplicate = (id: string) =>
    update((root) => {
      const { node, parent, index } = locate(root, id)!;
      const fresh = (n: N): N => ({ ...n, id: uid(), children: n.children?.map(fresh) });
      parent!.children!.splice(index + 1, 0, { ...fresh(node), name: `${node.name} (copy)` });
    });
  const remove = (id: string) => {
    const n = locate(tree, id)!.node;
    const count = n.children ? ` and the ${n.children.length} item(s) inside it` : "";
    if (!confirm(`Delete "${n.name}"${count}?`)) return;
    update((root) => {
      const { parent, index } = locate(root, id)!;
      parent!.children!.splice(index, 1);
    });
  };
  const patch = (id: string, key: "name" | "text" | "url", value: string) =>
    update((root) => {
      locate(root, id)!.node[key] = value;
    });
  // empty string = automatic
  const setDir = (id: string, key: "grow" | "side", value: string) =>
    update((root) => {
      (locate(root, id)!.node as Record<string, unknown>)[key] = value || undefined;
    });

  const setBy = (id: string, on: boolean) =>
    update((root) => {
      locate(root, id)!.node.by = on ? "us" : undefined;
    });

  const save = () =>
    startSave(async () => {
      const res = await saveTree(toSpec(tree));
      if (res.ok) {
        setDirty(false);
        setMsg("Saved to tree-data.json ✓");
      } else setMsg(res.error ?? "Could not save.");
    });

  const row = (n: N, depth: number, parentId: string | null, siblings: number, index: number): React.ReactNode => {
    const isFolder = !!n.children;
    const isRoot = parentId === null;
    const isClosed = closed.has(n.id);
    const mark = over?.id === n.id ? over.pos : null;
    return (
      <li key={n.id}>
        <div
          className={`flex flex-wrap items-center gap-1.5 rounded-lg border bg-white p-1.5 ${mark === "inside" ? "border-lime-500 bg-lime-50" : "border-neutral-200"} ${dragId === n.id ? "opacity-40" : ""}`}
          style={{
            boxShadow: mark === "before" ? "0 -3px 0 0 #65a30d" : mark === "after" ? "0 3px 0 0 #65a30d" : undefined,
          }}
          onDragOver={(e) => {
            if (!dragRef.current || dragRef.current === n.id) return;
            e.preventDefault();
            const r = e.currentTarget.getBoundingClientRect();
            const y = (e.clientY - r.top) / r.height;
            const pos: Pos = isRoot ? "inside" : isFolder && y > 0.25 && y < 0.75 ? "inside" : y < 0.5 ? "before" : "after";
            setOver((o) => (o?.id === n.id && o.pos === pos ? o : { id: n.id, pos }));
          }}
          onDrop={(e) => {
            e.preventDefault();
            if (dragRef.current && over) moveTo(dragRef.current, over.id, over.pos);
            dragRef.current = null;
            setDragId(null);
            setOver(null);
          }}
        >
          {!isRoot && (
            <span
              draggable
              onDragStart={(e) => {
                dragRef.current = n.id;
                setDragId(n.id);
                e.dataTransfer.effectAllowed = "move";
              }}
              onDragEnd={() => {
                dragRef.current = null;
                setDragId(null);
                setOver(null);
              }}
              className="cursor-grab select-none px-1 text-lg leading-none text-neutral-400 active:cursor-grabbing"
              title="Drag to move"
            >
              ⠿
            </span>
          )}
          {isFolder ? (
            <button
              type="button"
              className="w-5 text-neutral-500"
              onClick={() => setClosed((c) => { const x = new Set(c); if (x.has(n.id)) x.delete(n.id); else x.add(n.id); return x; })}
              aria-label={isClosed ? "Expand" : "Collapse"}
            >
              {isClosed ? "▸" : "▾"}
            </button>
          ) : (
            <span className="w-5" />
          )}
          <span>{isFolder ? "📁" : "📄"}</span>
          <input
            value={n.name}
            onChange={(e) => patch(n.id, "name", e.target.value)}
            className={`min-w-0 flex-1 basis-40 rounded border border-transparent px-1.5 py-1 hover:border-neutral-300 ${isFolder ? "font-semibold" : ""}`}
            aria-label="Name"
          />
          {!isFolder && (
            <input
              value={n.url}
              onChange={(e) => patch(n.id, "url", e.target.value)}
              placeholder="link (optional)"
              className="min-w-0 flex-1 basis-48 rounded border border-neutral-200 px-1.5 py-1 text-sm text-neutral-600"
              aria-label="Link"
            />
          )}
          {!isRoot && (
            <span className="flex gap-0.5 text-sm">
              <Btn onClick={() => nudge(n.id, -1)} disabled={index === 0} label="Move up">↑</Btn>
              <Btn onClick={() => nudge(n.id, 1)} disabled={index === siblings - 1} label="Move down">↓</Btn>
              <Btn onClick={() => outdent(n.id)} disabled={parentId === tree.id} label="Move out of this folder">←</Btn>
              <Btn onClick={() => indent(n.id)} disabled={!locate(tree, parentId!)!.node.children![index - 1]?.children} label="Move into the folder above">→</Btn>
              <Btn onClick={() => duplicate(n.id)} label="Duplicate">⧉</Btn>
              <Btn onClick={() => remove(n.id)} label="Delete">✕</Btn>
            </span>
          )}
          {!isRoot && (
            <label className="flex items-center gap-1 text-xs text-neutral-500">
              Side
              <select value={n.side ?? ""} onChange={(e) => setDir(n.id, "side", e.target.value)} className="rounded border border-neutral-200 bg-white px-1 py-1 text-neutral-800">
                <option value="">Auto</option>
                <option value="up">Up ↑</option>
                <option value="down">Down ↓</option>
              </select>
            </label>
          )}
          {!isFolder && (
            <label className="flex items-center gap-1 text-xs text-neutral-500">
              <input type="checkbox" checked={n.by === "us"} onChange={(e) => setBy(n.id, e.target.checked)} />
              By us
            </label>
          )}
          {isFolder && !isRoot && (
            <label className="flex items-center gap-1 text-xs text-neutral-500">
              Grows
              <select value={n.grow ?? ""} onChange={(e) => setDir(n.id, "grow", e.target.value)} className="rounded border border-neutral-200 bg-white px-1 py-1 text-neutral-800">
                <option value="">Auto (right)</option>
                <option value="left">Left ←</option>
                <option value="down">Down ↓</option>
                <option value="down-left">Down-left ↙</option>
              </select>
            </label>
          )}
          {isFolder && (
            <span className="flex gap-1 text-xs">
              <Btn onClick={() => add(n.id, false)} label="Add file">+ file</Btn>
              <Btn onClick={() => add(n.id, true)} label="Add folder">+ folder</Btn>
            </span>
          )}
          {!isFolder && (
            <input
              value={n.text}
              onChange={(e) => patch(n.id, "text", e.target.value)}
              placeholder="text shown when tapped"
              className="ml-[3.25rem] min-w-0 basis-full rounded border border-neutral-200 px-1.5 py-1 text-sm text-neutral-600"
              aria-label="Text"
            />
          )}
        </div>
        {isFolder && !isClosed && (
          <ul className="ml-4 mt-1.5 space-y-1.5 border-l-2 border-neutral-200 pl-3 sm:ml-6">
            {n.children!.map((c, i) => row(c, depth + 1, n.id, n.children!.length, i))}
            {n.children!.length === 0 && <li className="px-2 py-1 text-sm text-neutral-400">Empty. Drop something here or use + file.</li>}
          </ul>
        )}
      </li>
    );
  };

  return (
    <main className="mx-auto max-w-4xl p-3 pb-28 sm:p-6">
      <h1 className="text-xl font-bold">Rearrange the path</h1>
      <p className="mb-4 mt-1 text-sm text-neutral-600">
        Drag a ⠿ handle onto the top or bottom of a row to place it before or after, or onto the middle of a folder to put it inside. The arrow buttons do the same
        without dragging. <b>Side</b> picks whether an item hangs above or below its branch, and <b>Grows</b> picks which way a folder&apos;s own branch heads. Nothing changes on the real page until you press Save.
      </p>
      <ul className="space-y-1.5">{row(tree, 0, null, 1, 0)}</ul>
      <div className="fixed inset-x-0 bottom-0 flex items-center gap-3 border-t bg-white/95 p-3 backdrop-blur">
        <button
          type="button"
          onClick={save}
          disabled={!dirty || pending}
          className="rounded-lg bg-black px-4 py-2 text-white disabled:opacity-40"
        >
          {pending ? "Saving…" : "Save"}
        </button>
        <a href="/path" target="_blank" className="text-sm underline">Preview /path ↗</a>
        <span className="text-sm text-neutral-600">{msg || (dirty ? "Unsaved changes" : "")}</span>
      </div>
    </main>
  );
}

function Btn({ onClick, disabled, label, children }: { onClick: () => void; disabled?: boolean; label: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className="rounded border border-neutral-200 px-2 py-1 hover:bg-neutral-100 disabled:opacity-30"
    >
      {children}
    </button>
  );
}
