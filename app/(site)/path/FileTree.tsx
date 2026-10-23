"use client";

import { useEffect, useRef, useState } from "react";
import ListFallback from "./ListFallback";
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
  const [percent, setPercent] = useState(0);
  const [unsupported, setUnsupported] = useState(false);

  // the scene is built once; the toggle only changes what it shows
  useEffect(() => {
    if (!rootRef.current) return;
    try {
      const tree = mountFileTree(rootRef.current, treeData as TreeSpec, FIRST_VIEW, VIEW_LABEL[FIRST_VIEW], setPercent);
      treeRef.current = tree;
      return tree.destroy;
    } catch (err) {
      // most often WebGL is switched off or missing in this browser: show the plain list instead of crashing the page
      console.error("Could not start the path view", err);
      setUnsupported(true); // eslint-disable-line react-hooks/set-state-in-effect -- WebGL can only be tested in the browser, after mount
    }
  }, []);
  useEffect(() => {
    treeRef.current?.setView(view, VIEW_LABEL[view]);
  }, [view]);

  if (unsupported) return <ListFallback />;

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
        <div className="progress" aria-live="polite">
          {percent}%<span> complete</span>
        </div>
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
