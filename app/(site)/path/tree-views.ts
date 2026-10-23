export type PathView = "us" | "reach";

/** What the breadcrumb calls the root folder. The tree itself is the same in both views: "By us" just hides everything that isn't tagged `by: "us"` in tree-data.json. */
export const VIEW_LABEL: Record<PathView, string> = { us: "By us", reach: "Reach practice" };
