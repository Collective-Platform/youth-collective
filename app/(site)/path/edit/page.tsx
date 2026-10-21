import { notFound } from "next/navigation";
import type { Metadata } from "next";
import treeData from "../tree-data.json";
import type { TreeSpec } from "../tree-spec";
import TreeEditor from "./TreeEditor";

export const metadata: Metadata = { title: "Edit path", robots: { index: false } };

// A tool for rearranging the tree while developing. It does not exist on the live site.
export default function EditPathPage() {
  if (process.env.NODE_ENV !== "development") notFound();
  return <TreeEditor initial={treeData as TreeSpec} />;
}
