// Literal file tree — every folder is a node on a vine. Open a folder and a dotted branch
// grows out of it, with its files hanging off twigs. Placeholder content: edit TREE below.
// Ported from the standalone prototype (file-tree/main.js).
import * as THREE from 'three';
import treeData from './tree-data.json';
import type { TreeSpec } from './tree-spec';


// ---------------------------------------------------------------- content

export type TreeNode = {
  name: string;
  type: 'folder' | 'file';
  text?: string;
  url?: string;
  logo?: boolean; // show the site favicon as the icon
  flip: boolean; // grows to the left
  down: boolean; // always grows downwards
  children: TreeNode[];
  parent: TreeNode | null;
  depth: number;
  angle: number;
  anchor: THREE.Vector2;
  birth: number;
  left: boolean;
  open: boolean;
  el: HTMLElement;
  branch: Branch | null;
};
type Branch = {
  folder: TreeNode;
  points: THREE.Points;
  mat: THREE.ShaderMaterial;
  p: number;
  target: number;
  end: THREE.Vector2;
  pts: THREE.Vector2[];
  rects: { x0: number; x1: number; y0: number; y1: number; node: TreeNode }[];
};

// A folder has a "children" list in tree-data.json; a file does not.
const build = (s: TreeSpec): TreeNode =>
  ({ name: s.name, type: s.children ? "folder" : "file", text: s.text, url: s.url, logo: s.logo, flip: s.grow === "left", down: s.grow === "down", children: (s.children ?? []).map(build) }) as unknown as TreeNode;

// The content lives in tree-data.json. Rearrange it at /path/edit (dev only) or edit the JSON by hand.
const TREE = build(treeData as TreeSpec);


// ---------------------------------------------------------------- look

const hex = (h: string) => [parseInt(h.slice(1, 3), 16) / 255, parseInt(h.slice(3, 5), 16) / 255, parseInt(h.slice(5, 7), 16) / 255];
const BARK = ['#3a3228', '#4a3f2f', '#5a4a36'].map(hex);
const MOSS = ['#889858', '#6f8a3c', '#7da33f'].map(hex);
const LIME = ['#a8d848', '#b8e650', '#cdea5c', '#93c83a'].map(hex);
const GRID = 2.4; // dots snap to this grid, which gives the halftone / ASCII look
const REDUCED = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
const FLOW = 0; // the vine always grows sideways, like the reference
const SMALL = typeof innerWidth !== 'undefined' && innerWidth < 640; // phones: shorter branches so more fits on screen
const GROW_S = REDUCED ? 0.15 : 1.7;
const SHRINK_S = REDUCED ? 0.1 : 0.55;

// Pixel icons: each is a 12 x 12 grid, "#" is a filled square.
const PIXELS = {
  folder: ['............', '####........', '#..#########', '#..........#', '#..........#', '#..........#', '#..........#', '#..........#', '#..........#', '############', '............', '............'],
  folderOpen: ['............', '####........', '#..#######..', '#.........#.', '..##########', '..##########', '.###########', '.###########', '############', '############', '............', '............'],
  file: ['............', '#######.....', '#.....##....', '#.....#.#...', '#.....####..', '#........#..', '#.####...#..', '#........#..', '#.####...#..', '#........#..', '##########..', '............'],
  web: ['............', '...######...', '.##..##..##.', '.#...##...#.', '#....##....#', '############', '#....##....#', '.#...##...#.', '.##..##..##.', '...######...', '............', '............'],
};
const pixelSvg = (rows: string[], cls = '') => {
  const rects = rows.flatMap((row, y) => [...row].map((c, x) => (c === '#' ? `<rect x="${x}" y="${y}" width="1" height="1"/>` : ''))).join('');
  return `<svg${cls ? ` class="${cls}"` : ''} viewBox="0 0 12 12" fill="currentColor" shape-rendering="crispEdges">${rects}</svg>`;
};

