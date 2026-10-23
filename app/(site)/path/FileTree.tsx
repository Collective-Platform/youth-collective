"use client";

import { useEffect, useRef, useState } from "react";
import { mountFileTree, type FileTreeHandle } from "./file-tree";
import treeData from "./tree-data.json";
import type { TreeSpec } from "./tree-spec";
import { VIEW_LABEL, type PathView } from "./tree-views";
import "./file-tree.css";

const FIRST_VIEW: PathView = "us";
const VIEWS: { id: PathView; label: string }[] = [
  { id: "us", label: VIEW_LABEL.us },
  { id: "reach", label: VIEW_LABEL.reach },
];

export default function FileTree() {
  const rootRef = useRef<HTMLDivElement>(null);
  const treeRef = useRef<FileTreeHandle>(null);
  const [view, setView] = useState<PathView>(FIRST_VIEW);

  // the scene is built once; the toggle only changes what it shows
  useEffect(() => {
    if (!rootRef.current) return;
    const tree = mountFileTree(rootRef.current, treeData as TreeSpec, FIRST_VIEW, VIEW_LABEL[FIRST_VIEW]);
    treeRef.current = tree;
    return tree.destroy;
  }, []);
  useEffect(() => {
    treeRef.current?.setView(view, VIEW_LABEL[view]);
  }, [view]);

  return (
    <div ref={rootRef} className="ft">
      <nav className="crumbs">
        <button className="back" id="ft-back" aria-label="Back" disabled>
          ‹
        </button>
        <span id="ft-title">
          <b>Path</b>
        </span>
      </nav>
      <div className="views" role="group" aria-label="Show">
        {VIEWS.map((v) => (
          <button key={v.id} aria-pressed={view === v.id} onClick={() => setView(v.id)}>
            {v.label}
          </button>
        ))}
      </div>
      <div className="viewport">
        <div className="labels" />
        <div className="hint" id="ft-hint">
          Tap a folder to grow it · drag to look around
        </div>
        <div className="ql" id="ft-ql">
          <div className="ql-card">
            <div className="ql-head">
              <span id="ft-ql-icon" />
              <span id="ft-ql-name" />
              <button id="ft-ql-close">Close</button>
            </div>
            <div className="ql-body" id="ft-ql-body" />
          </div>
        </div>
      </div>
    </div>
  );
}
