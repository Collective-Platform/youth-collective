/** One entry in tree-data.json. A folder has `children`; a file doesn't. */
export type TreeSpec = {
  name: string;
  text?: string;
  url?: string;
  /** Skip the preview: tapping it opens the link straight in a new tab. */
  newTab?: boolean;
  /** Files only: made by the church (collective.my, Learning Labs, Instagram…). These show under "By us" (same stages). "Reach practice" shows everything, these included. */
  by?: 'us';
  /** Show the site favicon as this file's icon. */
  logo?: boolean;
  /** Folders only: which way its branch grows. Default is right (and up or down alternately). 'down-left' heads down and to the left. */
  grow?: 'left' | 'down' | 'down-left';
  /** Which side of its parent's branch this item hangs off. Leave out to alternate automatically. */
  side?: 'up' | 'down';
  children?: TreeSpec[];
};