// Resources that are a link get the real logo of the place they open (paths from simple-icons, CC0).
const YT = 'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z';
const IG = 'M7.0301.084c-1.2768.0602-2.1487.264-2.911.5634-.7888.3075-1.4575.72-2.1228 1.3877-.6652.6677-1.075 1.3368-1.3802 2.127-.2954.7638-.4956 1.6365-.552 2.914-.0564 1.2775-.0689 1.6882-.0626 4.947.0062 3.2586.0206 3.6671.0825 4.9473.061 1.2765.264 2.1482.5635 2.9107.308.7889.72 1.4573 1.388 2.1228.6679.6655 1.3365 1.0743 2.1285 1.38.7632.295 1.6361.4961 2.9134.552 1.2773.056 1.6884.069 4.9462.0627 3.2578-.0062 3.668-.0207 4.9478-.0814 1.28-.0607 2.147-.2652 2.9098-.5633.7889-.3086 1.4578-.72 2.1228-1.3881.665-.6682 1.0745-1.3378 1.3795-2.1284.2957-.7632.4966-1.636.552-2.9124.056-1.2809.0692-1.6898.063-4.948-.0063-3.2583-.021-3.6668-.0817-4.9465-.0607-1.2797-.264-2.1487-.5633-2.9117-.3084-.7889-.72-1.4568-1.3876-2.1228C21.2982 1.33 20.628.9208 19.8378.6165 19.074.321 18.2017.1197 16.9244.0645 15.6471.0093 15.236-.005 11.977.0014 8.718.0076 8.31.0215 7.0301.0839m.1402 21.6932c-1.17-.0509-1.8053-.2453-2.2287-.408-.5606-.216-.96-.4771-1.3819-.895-.422-.4178-.6811-.8186-.9-1.378-.1644-.4234-.3624-1.058-.4171-2.228-.0595-1.2645-.072-1.6442-.079-4.848-.007-3.2037.0053-3.583.0607-4.848.05-1.169.2456-1.805.408-2.2282.216-.5613.4762-.96.895-1.3816.4188-.4217.8184-.6814 1.3783-.9003.423-.1651 1.0575-.3614 2.227-.4171 1.2655-.06 1.6447-.072 4.848-.079 3.2033-.007 3.5835.005 4.8495.0608 1.169.0508 1.8053.2445 2.228.408.5608.216.96.4754 1.3816.895.4217.4194.6816.8176.9005 1.3787.1653.4217.3617 1.056.4169 2.2263.0602 1.2655.0739 1.645.0796 4.848.0058 3.203-.0055 3.5834-.061 4.848-.051 1.17-.245 1.8055-.408 2.2294-.216.5604-.4763.96-.8954 1.3814-.419.4215-.8181.6811-1.3783.9-.4224.1649-1.0577.3617-2.2262.4174-1.2656.0595-1.6448.072-4.8493.079-3.2045.007-3.5825-.006-4.848-.0608M16.953 5.5864A1.44 1.44 0 1 0 18.39 4.144a1.44 1.44 0 0 0-1.437 1.4424M5.8385 12.012c.0067 3.4032 2.7706 6.1557 6.173 6.1493 3.4026-.0065 6.157-2.7701 6.1506-6.1733-.0065-3.4032-2.771-6.1565-6.174-6.1498-3.403.0067-6.156 2.771-6.1496 6.1738M8 12.0077a4 4 0 1 1 4.008 3.9921A3.9996 3.9996 0 0 1 8 12.0077';
const TT = 'M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z';
const logo = (inner: string) => `<svg class="logo" viewBox="0 0 24 24">${inner}</svg>`;
const LINK_ICONS = {
  youtube: logo(`<path fill="#FF0000" d="${YT}"/>`),
  instagram: logo(
    `<defs><linearGradient id="ft-ig" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#FEDA75"/><stop offset=".3" stop-color="#FA7E1E"/><stop offset=".55" stop-color="#D62976"/><stop offset=".8" stop-color="#962FBF"/><stop offset="1" stop-color="#4F5BD5"/></linearGradient></defs><path fill="url(#ft-ig)" d="${IG}"/>`,
  ),
  tiktok: logo(
    `<path fill="#25F4EE" transform="translate(-.7 -.7)" d="${TT}"/><path fill="#FE2C55" transform="translate(.7 .7)" d="${TT}"/><path fill="#000" d="${TT}"/>`,
  ),
  youversion: `<img class="logo" src="/assets/path/youversion.png" alt="" />`,
  lectio: `<img class="logo" src="/assets/path/lectio365.png" alt="" />`,
  web: pixelSvg(PIXELS.web, 'logo'),
  collective: `<img class="logo" src="/assets/path/collective.png" alt="" />`,
  site: `<img class="logo" src="/assets/path/favicon.png" alt="" />`,
};

/** The address to put in an iframe for a link, and how tall to make it. */
function embedOf(url: string): { src: string; ratio: string } {
  const u = new URL(url, location.origin);
  const host = u.hostname.replace(/^www\./, '');
  if (host === 'youtube.com' || host === 'youtu.be') {
    const list = u.searchParams.get('list');
    const id = host === 'youtu.be' ? u.pathname.slice(1) : u.searchParams.get('v');
    if (u.pathname === '/playlist' && list) return { src: `https://www.youtube.com/embed/videoseries?list=${encodeURIComponent(list)}`, ratio: '16 / 9' };
    return { src: `https://www.youtube.com/embed/${encodeURIComponent(id ?? '')}`, ratio: '16 / 9' };
  }
  if (host === 'instagram.com') return { src: `https://www.instagram.com${u.pathname.replace(/\/?$/, '/')}embed`, ratio: '9 / 14' };
  if (host === 'tiktok.com') return { src: `https://www.tiktok.com/embed/v2/${u.pathname.split('/').pop()}`, ratio: '9 / 15' };
  if (u.origin !== location.origin) u.protocol = 'https:'; // an http page can't be shown inside our https page
  return { src: u.href, ratio: '3 / 4' };
}

