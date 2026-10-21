/** One entry in tree-data.json. A folder has `children`; a file doesn't. */
export type TreeSpec = {
  name: string;
  text?: string;
  url?: string;
  /** Show the site favicon as this file's icon. */
  logo?: boolean;
  /** Folders only: which way its branch grows. Default is right (and up or down alternately). */
  grow?: 'left' | 'down';
  children?: TreeSpec[];
};
