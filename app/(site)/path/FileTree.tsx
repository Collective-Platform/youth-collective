"use client";

import { useEffect, useRef } from "react";
import { mountFileTree } from "./file-tree";
import "./file-tree.css";

export default function FileTree() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!rootRef.current) return;
    return mountFileTree(rootRef.current);
  }, []);

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