function linkIcon(url: string) {
  const host = new URL(url, location.origin).hostname;
  if (/(^|\.)(youtube\.com|youtu\.be)$/.test(host)) return LINK_ICONS.youtube;
  if (/(^|\.)(instagram\.com|ig\.me)$/.test(host)) return LINK_ICONS.instagram;
  if (/(^|\.)tiktok\.com$/.test(host)) return LINK_ICONS.tiktok;
  if (/(^|\.)(bible\.com|youversion\.com)$/.test(host)) return LINK_ICONS.youversion;
  if (/(^|\.)lectio365\.com$/.test(host)) return LINK_ICONS.lectio;
  if (/(^|\.)collective\.my$/.test(host)) return LINK_ICONS.collective;
  return LINK_ICONS.web;
}

const ICONS = {
  folder: pixelSvg(PIXELS.folder, 'closed-icon') + pixelSvg(PIXELS.folderOpen, 'open-icon'),
  file: pixelSvg(PIXELS.file),
};

type Rng = () => number;
// flat list of 5 values per dot: x, y, birth, colour ([r, g, b]), size
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Dots = any[];

// ---------------------------------------------------------------- helpers

const V = (x: number, y: number) => new THREE.Vector2(x, y);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const ease = (t: number) => 0.5 - Math.cos(Math.PI * clamp(t, 0, 1)) / 2;
function seeded(str: string): Rng {
  let h = 2166136261;
  for (const c of str) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return () => {
    h = (h + 0x6d2b79f5) | 0;
    let t = Math.imul(h ^ (h >>> 15), 1 | h);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const esc = (t: string) => t.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
const pick = <T,>(rng: Rng, arr: T[]): T => arr[Math.floor(rng() * arr.length)];
const pathOf = (n: TreeNode): string => (n.parent ? pathOf(n.parent) + '/' + n.name : n.name);

/** Starts the scene inside `root` (which holds the markup from FileTree.tsx). Returns a cleanup function. */
export function mountFileTree(root: HTMLElement): () => void {
  // ---------------------------------------------------------------- scene

  const ac = new AbortController();
  const { signal } = ac;
  const viewport = root.querySelector<HTMLElement>('.viewport')!;
  const labels = root.querySelector<HTMLElement>('.labels')!;
  const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setClearColor(0xfbfbfb, 1);
  viewport.prepend(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -10, 10);
  camera.position.z = 5;
  const cam = { x: 0, y: 0, zoom: 1, tx: 0, ty: 0, tzoom: 1 };
  const uScale = { value: 1 };
  let W = 1, H = 1;

  const vertexShader = /* glsl */ `
    attribute float aBirth;
    attribute float aSize;
    attribute vec3 aColor;
    uniform float uGrow, uScale;
    varying vec3 vColor;
    varying float vAlpha;
    void main() {
      float age = uGrow - aBirth;
      float vis = step(0.0, age) * step(0.0005, uGrow);
      float pop = smoothstep(0.0, 0.03, age);
      float fresh = 1.0 - smoothstep(0.0, 0.14, age);   // newest growth glows lime
      vec3 c = mix(aColor, vec3(0.84, 0.96, 0.42), fresh * 0.85);
      vColor = c;
      vAlpha = vis;
      gl_PointSize = aSize * uScale * pop * vis;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }`;
  const fragmentShader = /* glsl */ `
    varying vec3 vColor;
    varying float vAlpha;
    void main() {
      if (vAlpha < 0.01) discard;
      gl_FragColor = vec4(vColor, vAlpha);
    }`;

  // ---------------------------------------------------------------- tree model

  function link(node: TreeNode, parent: TreeNode | null = null, depth = 0) {
    node.parent = parent;
  if (parent?.flip) node.flip = true; // a branch growing left keeps going left
    node.depth = depth;
    (node.children || []).forEach((c: TreeNode) => link(c, node, depth + 1));
  }
  link(TREE);
  TREE.angle = FLOW;
  TREE.anchor = V(-Math.cos(FLOW) * 820, -Math.sin(FLOW) * 820 - 10);

  /** Dots for one stroke along a curve. r = radius in world px; b0..b1 = birth range (0..1 of the branch growth). */
  type StrokeOpts = { r0: number; r1: number; b0: number; b1: number; leafy?: number };
  function stroke(dots: Dots, curve: THREE.Curve<THREE.Vector2>, rng: Rng, { r0, r1, b0, b1, leafy = 0 }: StrokeOpts) {
    const len = curve.getLength();
    const steps = Math.max(4, Math.ceil(len / 1.4));
    for (let s = 0; s <= steps; s++) {
      const t = s / steps;
      const p = curve.getPointAt(t);
      const tan = curve.getTangentAt(t);
      const nx = -tan.y, ny = tan.x;
      const r = lerp(r0, r1, Math.pow(t, 0.8));
      const birth = lerp(b0, b1, t);
      const tip = clamp((t - 0.7) / 0.3, 0, 1);
      if (tip > 0 && rng() < tip * 0.55) continue; // tips break up into sparse dots
      const n = Math.max(1, Math.round(r * 0.9));
      for (let k = 0; k < n; k++) {
        const u = rng() * 2 - 1;
        const x = p.x + nx * u * r + tan.x * (rng() - 0.5) * 2;
        const y = p.y + ny * u * r + tan.y * (rng() - 0.5) * 2;
        let col;
        const g = rng();
        if (Math.abs(u) < 0.55 && g < 0.75 - tip * 0.6) col = pick(rng, BARK);
        else if (u > 0.2 || g > 0.8 - tip * 0.4) col = pick(rng, LIME);
        else col = pick(rng, MOSS);
        dots.push(x, y, birth, col, GRID * (0.75 + rng() * 0.35));
      }
      // moss / leaf clumps, mostly near the base of a branch
      if (leafy && rng() < leafy * (1.1 - t) * 0.05) clump(dots, rng, p.x + nx * r * 0.6, p.y + ny * r * 0.6, 3 + rng() * 8, birth + 0.04);
    }
  }

  function clump(dots: Dots, rng: Rng, cx: number, cy: number, rad: number, birth: number) {
    const n = Math.round(rad * rad * 0.45);
    for (let i = 0; i < n; i++) {
      const a = rng() * Math.PI * 2, d = Math.sqrt(rng()) * rad;
      const col = rng() < 0.15 ? pick(rng, MOSS) : pick(rng, LIME);
      dots.push(cx + Math.cos(a) * d * 1.3, cy + Math.sin(a) * d * 0.8, Math.min(1, birth + rng() * 0.05), col, GRID * (0.8 + rng() * 0.4));
    }
  }

  type Rect = { x0: number; x1: number; y0: number; y1: number; node: TreeNode };
  type Twig = { curve: THREE.Curve<THREE.Vector2>; kid: TreeNode; t: number; isDir: boolean; end: THREE.Vector2; angle: number; left: boolean; pts: THREE.Vector2[] };
  type Layout = { mainPts: THREE.Vector2[]; curve: THREE.SplineCurve; twigs: Twig[]; pts: THREE.Vector2[]; rects: Rect[]; angle: number };

  const sample = (curve: THREE.Curve<THREE.Vector2>, out: THREE.Vector2[]) => {
    const n = Math.max(2, Math.ceil(curve.getLength() / 7));
    for (let i = 0; i <= n; i++) out.push(curve.getPointAt(i / n));
  };
  const labelRect = (kid: TreeNode, end: THREE.Vector2, left: boolean): Rect => {
    const w = kid.name.length * 6.8 + 52;
    return { x0: left ? end.x - w : end.x - 20, x1: left ? end.x + 20 : end.x + w, y0: end.y - 20, y1: end.y + 20, node: kid };
  };

  /** Lays out the branch for an open folder at a given angle: the curve, the twigs and where every label lands. */
  function layoutBranch(folder: TreeNode, angle: number, lenMul: number, variant: number): Layout {
    const rng = seeded(pathOf(folder) + '#' + variant);
    const kids = folder.children;
    const isRoot = !folder.parent;
    const L = (isRoot ? 1500 : 190 + 130 * kids.length) * (SMALL ? 0.72 : 1) * lenMul;
    const flip = folder.flip;
    const d = V(Math.cos(angle) * (flip ? -1 : 1), Math.sin(angle)), n = V(-d.y, d.x); // flip mirrors the branch to grow left
    const P = folder.anchor;
    const at = (f: number, w: number) => P.clone().addScaledVector(d, L * f).addScaledVector(n, w);
    // a smooth S-curve: a sine wave along the branch, eased in so it leaves the folder cleanly
    const cycles = isRoot ? 1.5 : 1 + rng() * 0.6;
    const amp = (isRoot ? 14 : 20 + L * 0.03) * (SMALL ? 0.8 : 1);
    const phase = rng() * Math.PI * 2;
    const pts: THREE.Vector2[] = [];
    for (let i = 0; i <= 24; i++) {
      const f = i / 24;
      const env = ease(Math.min(1, f / 0.35));
      pts.push(at(f, amp * env * (Math.sin(phase + f * cycles * Math.PI * 2) - Math.sin(phase))));
    }
    const curve = new THREE.SplineCurve(pts);
    const samples: THREE.Vector2[] = [];
    sample(curve, samples);
    const mainPts = [...samples];

    const t0 = isRoot ? 0.4 : 0.16, t1 = 0.88;
    let side = isRoot ? 1 : rng() < 0.5 ? 1 : -1; // the phases alternate up, down, up…
    const twigs: Twig[] = [];
    const rects: Rect[] = [];
    kids.forEach((kid: TreeNode, i: number) => {
      const t = kids.length === 1 ? (t0 + t1) / 2 : lerp(t0, t1, i / (kids.length - 1));
      const B = curve.getPointAt(t);
      const T = curve.getTangentAt(t);
      // an item whose branch grows left hangs off the left side, so it never crosses the branch it came from
      const N0 = V(-T.y, T.x);
      if (kid.flip && Math.abs(N0.x) > 0.3) side = N0.x > 0 ? -1 : 1;
      const N = N0.multiplyScalar(side);
      const isDir = kid.type === 'folder';
      const off = (isDir ? 46 : 34) + rng() * 18;
      const end = B.clone().addScaledVector(N, off).addScaledVector(T, off * 0.8);
      // twig leaves along the branch, then curls out to the side
      const c1 = B.clone().addScaledVector(T, off * 0.6).addScaledVector(N, off * 0.1);
      const c2 = end.clone().addScaledVector(N, -off * 0.55).addScaledVector(T, off * 0.05);
      // stop the twig just short of the icon so the dots don't run through it
      const tipEnd = end.clone().addScaledVector(end.clone().sub(c2).normalize(), -22);
      const twig = new THREE.CubicBezierCurve(B, c1, c2, tipEnd);
      const left = kid.flip || N.x < -0.6; // twig points left → put the name on the left of the icon
      const twigPts: THREE.Vector2[] = [];
      sample(twig, twigPts);
      samples.push(...twigPts);
      rects.push(labelRect(kid, end, left));
      twigs.push({ curve: twig, kid, t, isDir, end, angle: kid.down ? -(0.3 + rng() * 0.2) : FLOW + side * (isRoot ? 1.2 + rng() * 0.1 : 0.28 + rng() * 0.14), left, pts: twigPts }); // sub-branches split off gently and keep heading sideways
      side = -side;
    });
    return { mainPts, curve, twigs, pts: samples, rects, angle };
  }

  const CLEAR = 14; // minimum gap between two branches, in world px
  const inRect = (p: THREE.Vector2, r: Rect, pad: number) => p.x > r.x0 - pad && p.x < r.x1 + pad && p.y > r.y0 - pad && p.y < r.y1 + pad;
  const rectsHit = (a: Rect, b: Rect) => a.x0 < b.x1 + 6 && a.x1 > b.x0 - 6 && a.y0 < b.y1 + 6 && a.y1 > b.y0 - 6;

  /** How much a layout collides with the branches that are already open (0 = no overlap at all). */
  function overlap(folder: TreeNode, lay: Layout): number {
    const P = folder.anchor;
    const others = [...branches].filter((b) => b.target > 0);
    const near = (p: THREE.Vector2) => p.distanceTo(P) < 70; // where this branch leaves its own folder
    const obsPts = others.flatMap((b) => b.pts).filter((p) => !near(p));
    const obsRects = others.flatMap((b) => b.rects); // includes this folder's own label
    const grid = new Map<string, THREE.Vector2[]>();
    const key = (x: number, y: number) => Math.floor(x / CLEAR) + ',' + Math.floor(y / CLEAR);
    for (const p of obsPts) {
      const k = key(p.x, p.y);
      (grid.get(k) ?? grid.set(k, []).get(k)!).push(p);
    }
    const close = (q: THREE.Vector2) => {
      const cx = Math.floor(q.x / CLEAR), cy = Math.floor(q.y / CLEAR);
      for (let x = cx - 1; x <= cx + 1; x++) for (let y = cy - 1; y <= cy + 1; y++)
        for (const p of grid.get(x + ',' + y) ?? []) if (p.distanceTo(q) < CLEAR) return true;
      return false;
    };
    let score = 0;
    for (const q of lay.pts) {
      if (near(q)) continue;
      if (close(q)) score += 1;
      if (obsRects.some((r) => inRect(q, r, 8))) score += 3;
    }
    // a branch must not run through its own labels either
    for (const r of lay.rects) {
      for (const q of lay.mainPts) if (!near(q) && inRect(q, r, 4)) score += 3;
      for (const tw of lay.twigs) if (tw.kid !== r.node) for (const q of tw.pts) if (inRect(q, r, 4)) score += 3;
    }
    // twigs must not cross the branch they grow from, or each other
    for (const tw of lay.twigs) {
      const from = tw.pts[0];
      for (const q of tw.pts) {
        if (q.distanceTo(from) < 28) continue;
        if (lay.mainPts.some((m) => m.distanceTo(q) < 10)) score += 2;
        for (const o of lay.twigs) if (o !== tw && o.pts.some((m) => m.distanceTo(q) < 10)) score += 1;
      }
    }
    lay.rects.forEach((r, i) => {
      for (const o of lay.rects.slice(i + 1)) if (rectsHit(r, o)) score += 100; // siblings on the same branch
    });
    for (const r of lay.rects) {
      for (const o of obsRects) if (rectsHit(r, o)) score += 100;
      for (const p of obsPts) if (inRect(p, r, 6)) score += 2;
    }
    return score;
  }

  /** Builds the branch that grows out of an open folder: geometry + child anchors. */
  function buildBranch(folder: TreeNode): Branch {
    const rng = seeded(pathOf(folder));
    const kids = folder.children;
    const isRoot = !folder.parent;
    const base = folder.angle;

    // try the natural angle first, then steeper or shorter versions until the branch stays clear of the others
    const phase = folder.depth === 1; // a phase keeps its up or down direction
    let lay = layoutBranch(folder, base, 1, 0);
    if (!isRoot && overlap(folder, lay) > 0) {
      const tries: { angle: number; len: number; variant: number; cost: number }[] = [];
      for (const off of [0, 0.12, -0.12, 0.25, -0.25, 0.4, -0.4, 0.55, -0.55, 0.7, -0.7, 0.9, -0.9])
        for (const len of [1, 1.2, 1.4, 0.85, 0.7])
          for (const variant of [0, 1, 2])
            tries.push({ angle: phase ? Math.sign(base) * clamp(Math.abs(base + off), 0.9, 1.45) : folder.down ? clamp(base + off, -1.25, -0.1) : clamp(base + off, -1.25, 1.25), len, variant, cost: Math.abs(off) + Math.abs(1 - len) * 2 + variant * 0.3 });
      tries.sort((x, y) => x.cost - y.cost);
      let best = Infinity;
      for (const t of tries) {
        const cand = layoutBranch(folder, t.angle, t.len, t.variant);
        const score = overlap(folder, cand) + t.cost * 0.5;
        if (score < best) { best = score; lay = cand; }
        if (score <= t.cost * 0.5) break; // no overlap
      }
      if (best > 100) console.warn('[path] overlap left', folder.name, best);
    }
    const { curve, twigs } = lay;

    const dots: Dots = [];
    const r0 = isRoot ? 7 : Math.max(2.4, 4.6 - folder.depth * 0.5);
    const P = folder.anchor;
    stroke(dots, curve, rng, { r0, r1: 0.8, b0: 0, b1: 0.78, leafy: 1 });
    if (!isRoot) clump(dots, rng, P.x, P.y + 3, 9, 0.02); // moss where the branch leaves the folder

    for (const tw of twigs) {
      const b0 = tw.t * 0.78;
      stroke(dots, tw.curve, rng, tw.isDir
        ? { r0: Math.max(1.8, r0 * 0.55), r1: 1.6, b0, b1: b0 + 0.12, leafy: 1.5 }
        : { r0: 1.3, r1: 0.6, b0, b1: b0 + 0.1 });
      tw.kid.anchor = tw.end;
      tw.kid.birth = b0 + 0.1;
      tw.kid.angle = tw.angle;
      tw.kid.left = tw.left;
    }

    // pack attributes
    const count = dots.length / 5;
    const pos = new Float32Array(count * 3), birth = new Float32Array(count), size = new Float32Array(count), color = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const j = i * 5;
      pos[i * 3] = Math.round(dots[j] / GRID) * GRID;
      pos[i * 3 + 1] = Math.round(dots[j + 1] / GRID) * GRID;
      birth[i] = dots[j + 2];
      color.set(dots[j + 3], i * 3);
      size[i] = dots[j + 4];
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('aBirth', new THREE.BufferAttribute(birth, 1));
    geo.setAttribute('aSize', new THREE.BufferAttribute(size, 1));
    geo.setAttribute('aColor', new THREE.BufferAttribute(color, 3));
    const mat = new THREE.ShaderMaterial({
      uniforms: { uGrow: { value: 0 }, uScale },
      vertexShader, fragmentShader, transparent: true, depthTest: false, depthWrite: false,
    });
    const points = new THREE.Points(geo, mat);
    points.renderOrder = folder.depth;
    points.frustumCulled = false;
    scene.add(points);

    kids.forEach((kid: TreeNode) => {
      kid.el = makeLabel(kid);
      labels.appendChild(kid.el);
    });

    return { folder, points, mat, p: 0, target: 1, end: curve.getPointAt(1), pts: lay.pts, rects: lay.rects };
  }

  function makeLabel(node: TreeNode) {
    const el = document.createElement('div');
    el.className = node.left ? 'item left' : 'item';
    el.innerHTML = (node.type === 'folder' ? ICONS.folder : node.logo ? LINK_ICONS.site : node.url ? linkIcon(node.url) : ICONS.file) + `<span>${esc(node.name)}${node.type === 'folder' ? '/' : ''}</span>`;
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      if (node.type === 'folder') toggleFolder(node);
      else openFile(node);
    });
    return el;
  }

  // ---------------------------------------------------------------- state

  const branches = new Set<Branch>();
  let active = TREE;

  function open(folder: TreeNode) {
    if (folder.branch) folder.branch.target = 1;
    else {
      folder.branch = buildBranch(folder);
      branches.add(folder.branch);
    }
    folder.open = true;
    folder.el?.classList.add('open');
  }

  function close(folder: TreeNode) {
    if (!folder.open) return;
    folder.children.forEach((c: TreeNode) => c.type === 'folder' && close(c));
    folder.open = false;
    folder.el?.classList.remove('open');
    if (folder.branch) folder.branch.target = 0;
  }

  function toggleFolder(folder: TreeNode) {
    const parent = folder.parent!;
    if (folder.open && folder === active) {
      close(folder);
      setActive(parent);
      return;
    }
    // other open folders stay open until the person closes them
    if (!folder.open) open(folder);
    setActive(folder);
  }

  function setActive(folder: TreeNode) {
    active = folder;
    const names = pathOf(folder).split('/');
    root.querySelector<HTMLElement>('#ft-title')!.innerHTML = names.slice(0, -1).map((x) => x + ' /').join(' ') + ` <b>${names.at(-1)}</b>`;
    root.querySelector<HTMLButtonElement>('#ft-back')!.disabled = !folder.parent;
    if (folder !== TREE) root.querySelector<HTMLElement>('#ft-hint')!.classList.add('gone');
    focus(folder);
  }

  function focus(folder: TreeNode) {
    // fit the icons plus their names (≈130px wide, on the left or right of the icon)
    const pts: THREE.Vector2[] = [];
    for (const c of folder.children) pts.push(c.anchor, c.anchor.clone().setX(c.anchor.x + (c.left ? -130 : 130)));
    pts.push(folder.branch!.end);
    if (folder.parent) pts.push(folder.anchor, folder.anchor.clone().setX(folder.anchor.x + (folder.left ? -110 : 110)));
    let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
    for (const p of pts) { x0 = Math.min(x0, p.x); x1 = Math.max(x1, p.x); y0 = Math.min(y0, p.y); y1 = Math.max(y1, p.y); }
    x0 -= 20; x1 += 20; y0 -= 40; y1 += 40;
    // keep things readable on a phone: if it doesn't fit, start from the open folder and let the rest run off the right edge
    const zoom = clamp(Math.min(W / (x1 - x0), H / (y1 - y0)), SMALL ? 0.72 : 0.45, 1.5);
    const fitsX = (x1 - x0) * zoom <= W;
    cam.tx = fitsX ? (x0 + x1) / 2 : x0 + W / 2 / zoom;
    cam.ty = (y0 + y1) / 2;
    cam.tzoom = zoom;
    manual = false;
  }

  root.querySelector<HTMLElement>('#ft-back')!.addEventListener('click', () => {
    if (!active.parent) return;
    const was = active;
    close(was);
    setActive(was.parent!);
  }, { signal });

  // ---------------------------------------------------------------- quick look

  const ql = root.querySelector<HTMLElement>('#ft-ql')!;
  function openFile(node: TreeNode) {
    root.querySelectorAll('.item.picked').forEach((e) => e.classList.remove('picked'));
    node.el.classList.add('picked');
    const where = pathOf(node.parent!).replaceAll('/', ' › ');
    let body = `<p>${esc(node.text ?? '')}</p>`;
    if (node.url) {
      const { src, ratio } = embedOf(node.url);
      body += `<iframe class="ql-embed" style="aspect-ratio:${ratio}" src="${esc(src)}" title="${esc(node.name)}" loading="lazy" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>`
        + `<p><a class="ql-link" href="${esc(node.url)}" target="_blank" rel="noopener noreferrer">Open in a new tab ↗</a></p>`;
    }
    root.querySelector<HTMLElement>('#ft-ql-icon')!.innerHTML = ICONS.file;
    root.querySelector<HTMLElement>('#ft-ql-name')!.textContent = node.name;
    root.querySelector<HTMLElement>('#ft-ql-body')!.innerHTML = body + `<div class="meta">${esc(where)}</div>`;
    ql.classList.add('on');
  }
  const closeQl = () => {
    ql.classList.remove('on');
    root.querySelector<HTMLElement>('#ft-ql-body')!.replaceChildren(); // stops any playing video
  };
  root.querySelector<HTMLElement>('#ft-ql-close')!.addEventListener('click', closeQl, { signal });
  ql.addEventListener('click', (e) => e.target === ql && closeQl(), { signal });
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape') closeQl();
    if ((e.key === 'Backspace' || e.key === 'ArrowLeft') && !ql.classList.contains('on')) root.querySelector<HTMLElement>('#ft-back')!.click();
  };
  addEventListener('keydown', onKey, { signal });

  // ---------------------------------------------------------------- pan / zoom

  let manual = false;
  const pointers = new Map();
  let pinch: { d: number; zoom: number } | null = null;
  viewport.addEventListener('pointerdown', (e) => {
    if ((e.target as Element).closest('.item, .ql')) return;
    viewport.setPointerCapture(e.pointerId);
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    viewport.classList.add('dragging');
    if (pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), zoom: cam.zoom };
    }
  }, { signal });
  viewport.addEventListener('pointermove', (e) => {
    const prev = pointers.get(e.pointerId);
    if (!prev) return;
    const cur = { x: e.clientX, y: e.clientY };
    pointers.set(e.pointerId, cur);
    manual = true;
    if (pointers.size === 2 && pinch) {
      const [a, b] = [...pointers.values()];
      cam.zoom = cam.tzoom = clamp(pinch.zoom * Math.hypot(a.x - b.x, a.y - b.y) / pinch.d, 0.3, 3);
    }
    cam.x = cam.tx -= (cur.x - prev.x) / cam.zoom / pointers.size;
    cam.y = cam.ty += (cur.y - prev.y) / cam.zoom / pointers.size;
  }, { signal });
  const release = (e: PointerEvent) => {
    pointers.delete(e.pointerId);
    if (pointers.size < 2) pinch = null;
    if (!pointers.size) viewport.classList.remove('dragging');
  };
  viewport.addEventListener('pointerup', release, { signal });
  viewport.addEventListener('pointercancel', release, { signal });
  viewport.addEventListener('wheel', (e: WheelEvent) => {
    e.preventDefault();
    manual = true;
    if (e.ctrlKey) {
      // trackpad pinch (or ctrl + wheel) → zoom around the cursor
      const r = viewport.getBoundingClientRect();
      const mx = e.clientX - r.left - W / 2, my = e.clientY - r.top - H / 2;
      const wx = cam.x + mx / cam.zoom, wy = cam.y - my / cam.zoom;
      cam.zoom = cam.tzoom = clamp(cam.zoom * Math.exp(-e.deltaY * 0.004), 0.3, 3);
      cam.x = cam.tx = wx - mx / cam.zoom;
      cam.y = cam.ty = wy + my / cam.zoom;
    } else {
      cam.x = cam.tx += e.deltaX / cam.zoom;
      cam.y = cam.ty -= e.deltaY / cam.zoom;
    }
  }, { passive: false, signal });

  // ---------------------------------------------------------------- loop

  function resize() {
    W = viewport.clientWidth;
    H = viewport.clientHeight;
    renderer.setSize(W, H);
    camera.left = -W / 2; camera.right = W / 2; camera.top = H / 2; camera.bottom = -H / 2;
    if (!manual && active.branch) focus(active);
  }
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(viewport);

  function project(p: THREE.Vector2) {
    return [(p.x - cam.x) * cam.zoom + W / 2, H / 2 - (p.y - cam.y) * cam.zoom];
  }

  let last = performance.now();
  let raf = 0;
  function frame(now: number) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;

    // camera eases toward its target unless the user is steering
    if (!manual) {
      const k = REDUCED ? 1 : 1 - Math.exp(-dt * 2.6);
      cam.x += (cam.tx - cam.x) * k;
      cam.y += (cam.ty - cam.y) * k;
      cam.zoom += (cam.tzoom - cam.zoom) * k;
    }
    camera.position.x = cam.x;
    camera.position.y = cam.y;
    camera.zoom = cam.zoom;
    camera.updateProjectionMatrix();
    uScale.value = cam.zoom * renderer.getPixelRatio();

    for (const b of branches) {
      const dir = Math.sign(b.target - b.p);
      if (dir) b.p = clamp(b.p + dir * dt / (dir > 0 ? GROW_S : SHRINK_S), 0, 1);
      const g = ease(b.p);
      b.mat.uniforms.uGrow.value = g;
      for (const kid of b.folder.children) {
        const [x, y] = project(kid.anchor);
        // labels follow the zoom, like the branches (but never unreadably small, and not huge when zoomed in)
        const k = clamp(cam.zoom, 0.6, 2);
        kid.el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) scale(${k.toFixed(3)}) translate(${kid.left ? 'calc(-100% + 20px)' : '-20px'}, -21px)`;
        kid.el.classList.toggle('shown', b.target > 0 && g >= kid.birth);
      }
      if (b.p === 0 && b.target === 0) {
        // fully retracted: drop it
        scene.remove(b.points);
        b.points.geometry.dispose();
        b.mat.dispose();
        b.folder.children.forEach((k) => k.el.remove());
        b.folder.branch = null;
        branches.delete(b);
      }
    }

    renderer.render(scene, camera);
    raf = requestAnimationFrame(frame);
  }

  resize();
  open(TREE);
  setActive(TREE);
  cam.x = cam.tx; cam.y = cam.ty; cam.zoom = cam.tzoom;
  raf = requestAnimationFrame(frame);

  return () => {
    cancelAnimationFrame(raf);
    resizeObserver.disconnect();
    ac.abort();
    for (const b of branches) {
      b.points.geometry.dispose();
      b.mat.dispose();
    }
    renderer.dispose();
    renderer.domElement.remove();
    labels.replaceChildren();
  };

}
