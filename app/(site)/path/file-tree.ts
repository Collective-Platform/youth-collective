// Literal file tree — every folder is a node on a vine. Open a folder and a dotted branch
// grows out of it, with its files hanging off twigs. Placeholder content: edit TREE below.
// Ported from the standalone prototype (file-tree/main.js).
import * as THREE from 'three';
import type { TreeSpec } from './tree-spec';
import type { PathView } from './tree-views';


// ---------------------------------------------------------------- content

export type TreeNode = {
  name: string;
  type: 'folder' | 'file';
  text?: string;
  url?: string;
  newTab?: boolean; // open the link straight in a new tab instead of the preview
  logo?: boolean; // show the site favicon as the icon
  by?: 'us'; // made by the church
  hidden: boolean; // not part of the current view (the By us view hides everything that isn't by us); it keeps its place on the branch
  usHidden: boolean; // not by us (and, for a folder, nothing by us inside it): the By us layout leaves it out
  tc: number; // where its twig leaves the main branch in By us (0..1): closer to the base than `t`, which is its place in the full layout
  sl: Slide; // how its twig is carried along its parent's branch right now: in By us it sits further in, and slides out as the branch grows
  xf: Xf; // where its own branch (and its anchor) is now, relative to the full layout: its parent's xf, then the slide
  flip: boolean; // grows to the left
  down: boolean; // always grows downwards
  explicit: boolean; // its grow direction was set in tree-data.json, so it keeps that instead of flowing on from its parent
  leftOwn: boolean; // its own setting is to grow left
  side?: 'up' | 'down'; // forced side of the parent's branch (otherwise it alternates)
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
  twig: THREE.Curve<THREE.Vector2>; // the twig that leads to it
  glow: number; // 0..1: strength of the green glow riding the colour along its twig
  idx: number; // position among its siblings
  t: number; // where its twig leaves the parent's branch (0..1)
  showP: number; // 0..1: how far its twig has grown in (it stays hidden until unlocked)
  doneP: number; // 0..1: how far the green has grown along its twig
};
type Xf = { x: number; y: number; r: number }; // a move and a turn: p becomes R(r) p + (x, y)
type Slide = { b: THREE.Vector2; c: THREE.Vector2; r: number }; // carries the frame at b over to c, turned by r (the branch bends, so the twig turns with it)
type Branch = {
  folder: TreeNode;
  points: THREE.Points;
  mat: THREE.ShaderMaterial;
  p: number;
  target: number;
  trunkP: number; // 0..1: how far the green has grown along the main branch
  curve: THREE.Curve<THREE.Vector2>; // the main branch
  tEnd: number; // where along the curve the main branch stops
  glow: number; // 0..1: strength of the green glow riding the colour along the main branch
  cutP: number; // 0..1: how far along the main branch is drawn: only up to the last unlocked item
  len: number; // length of the main branch in world px
  end: THREE.Vector2;
  pts: THREE.Vector2[];
  rects: { x0: number; x1: number; y0: number; y1: number; node: TreeNode }[];
};

// A folder has a "children" list in tree-data.json; a file does not.
const build = (s: TreeSpec): TreeNode =>
  ({ name: s.name, type: s.children ? "folder" : "file", text: s.text, url: s.url, logo: s.logo, by: s.by, hidden: false, usHidden: false, tc: 0, newTab: s.newTab, flip: s.grow === "left" || s.grow === "down-left", down: s.grow === "down" || s.grow === "down-left", side: s.side, explicit: !!s.grow, leftOwn: s.grow === "left" || s.grow === "down-left", children: (s.children ?? []).map(build) }) as unknown as TreeNode;


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
const REVEAL_STEP = 3; // a folder shows this many items, and this many more each time one of its items is opened
const READ_MS = 10000; // how long a preview must stay open to count as read (videos count by watch time instead)
const TRUNK_PX_S = 420; // the colour runs along a branch at about this many px a second (but never faster than 1.2s or slower than 4s end to end)
// The switch plays in three steps along one 0..1 clock (growing: main branch, then the item branches, then the names; shrinking: the reverse)
const MAIN_END = 0.55; // the main branch grows / shrinks during 0..MAIN_END
const TWIG_END = 0.85; // the item branches that only Reach practice shows grow / shrink during MAIN_END..TWIG_END
const LABEL_AT = 0.9; // their names fade in past this, and out below it
const SWITCH_S = 1.8; // seconds for the whole switch
const SHOW_S = 0.9; // seconds for a newly unlocked twig to grow in
const TWIG_S = 1.0; // seconds for the colour to run out along a twig
const STORE_KEY = 'path-progress-v1';

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
function embedOf(url: string): { src: string; ratio: string; thumb?: string } {
  const u = new URL(url, location.origin);
  const host = u.hostname.replace(/^www\./, '');
  if (host === 'youtube.com' || host === 'youtu.be') {
    const list = u.searchParams.get('list');
    const id = host === 'youtu.be' ? u.pathname.slice(1) : u.searchParams.get('v');
    if (u.pathname === '/playlist' && list) return { src: `https://www.youtube.com/embed/videoseries?list=${encodeURIComponent(list)}`, ratio: '16 / 9', thumb: '' };
    return { src: `https://www.youtube.com/embed/${encodeURIComponent(id ?? '')}`, ratio: '16 / 9', thumb: `https://i.ytimg.com/vi/${encodeURIComponent(id ?? '')}/hqdefault.jpg` };
  }
  if (host === 'instagram.com') return { src: `https://www.instagram.com${u.pathname.replace(/\/?$/, '/')}embed`, ratio: '9 / 14' };
  if (host === 'tiktok.com') return { src: `https://www.tiktok.com/embed/v2/${u.pathname.split('/').pop()}`, ratio: '9 / 15' };
  if (u.origin !== location.origin) u.protocol = 'https:'; // an http page can't be shown inside our https page
  return { src: u.href, ratio: matchMedia('(min-width: 900px)').matches ? '16 / 9' : '3 / 4' }; // websites are landscape on desktop, portrait on a phone
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

const xfApply = (f: Xf, p: THREE.Vector2) => {
  const c = Math.cos(f.r), s = Math.sin(f.r);
  return new THREE.Vector2(c * p.x - s * p.y + f.x, s * p.x + c * p.y + f.y);
};
const xfMul = (a: Xf, b: Xf): Xf => {
  const c = Math.cos(a.r), s = Math.sin(a.r);
  return { x: c * b.x - s * b.y + a.x, y: s * b.x + c * b.y + a.y, r: a.r + b.r };
};
const slideXf = ({ b, c, r }: Slide): Xf => {
  const co = Math.cos(r), si = Math.sin(r);
  return { x: c.x - (co * b.x - si * b.y), y: c.y - (si * b.x + co * b.y), r };
};

type Rng = () => number;
// flat list of 7 values per dot: x, y, birth, colour ([r, g, b]), size, item index (-1 = main branch), position along its stroke
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Dots = any[];

// ---------------------------------------------------------------- helpers

const V = (x: number, y: number) => new THREE.Vector2(x, y);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const smooth01 = (x: number) => { const t = clamp(x, 0, 1); return t * t * (3 - 2 * t); };
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
export type FileTreeHandle = { destroy: () => void; setView: (view: PathView, label: string) => void };
export function mountFileTree(root: HTMLElement, spec: TreeSpec, view: PathView, label: string): FileTreeHandle {
  const TREE = build(spec); // always laid out in full: a view hides items, it never moves them
  let rootLabel = label; // the root is shown under the name of the view, but keeps its own name for the vine shapes and saved progress
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

  const maxKids = (n: TreeNode): number => Math.max(n.children.length, ...n.children.map(maxKids));
  const MAXK = Math.max(1, maxKids(TREE));
  const vertexShader = /* glsl */ `
    #define MAXK ${MAXK}
    attribute float aBirth;
    attribute float aSize;
    attribute vec3 aColor;
    attribute float aKid, aPos;   // which item's twig this dot belongs to (-1 = the main branch), and how far along its stroke
    uniform float uGrow, uScale, uTrunk, uCut;   // uCut: how far along the main branch is drawn (it stops at the last unlocked item)
    uniform float uShow[MAXK];    // per item: how far its twig has grown in
    uniform vec2 uKS[MAXK];       // per item: where the base of its twig ends up on the main branch (the main branch itself never moves, it just grows longer)
    uniform vec2 uKB[MAXK];       // per item: where the base of its twig is in the full layout
    uniform vec2 uKA[MAXK];       // per item: cos, sin of how far its twig turns to follow the bend of the main branch
    uniform float uBS[MAXK];      // per item: how much earlier its twig is born because it sits closer to the base
    uniform float uDone[MAXK];    // per item: how far the green has grown along its twig
    varying vec3 vColor;
    varying float vAlpha;
    void main() {
      float onTrunk = step(aKid, -0.5);
      int k = int(max(aKid, 0.0));
      vec2 rel = position.xy - uKB[k];
      vec2 moved = uKS[k] + vec2(uKA[k].x * rel.x - uKA[k].y * rel.y, uKA[k].y * rel.x + uKA[k].x * rel.y);
      vec2 where = onTrunk > 0.5 ? position.xy : moved;
      float show = mix(uShow[k], 1.0, onTrunk);
      float done = mix(uDone[k], uTrunk, onTrunk);
      float age = uGrow - (aBirth - mix(uBS[k], 0.0, onTrunk));   // a twig that sits further in than usual is born when the branch reaches that spot
      float vis = step(0.0, age) * step(0.0005, uGrow) * step(aPos, show) * step(0.0005, show) * mix(1.0, step(aPos, uCut), onTrunk);
      float pop = smoothstep(0.0, 0.03, age);
      float fresh = 1.0 - smoothstep(0.0, 0.14, age);   // newest growth glows
      // not read yet: grey. read: full colour, growing in along the branch like the branch itself grew
      float lum = dot(aColor, vec3(0.299, 0.587, 0.114));
      vec3 grey = vec3(mix(lum, 0.62, 0.4));
      float d = done * 1.08;   // the soft edge is 8% of the stroke wide, so at done = 1 every dot is fully coloured
      float isGreen = smoothstep(0.0, 0.08, d - aPos);
      float front = isGreen * (1.0 - smoothstep(0.0, 0.16, d - aPos)) * (1.0 - smoothstep(0.9, 1.0, done)); // soft glow just behind the edge
      vec3 c = mix(grey, aColor, isGreen);   // read branches get their original bark / moss / lime back
      c = mix(c, vec3(0.84, 0.96, 0.42), front * 0.8);
      c = mix(c, mix(vec3(0.9), vec3(0.84, 0.96, 0.42), isGreen), fresh * 0.85);
      vColor = c;
      vAlpha = vis;
      gl_PointSize = aSize * uScale * pop * vis;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(where, position.z, 1.0);
    }`;
  const fragmentShader = /* glsl */ `
    varying vec3 vColor;
    varying float vAlpha;
    void main() {
      if (vAlpha < 0.01) discard;
      gl_FragColor = vec4(vColor, vAlpha);
    }`;

  // ---------------------------------------------------------------- glow

  // A faint green halo lies along the whole coloured part of a branch while its colour is growing, and fades out as the colour reaches its point.
  const GLOW_TRAIL = 64, GLOW_MAX = 48; // points per branch, and how many branches can glow at once
  const glowPos = new Float32Array(GLOW_MAX * GLOW_TRAIL * 3), glowAlpha = new Float32Array(GLOW_MAX * GLOW_TRAIL), glowSize = new Float32Array(GLOW_MAX * GLOW_TRAIL);
  const glowGeo = new THREE.BufferGeometry();
  glowGeo.setAttribute('position', new THREE.BufferAttribute(glowPos, 3).setUsage(THREE.DynamicDrawUsage));
  glowGeo.setAttribute('aAlpha', new THREE.BufferAttribute(glowAlpha, 1).setUsage(THREE.DynamicDrawUsage));
  glowGeo.setAttribute('aSize', new THREE.BufferAttribute(glowSize, 1).setUsage(THREE.DynamicDrawUsage));
  glowGeo.setDrawRange(0, 0);
  const glowMat = new THREE.ShaderMaterial({
    uniforms: { uScale },
    vertexShader: /* glsl */ `
      attribute float aAlpha, aSize;
      uniform float uScale;
      varying float vAlpha;
      void main() {
        vAlpha = aAlpha;
        gl_PointSize = min(aSize * uScale, 160.0);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: /* glsl */ `
      varying float vAlpha;
      void main() {
        float d = length(gl_PointCoord - 0.5) * 2.0;
        if (d > 1.0) discard;
        float a = pow(1.0 - d, 1.5) * vAlpha;
        gl_FragColor = vec4(0.66, 0.85, 0.28, a); // the lime of the branch itself
      }`,
    transparent: true, depthTest: false, depthWrite: false,
  });
  const glowPoints = new THREE.Points(glowGeo, glowMat);
  glowPoints.renderOrder = -1; // under every branch
  glowPoints.frustumCulled = false;
  scene.add(glowPoints);
  let glowN = 0; // points in use this frame
  /** Lays a glow along the curve from its start to `front` (0..1); it fades out as `front` gets to `goal`. */
  function addGlow(curve: THREE.Curve<THREE.Vector2>, front: number, goal: number, strength: number, size: number, at: (t: number) => THREE.Vector2) {
    const arrive = smooth01(Math.abs(goal - front) / 0.12); // 0 once the colour has reached its point
    const s = strength * arrive;
    if (glowN + GLOW_TRAIL > GLOW_MAX * GLOW_TRAIL || s < 0.02 || front < 0.001) return;
    const n = clamp(Math.ceil(front * curve.getLength() / (size * 0.35)) + 1, 2, GLOW_TRAIL);
    for (let j = 0; j < n; j++) {
      const q = at(front * j / (n - 1));
      const i = glowN + j;
      glowPos[i * 3] = q.x; glowPos[i * 3 + 1] = q.y; glowPos[i * 3 + 2] = 0;
      glowAlpha[i] = s * 0.05;
      glowSize[i] = size;
    }
    glowN += n;
  }
  /** Eases a glow's strength up while its colour is moving and down once it stops. */
  const glowTo = (cur: number, moving: boolean, dt: number) => cur + ((moving ? 1 : 0) - cur) * (1 - Math.exp(-dt * (moving ? 12 : 3.5)));
  // where the visible edge of the colour is (the shader's soft edge sits a little behind the raw progress)
  const edgeOf = (p: number, max = 1) => clamp(p * 1.08 - 0.04, 0, max);

  // ---------------------------------------------------------------- tree model

  function link(node: TreeNode, parent: TreeNode | null = null, depth = 0) {
    node.parent = parent;
  if (parent?.flip) node.flip = true; // a branch growing left keeps going left
    node.depth = depth;
    node.xf = { x: 0, y: 0, r: 0 };
    node.sl = { b: V(0, 0), c: V(0, 0), r: 0 };
    (node.children || []).forEach((c: TreeNode) => link(c, node, depth + 1));
  }
  link(TREE);
  /** By us keeps only what the church made (and the folders holding it); Reach practice shows everything. */
  function markUsHidden(n: TreeNode): boolean {
    n.usHidden = n.type === 'file' ? n.by !== 'us' : n.children.map(markUsHidden).every(Boolean);
    return n.usHidden;
  }
  markUsHidden(TREE);
  const applyView = (v: PathView, n: TreeNode = TREE) => {
    n.hidden = v === 'us' && n.usHidden;
    n.children.forEach((c) => applyView(v, c));
  };
  applyView(view);
  // 0 = the compact By us layout, 1 = the full layout. It eases between them when the switch is flipped.
  const viewState = { p: view === 'reach' ? 1 : 0 };
  let viewTarget = viewState.p;
  let quiet = 0; // seconds after a switch during which nothing glows: the glow is only for finishing something new, not for the switch
  TREE.angle = FLOW;
  TREE.anchor = V(-Math.cos(FLOW) * 820, -Math.sin(FLOW) * 820 - 10);

  /** Dots for one stroke along a curve. r = radius in world px; b0..b1 = birth range (0..1 of the branch growth). */
  type StrokeOpts = { r0: number; r1: number; b0: number; b1: number; leafy?: number; kid?: number; tMax?: number }; // tMax < 1 stops the stroke early, with a clean end
  function stroke(dots: Dots, curve: THREE.Curve<THREE.Vector2>, rng: Rng, { r0, r1, b0, b1, leafy = 0, kid = -1, tMax = 1 }: StrokeOpts) {
    const len = curve.getLength() * tMax;
    const steps = Math.max(4, Math.ceil(len / 1.4));
    for (let s = 0; s <= steps; s++) {
      const u = s / steps; // 0..1 along what is drawn
      const t = u * tMax; // 0..1 along the whole curve
      const p = curve.getPointAt(t);
      const tan = curve.getTangentAt(t);
      const nx = -tan.y, ny = tan.x;
      const r = lerp(r0, r1, Math.pow(u, 0.8));
      const birth = lerp(b0, b1, t);
      const tip = tMax < 1 ? 0 : clamp((u - 0.7) / 0.3, 0, 1); // a stroke that is cut short ends cleanly instead of breaking up
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
        dots.push(x, y, birth, col, GRID * (0.75 + rng() * 0.35), kid, t);
      }
      // moss / leaf clumps, mostly near the base of a branch
      if (leafy && rng() < leafy * (1.1 - t) * 0.05) clump(dots, rng, p.x + nx * r * 0.6, p.y + ny * r * 0.6, 3 + rng() * 8, birth + 0.04, kid, t);
    }
  }

  function clump(dots: Dots, rng: Rng, cx: number, cy: number, rad: number, birth: number, kid = -1, pos = 0) {
    const n = Math.round(rad * rad * 0.45);
    for (let i = 0; i < n; i++) {
      const a = rng() * Math.PI * 2, d = Math.sqrt(rng()) * rad;
      const col = rng() < 0.15 ? pick(rng, MOSS) : pick(rng, LIME);
      dots.push(cx + Math.cos(a) * d * 1.3, cy + Math.sin(a) * d * 0.8, Math.min(1, birth + rng() * 0.05), col, GRID * (0.8 + rng() * 0.4), kid, pos);
    }
  }

  type Rect = { x0: number; x1: number; y0: number; y1: number; node: TreeNode };
  type Twig = { curve: THREE.Curve<THREE.Vector2>; kid: TreeNode; t: number; isDir: boolean; end: THREE.Vector2; angle: number; flip: boolean; left: boolean; pts: THREE.Vector2[] };
  type Layout = { L: number; d: THREE.Vector2; mainPts: THREE.Vector2[]; curve: THREE.SplineCurve; tEnd: number; twigs: Twig[]; pts: THREE.Vector2[]; rects: Rect[]; angle: number };

  const sample = (curve: THREE.Curve<THREE.Vector2>, out: THREE.Vector2[], tMax = 1) => {
    const n = Math.max(2, Math.ceil((curve.getLength() * tMax) / 7));
    for (let i = 0; i <= n; i++) out.push(curve.getPointAt((i / n) * tMax));
  };
  const labelRect = (kid: TreeNode, end: THREE.Vector2, left: boolean): Rect => {
    const w = kid.name.length * 7.6 + 52;
    return { x0: left ? end.x - w : end.x - 20, x1: left ? end.x + 20 : end.x + w, y0: end.y - 20, y1: end.y + 20, node: kid };
  };

  /** The direction a sub-branch grows in. */
  function headingFor(kid: TreeNode, side: number, parentIsRoot: boolean, rng: Rng) {
    if (kid.down) return -(0.3 + rng() * 0.2);
    return FLOW + side * (parentIsRoot ? 1.2 + rng() * 0.1 : 0.28 + rng() * 0.14); // sub-branches split off gently and keep heading sideways
  }

  /** How long a branch is before any collision tweaks, and where along it each of `kids` sits (0..1). */
  function slots(folder: TreeNode, kids: TreeNode[]) {
    // a folder item needs more room along the branch than a file: its own branch fans out from there
    const rooms = kids.map((k) => (k.type === 'folder' ? 1.5 + 0.35 * Math.min(k.children.length, 6) : 1));
    const total = rooms.reduce((a, b) => a + b, 0);
    const lenVar = 0.85 + 0.3 * seeded(pathOf(folder) + '#len')(); // some branches run longer than others
    const isRoot = !folder.parent;
    const len = (isRoot ? 1500 : kids.length === 1 ? 110 : (150 + 85 * total) * lenVar) * (SMALL ? 0.72 : 1); // a folder with one item only needs a short branch
    const t0 = isRoot ? 0.4 : 0.16, t1 = 0.96;
    const mid = (j: number) => rooms.slice(0, j).reduce((a, b) => a + b, 0) + rooms[j] / 2; // where item j sits if each takes room along the branch
    const ts = kids.map((_, i) => (kids.length === 1 ? t1 : lerp(t0, t1, (mid(i) - mid(0)) / (mid(kids.length - 1) - mid(0)))));
    return { len, ts, t0 };
  }

  /** Lays out the branch for an open folder at a given angle: the curve, the twigs and where every label lands. */
  function layoutBranch(folder: TreeNode, angle: number, lenMul: number, variant: number): Layout {
    const rng = seeded(pathOf(folder) + '#' + variant);
    const kids = folder.children;
    const isRoot = !folder.parent;
    const slot = slots(folder, kids);
    const lastShown = kids.reduce((m, k, i) => (isRevealed(folder, k) ? i : m), -1);
    const L = slot.len * lenMul;
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
    const t1 = 0.96;
    const tEnd = kids.length ? t1 + 0.015 : 0.3; // the branch stops at its last item: no stretch of branch past it, nothing to fork into
    const samples: THREE.Vector2[] = [];
    sample(curve, samples, tEnd);
    const mainPts = [...samples];

    let side = isRoot ? 1 : rng() < 0.5 ? 1 : -1; // the phases alternate up, down, up…
    const twigs: Twig[] = [];
    const rects: Rect[] = [];
    kids.forEach((kid: TreeNode, i: number) => {
      const t = slot.ts[i];
      const B = curve.getPointAt(t);
      const T = curve.getTangentAt(t);
      // an item whose branch grows left hangs off the left side, so it never crosses the branch it came from
      const N0 = V(-T.y, T.x);
      const inheritsLeft = kid.leftOwn || folder.flip;
      if (inheritsLeft && Math.abs(N0.x) > 0.3) side = N0.x > 0 ? -1 : 1;
      if (kid.side) side = (kid.side === 'up' ? 1 : -1) * (N0.y >= 0 ? 1 : -1); // forced up or down, whichever way the branch is heading
      const N = N0.multiplyScalar(side);
      const isDir = kid.type === 'folder';
      const off = ((isDir ? 80 : 62) + rng() * 22) * (kids.length === 1 ? 0.6 : 1); // a lone item has nothing to be told apart from, so its twig stays short // long enough that a finished twig reads as its own piece of the branch
      const end = B.clone().addScaledVector(N, off).addScaledVector(T, off * 0.8);
      // twig leaves along the branch, then curls out to the side. The last unlocked item has no branch carrying on past it, so its twig
      // heads straight out to its side from the start (otherwise it reads as the branch bending one way and then the other)
      const last = kids.length > 1 && i === lastShown;
      const c1 = last ? B.clone().addScaledVector(N, off * 0.5).addScaledVector(T, off * 0.15) : B.clone().addScaledVector(T, off * 0.6).addScaledVector(N, off * 0.1);
      const c2 = end.clone().addScaledVector(N, -off * 0.55).addScaledVector(T, off * 0.05);
      // stop the twig just short of the icon so the dots don't run through it
      const tipEnd = end.clone().addScaledVector(end.clone().sub(c2).normalize(), -22);
      const twig = new THREE.CubicBezierCurve(B, c1, c2, tipEnd);
      // a folder with no direction of its own carries on from the branch it grows out of, fanning off to its side like a finger
      const flows = isDir && !isRoot && !kid.explicit;
      const spread = 0.6 + rng() * 0.2;
      const D = T.clone().multiplyScalar(Math.cos(spread)).addScaledVector(N, Math.sin(spread)).normalize();
      const kidFlip = flows ? D.x < 0 : inheritsLeft;
      const kidAngle = flows ? Math.atan2(D.y, D.x * (kidFlip ? -1 : 1)) : headingFor(kid, kid.side ? (kid.side === 'up' ? 1 : -1) : side, isRoot, rng);
      const left = kidFlip || N.x < -0.6; // twig points left → put the name on the left of the icon
      const twigPts: THREE.Vector2[] = [];
      sample(twig, twigPts);
      samples.push(...twigPts);
      rects.push(labelRect(kid, end, left));
      twigs.push({ curve: twig, kid, t, isDir, end, angle: kidAngle, flip: kidFlip, left, pts: twigPts });
      side = -side;
    });
    return { mainPts, curve, tEnd, twigs, pts: samples, rects, angle, L, d };
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
        for (const len of [1, 1.2, 0.85, 0.7, 1.4, 0.55])
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

    // The By us layout leaves out what isn't by us, so the items that are sit closer to the base: the same branch, just shorter.
    const liveUs = kids.filter((k) => !k.usHidden);
    const full = slots(folder, kids), tight = slots(folder, liveUs);
    const squeeze = tight.len / full.len;
    let seen = -1;
    const tcs = twigs.map((tw) => {
      if (!tw.kid.usHidden) seen++;
      if (!liveUs.length) return tw.t;
      return squeeze * (seen >= 0 ? tight.ts[seen] : tight.t0); // an item that isn't by us waits where the one before it sits
    });

    const dots: Dots = [];
    const r0 = isRoot ? 7 : Math.max(2.4, 4.6 - folder.depth * 0.5);
    const P = folder.anchor;
    const thick = isRoot ? 4 : 1; // the main branch is four times as thick as the rest
    stroke(dots, curve, rng, { r0: r0 * thick, r1: 0.8 * thick, b0: 0, b1: 0.78, leafy: 1, tMax: lay.tEnd });
    if (!isRoot) clump(dots, rng, P.x, P.y + 3, 9, 0.02); // moss where the branch leaves the folder

    twigs.forEach((tw, i) => {
      const b0 = tw.t * 0.78;
      stroke(dots, tw.curve, rng, tw.isDir
        ? { r0: Math.max(1.8, r0 * 0.55), r1: 1.6, b0, b1: b0 + 0.12, leafy: 1.5, kid: i }
        : { r0: 1.7, r1: 0.9, b0, b1: b0 + 0.1, kid: i });
      tw.kid.anchor = tw.end;
      tw.kid.birth = b0 + 0.1;
      tw.kid.angle = tw.angle;
      tw.kid.flip = tw.flip;
      tw.kid.left = tw.left;
      tw.kid.idx = i;
      tw.kid.tc = tcs[i];
      tw.kid.twig = tw.curve;
      tw.kid.glow = 0;
      tw.kid.t = tw.t;
      tw.kid.showP = isRevealed(folder, tw.kid) ? 1 : 0;
      tw.kid.doneP = isTouched(tw.kid) ? 1 : 0;
    });

    // pack attributes
    const count = dots.length / 7;
    const pos = new Float32Array(count * 3), birth = new Float32Array(count), size = new Float32Array(count), color = new Float32Array(count * 3);
    const kidOf = new Float32Array(count), along = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const j = i * 7;
      kidOf[i] = dots[j + 5];
      along[i] = dots[j + 6];
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
    geo.setAttribute('aKid', new THREE.BufferAttribute(kidOf, 1));
    geo.setAttribute('aPos', new THREE.BufferAttribute(along, 1));
    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uGrow: { value: 0 }, uScale, uTrunk: { value: trunkTarget(folder) }, uCut: { value: Math.min(cutTarget(folder), tipOf(folder, viewState.p)) },
        uShow: { value: Array.from({ length: MAXK }, (_, i) => kids[i]?.showP ?? 0) },
        uDone: { value: Array.from({ length: MAXK }, (_, i) => kids[i]?.doneP ?? 0) },
        uKS: { value: Array.from({ length: MAXK }, () => new THREE.Vector2()) },
        uKB: { value: Array.from({ length: MAXK }, () => new THREE.Vector2()) },
        uKA: { value: Array.from({ length: MAXK }, () => new THREE.Vector2(1, 0)) },
        uBS: { value: Array.from({ length: MAXK }, () => 0) },
      },
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

    return { folder, points, mat, p: 0, target: 1, trunkP: trunkTarget(folder), cutP: cutTarget(folder), curve, tEnd: lay.tEnd, glow: 0, len: curve.getLength() * lay.tEnd, end: curve.getPointAt(lay.tEnd), pts: lay.pts, rects: lay.rects };
  }

  function makeLabel(node: TreeNode) {
    const el = document.createElement('div');
    el.className = node.left ? 'item left' : 'item';
    el.innerHTML = (node.type === 'folder' ? ICONS.folder : node.logo ? LINK_ICONS.site : node.url ? linkIcon(node.url) : ICONS.file) + `<span>${esc(node.name)}</span>`;
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      if (node.type === 'folder') toggleFolder(node);
      else openFile(node);
    });
    return el;
  }

  // ---------------------------------------------------------------- progress (kept in this browser)

  // "opened" unlocks more items; "done" (watched / read) turns the branch green
  const progress = { opened: new Set<string>(), done: new Set<string>() };
  try {
    const saved = JSON.parse(localStorage.getItem(STORE_KEY) ?? '{}');
    progress.opened = new Set(saved.opened ?? []);
    progress.done = new Set(saved.done ?? []);
  } catch { /* private mode or bad data: start fresh */ }
  const save = () => {
    try { localStorage.setItem(STORE_KEY, JSON.stringify({ opened: [...progress.opened], done: [...progress.done] })); } catch { /* ignore */ }
  };
  const markOpened = (n: TreeNode) => { if (!progress.opened.has(pathOf(n))) { progress.opened.add(pathOf(n)); save(); } };
  const markDone = (n: TreeNode) => { if (!progress.done.has(pathOf(n))) { progress.done.add(pathOf(n)); save(); syncDoneButton(); } };
  const unmarkDone = (n: TreeNode) => { if (progress.done.delete(pathOf(n))) { save(); syncDoneButton(); } };
  // The tree is coloured from `viewDone`. While a preview is open it stays a frozen copy, so the colouring
  // only plays once the card is closed; otherwise it is the live set.
  let viewDone = progress.done;
  const isRead = (n: TreeNode) => progress.done.has(pathOf(n));
  /** A file is done once it was watched / read; a folder is done once everything in it is. */
  const live = (folder: TreeNode) => folder.children.filter((c) => !c.hidden); // the items the current view shows
  const isDone = (n: TreeNode): boolean => (n.type === 'folder' ? live(n).length > 0 && live(n).every(isDone) : viewDone.has(pathOf(n)));
  /** How many of a folder's items are visible: a first batch, then another batch for every item opened. */
  const revealedCount = (folder: TreeNode) =>
    Math.min(live(folder).length, REVEAL_STEP * (1 + live(folder).filter((c) => progress.opened.has(pathOf(c))).length));
  /** Is this item unlocked in the current view? Reach practice also keeps whatever By us would have unlocked, so nothing disappears when you switch. */
  const isRevealed = (folder: TreeNode, kid: TreeNode) => {
    if (kid.hidden) return false;
    if (live(folder).indexOf(kid) < revealedCount(folder)) return true;
    const mine = folder.children.filter((c) => !c.usHidden);
    return !kid.usHidden && mine.indexOf(kid) < Math.min(mine.length, REVEAL_STEP * (1 + mine.filter((c) => progress.opened.has(pathOf(c))).length));
  };
  /** Has anything at or below this node been finished? Colour flows down to it from the start of the tree. */
  const isTouched = (n: TreeNode): boolean => (n.type === 'folder' ? live(n).some(isTouched) : viewDone.has(pathOf(n)));
  /** How far the colour should reach along a folder's own branch: to its furthest touched item, or all the way when everything is done.
   *  It only starts once the colour has reached the folder itself along its parent's branch. */
  const trunkTarget = (folder: TreeNode) => {
    if (folder.parent && folder.doneP < 1) return 0;
    const kids = live(folder);
    // a twig that is still shrinking keeps the branch under it coloured, so the colour retracts as a relay:
    // the twig first, then the branch, then the twig into this folder, and so on back to the start
    const shrinking = (c: TreeNode) => !isTouched(c) && c.doneP > 0.001;
    if (kids.length && (kids.every(isDone) || (kids.some(shrinking) && kids.every((c) => isDone(c) || shrinking(c))))) return 1;
    return Math.max(0, ...kids.filter((c) => isTouched(c) || shrinking(c)).map((c) => Math.min(1, teOf(c, viewState.p) + 0.03)));
  };
  /** The main branch is drawn only as far as the last unlocked item, so it never leads on towards something hidden. */
  const cutTarget = (folder: TreeNode) => {
    const shown = folder.children.filter((c) => isRevealed(folder, c));
    if (!shown.length) return 0;
    if (shown.length === folder.children.length) return 1;
    return Math.min(1, Math.max(...shown.map((c) => c.t)) + 0.015); // stops at the last unlocked item
  };
  /** Where an item's twig leaves the main branch: further in for By us (p = 0), its full-layout place for Reach practice (p = 1). */
  const teOf = (n: TreeNode, p: number) => (n.usHidden ? n.t : lerp(n.tc, n.t, clamp(p / MAIN_END, 0, 1))); // an item only Reach practice shows never moves: it sprouts where it belongs as the branch grows past
  /** Where the end of the drawn main branch is in By us (A) and in the full layout (B), given what is unlocked. It grows from A to B as the view switches. */
  function tipEnds(folder: TreeNode) {
    const shown = folder.children.filter((c) => isRevealed(folder, c));
    if (!shown.length) return null;
    return { shown, a: Math.min(1, Math.max(...shown.map((c) => c.tc)) + 0.015), b: Math.min(1, Math.max(...shown.map((c) => c.t)) + 0.015) };
  }
  /** How much of the main branch is drawn at view position `p`: only as far as the last unlocked item, which sits further in for By us. */
  function tipOf(folder: TreeNode, p: number) {
    const e = tipEnds(folder);
    if (!e) return 0;
    if (p >= 1 && e.shown.length === folder.children.length) return 1;
    return lerp(e.a, e.b, clamp(p / MAIN_END, 0, 1));
  }
  // Eased tween: moves o[key] to `target` over (distance x secsPerUnit) seconds, starting and stopping gently.
  const tweens = new WeakMap<object, Record<string, { from: number; to: number; t: number; dur: number }>>();
  function tween(o: Record<string, any>, key: string, target: number, secsPerUnit: number, dt: number): number { // eslint-disable-line @typescript-eslint/no-explicit-any
    if (REDUCED) return target;
    const all = tweens.get(o) ?? tweens.set(o, {}).get(o)!;
    let tw = all[key];
    if (!tw || tw.to !== target) {
      const from = o[key];
      if (from === target) return target;
      tw = all[key] = { from, to: target, t: 0, dur: Math.max(0.25, Math.abs(target - from) * secsPerUnit) };
    }
    tw.t += dt;
    return tw.from + (tw.to - tw.from) * ease(tw.t / tw.dur);
  }

  // ---------------------------------------------------------------- state

  const branches = new Set<Branch>();

  /** How an item's twig is carried along its parent's branch at view position `p` (0 = By us, 1 = full layout). */
  const slideAt = (n: TreeNode, p: number): Slide => {
    const cv = n.parent!.branch!.curve;
    const t0 = clamp(n.t, 0, 1), t1 = clamp(teOf(n, p), 0, 1);
    const b = cv.getPointAt(t0);
    if (t1 === t0) return { b, c: b, r: 0 };
    const angle = (t: number) => { const T = cv.getTangentAt(t); return Math.atan2(T.y, T.x); };
    const r = angle(t1) - angle(t0);
    return { b, c: cv.getPointAt(t1), r: Math.atan2(Math.sin(r), Math.cos(r)) }; // turns with the bend of the branch, so it never ends up lying across it
  };
  /** Where a node's branch sits relative to the full layout at view position `p`. */
  function xfAt(n: TreeNode, p: number): Xf {
    if (!n.parent) return { x: 0, y: 0, r: 0 };
    const up = xfAt(n.parent, p);
    return n.parent.branch ? xfMul(up, slideXf(slideAt(n, p))) : up;
  }
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
    if (!folder.open) {
      open(folder);
      markOpened(folder);
    }
    setActive(folder);
  }

  function setActive(folder: TreeNode, frame = true) {
    active = folder;
    const names = pathOf(folder).split('/');
    names[0] = rootLabel;
    root.querySelector<HTMLElement>('#ft-title')!.innerHTML = `<span class="up">${names.slice(0, -1).map((x) => x + ' /').join(' ')} </span><b>${names.at(-1)}</b>`; // on a phone only the current folder fits beside the switch
    root.querySelector<HTMLButtonElement>('#ft-back')!.disabled = !folder.parent;
    if (folder !== TREE) root.querySelector<HTMLElement>('#ft-hint')!.classList.add('gone');
    if (frame) focus(folder);
  }

  function focus(folder: TreeNode) {
    // Work in screen pixels where it matters: the floating bars and finger-sized margins don't shrink when we zoom out.
    const small = W < 640;
    const padX = small ? (folder.parent ? 14 : 22) : 40;
    const padTop = (small ? 64 : 72) + 22; // crumbs + view switch float over the top; 22 = half an icon
    const padBottom = (small ? 44 : 48) + 22;
    const overview = small && !folder.parent; // the opening view on a phone: just the phases and their names across the screen, with a small gap at the sides
    const k = viewTarget; // frame where things are heading, not where they are now
    const live_ = live(folder);
    const labelW = (n: TreeNode) => clamp(n.el?.offsetWidth || 130, 80, 280); // the real name width, once it's on screen
    // each point is an anchor plus how far its name runs to the side, in label pixels
    const pts: { p: THREE.Vector2; w: number; left: boolean }[] = live_.map((c) => ({ p: xfApply(xfAt(c, k), c.anchor), w: labelW(c), left: !!c.left }));
    if (k === 1 && !overview) pts.push({ p: xfApply(xfAt(folder, k), folder.branch!.end), w: 0, left: false });
    if (folder.parent) pts.push({ p: xfApply(xfAt(folder, k), folder.anchor), w: labelW(folder), left: !!folder.left });
    const availW = Math.max(1, W - padX * 2), availH = Math.max(1, H - padTop - padBottom);
    const minZoom = overview ? 0.2 : small ? 0.5 : 0.45;
    let zoom = 1, x0 = 0, x1 = 0, y0 = 0, y1 = 0;
    for (let pass = 0; pass < 2; pass++) { // names scale with the zoom below 0.6, so settle the zoom in two passes
      const grow = pass ? Math.max(1, 0.6 / zoom) : 1;
      x0 = y0 = Infinity; x1 = y1 = -Infinity;
      for (const { p, w, left } of pts) {
        const reach = w ? 20 + w * grow : 20;
        x0 = Math.min(x0, p.x - (left ? reach : 20)); x1 = Math.max(x1, p.x + (left ? 20 : reach));
        y0 = Math.min(y0, p.y); y1 = Math.max(y1, p.y);
      }
      zoom = clamp(Math.min(availW / Math.max(1, x1 - x0), availH / Math.max(1, y1 - y0)), minZoom, 1.2);
    }
    // if it doesn't fit sideways, line the left edge up with the left margin and let the rest run off the right
    const fitsX = (x1 - x0) * zoom <= availW;
    cam.tx = fitsX ? (x0 + x1) / 2 : x0 + (W / 2 - padX) / zoom;
    cam.ty = (y0 + y1) / 2 + (padTop - padBottom) / 2 / zoom; // centre in the space between the floating bars
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
  const qlBody = root.querySelector<HTMLElement>('#ft-ql-body')!;

  // What counts as "watched": a YouTube video plays to the end (or 80% of it, at most 5 minutes of watching);
  // anything else just has to stay open for a few seconds. Both are tracked here and stopped when the preview closes.
  let stopTracking = () => {};
  // the "Mark as complete" tick in the preview card: also reflects it when watching / reading finishes by itself
  let qlNode: TreeNode | null = null;
  function syncDoneButton() {
    const btn = qlBody.querySelector<HTMLElement>('.ql-done');
    if (!btn || !qlNode) return;
    const done = isRead(qlNode);
    btn.classList.toggle('on', done);
    btn.setAttribute('aria-pressed', String(done));
    btn.querySelector('span')!.textContent = done ? 'Completed' : 'Mark as complete';
  }
  type YTPlayer = { getDuration(): number; destroy(): void };
  type YTApi = { Player: new (el: HTMLElement, opts: { events: { onStateChange(e: { data: number }): void } }) => YTPlayer };
  let ytApi: Promise<YTApi> | null = null;
  const loadYT = () => (ytApi ??= new Promise<YTApi>((resolve) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any;
    if (w.YT?.Player) return resolve(w.YT);
    const prev = w.onYouTubeIframeAPIReady;
    w.onYouTubeIframeAPIReady = () => { prev?.(); resolve(w.YT); };
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(tag);
  }));
  function trackReading(node: TreeNode) {
    const timer = setTimeout(() => markDone(node), READ_MS);
    stopTracking = () => clearTimeout(timer);
  }
  function trackVideo(node: TreeNode, iframe: HTMLElement) {
    let player: YTPlayer | undefined, tick = 0, watched = 0, dead = false;
    stopTracking = () => { dead = true; clearInterval(tick); player?.destroy(); };
    loadYT().then((YT) => {
      if (dead) return;
      player = new YT.Player(iframe, {
        events: {
          onStateChange: ({ data }) => {
            clearInterval(tick);
            if (data === 0) markDone(node); // ended
            if (data === 1) {
              tick = window.setInterval(() => {
                watched++;
                const need = Math.min((player?.getDuration() || 60) * 0.8, 300);
                if (watched >= need) { markDone(node); clearInterval(tick); }
              }, 1000);
            }
          },
        },
      });
    });
  }

  // YouTube previews start as a thumbnail with a play button; the heavy player only loads on tap.
  function openFile(node: TreeNode) {
    markOpened(node);
    if (node.newTab && node.url) {
      markDone(node); // they leave to read it, so it counts straight away
      window.open(node.url, '_blank', 'noopener,noreferrer');
      return;
    }
    stopTracking();
    root.querySelectorAll('.item.picked').forEach((e) => e.classList.remove('picked'));
    node.el.classList.add('picked');
    const where = pathOf(node.parent!).replaceAll('/', ' › ');
    let body = `<p>${esc(node.text ?? '')}</p>`;
    let frame: (autoplay: boolean) => string = () => '';
    let wide = false;
    let thumb: string | undefined;
    if (node.url) {
      const e = embedOf(node.url);
      const { src, ratio } = e;
      thumb = e.thumb;
      wide = ratio === '16 / 9';
      // YouTube also gets its player API switched on, so we can tell when it has been watched
      frame = (autoplay) => {
        const query = [...(autoplay ? ['autoplay=1'] : []), ...(thumb !== undefined ? ['enablejsapi=1', `origin=${encodeURIComponent(location.origin)}`] : [])].join('&');
        return `<iframe class="ql-embed" style="aspect-ratio:${ratio}" src="${esc(query ? src + (src.includes('?') ? '&' : '?') + query : src)}" title="${esc(node.name)}" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>`;
      };
      body += thumb !== undefined
        ? `<button class="ql-play" style="aspect-ratio:${ratio}${thumb ? `;background-image:url(${esc(thumb)})` : ''}" aria-label="Play ${esc(node.name)}"><span></span></button>`
        : frame(false);
      body += `<p><a class="ql-link" href="${esc(node.url)}" target="_blank" rel="noopener noreferrer">Open in a new tab ↗</a></p>`;
    }
    qlNode = node;
    viewDone = new Set(progress.done); // hold the colouring until the card closes
    qlBody.innerHTML = body + `<button class="ql-done" aria-pressed="false"><i></i><span></span></button><div class="meta">${esc(where)}</div>`;
    syncDoneButton();
    qlBody.querySelector('.ql-done')!.addEventListener('click', () => {
      if (isRead(node)) unmarkDone(node);
      else markDone(node);
    });
    // show the quick small thumbnail now, then swap in the HD one once it has loaded (not every video has one)
    const play = qlBody.querySelector<HTMLElement>('.ql-play');
    const hd = new Image();
    hd.onload = () => { if (play?.isConnected && hd.naturalWidth > 480) play.style.backgroundImage = `url(${hd.src})`; };
    if (play && thumb) hd.src = thumb.replace('hqdefault', 'maxresdefault');
    qlBody.querySelector('.ql-play')?.addEventListener('click', (e) => {
      (e.currentTarget as HTMLElement).outerHTML = frame(true);
      if (!isRead(node)) trackVideo(node, qlBody.querySelector<HTMLElement>('iframe.ql-embed')!);
    });
    // a video is watched, anything else is read (a YouTube preview waits for the play button)
    if (!isRead(node) && thumb === undefined) trackReading(node);
    root.querySelector<HTMLElement>('#ft-ql-icon')!.innerHTML = ICONS.file;
    root.querySelector<HTMLElement>('#ft-ql-name')!.textContent = node.name;
    ql.classList.toggle('wide', wide);
    ql.classList.add('on');
  }
  const closeQl = () => {
    ql.classList.remove('on');
    stopTracking();
    qlNode = null;
    viewDone = progress.done; // now let the tree catch up with anything finished meanwhile
    qlBody.replaceChildren(); // stops any playing video
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
  const pointers = new Map<number, { x: number; y: number }>();
  let start: { x: number; y: number } | null = null; // where a one-finger touch began
  let dragging = false; // a tap that wobbles a few pixels is still a tap, so it shouldn't cancel the framing
  const TAP_SLOP = 6;
  /** Middle of the fingers (relative to the viewport centre, y down) and how far apart they are. */
  const gesture = () => {
    const r = viewport.getBoundingClientRect();
    const ps = [...pointers.values()];
    const mx = ps.reduce((t, q) => t + q.x, 0) / ps.length - r.left - W / 2;
    const my = ps.reduce((t, q) => t + q.y, 0) / ps.length - r.top - H / 2;
    return { mx, my, d: ps.length > 1 ? Math.hypot(ps[0].x - ps[1].x, ps[0].y - ps[1].y) : 0 };
  };
  viewport.addEventListener('pointerdown', (e) => {
    if ((e.target as Element).closest('.item, .ql')) return;
    viewport.setPointerCapture(e.pointerId);
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    start = pointers.size === 1 ? { x: e.clientX, y: e.clientY } : null;
    dragging = pointers.size > 1;
    viewport.classList.add('dragging');
  }, { signal });
  viewport.addEventListener('pointermove', (e) => {
    if (!pointers.has(e.pointerId)) return;
    if (!dragging) {
      if (Math.hypot(e.clientX - start!.x, e.clientY - start!.y) < TAP_SLOP) return;
      dragging = true;
    }
    const before = gesture();
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const after = gesture();
    manual = true;
    // keep the spot under the fingers' midpoint under the fingers: this pans and zooms around the pinch together
    const wx = cam.x + before.mx / cam.zoom, wy = cam.y - before.my / cam.zoom;
    if (pointers.size >= 2 && before.d > 0) cam.zoom = cam.tzoom = clamp(cam.zoom * after.d / before.d, 0.3, 3);
    cam.x = cam.tx = wx - after.mx / cam.zoom;
    cam.y = cam.ty = wy + after.my / cam.zoom;
  }, { signal });
  const release = (e: PointerEvent) => {
    pointers.delete(e.pointerId);
    if (pointers.size === 1) { start = null; dragging = true; } // lifting one finger of a pinch carries on as a pan
    if (!pointers.size) { dragging = false; viewport.classList.remove('dragging'); }
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

    glowN = 0;
    viewState.p = tween(viewState, 'p', viewTarget, SWITCH_S, dt);
    quiet = Math.max(0, quiet - dt);
    for (const b of branches) {
      const fx = b.folder.xf;
      b.points.position.set(fx.x, fx.y, 0);
      b.points.rotation.z = fx.r;
      const dir = Math.sign(b.target - b.p);
      if (dir) b.p = clamp(b.p + dir * dt / (dir > 0 ? GROW_S : SHRINK_S), 0, 1);
      const g = ease(b.p);
      b.mat.uniforms.uGrow.value = g;
      // unlock items, and grow the colour along the branch (the main branch first, then each twig leading to something finished)
      const trunkWas = b.trunkP;
      if (viewState.p !== viewTarget) {
        // the switch is growing or shrinking the branch: the colour and its glow ride along with it instead of easing on their own clock
        b.trunkP = trunkTarget(b.folder);
        const tw = tweens.get(b);
        if (tw) delete tw.trunkP; // so the normal easing starts fresh afterwards
      } else b.trunkP = tween(b as unknown as Record<string, number>, 'trunkP', trunkTarget(b.folder), clamp(b.len / TRUNK_PX_S, 1.2, 4), dt);
      b.glow = glowTo(b.glow, !REDUCED && quiet <= 0 && Math.abs(b.trunkP - trunkWas) > 1e-5, dt);
      addGlow(b.curve, edgeOf(b.trunkP, b.tEnd), edgeOf(trunkTarget(b.folder), b.tEnd), b.glow * g, 34, (t) => xfApply(fx, b.curve.getPointAt(t)));
      b.mat.uniforms.uTrunk.value = b.trunkP;
      if (viewState.p !== viewTarget) {
        b.cutP = cutTarget(b.folder); // the switch sets the pace of the growth, so this must not lag behind it
        const tw = tweens.get(b);
        if (tw) delete tw.cutP;
      } else b.cutP = tween(b as unknown as Record<string, number>, 'cutP', cutTarget(b.folder), clamp(b.len / TRUNK_PX_S, 1.2, 4), dt);
      const cut = Math.min(b.cutP, tipOf(b.folder, viewState.p)); // the branch grows out to the last unlocked item
      b.mat.uniforms.uCut.value = cut;
      for (const kid of b.folder.children) {
        kid.sl = slideAt(kid, viewState.p);
        kid.xf = xfMul(fx, slideXf(kid.sl));
        b.mat.uniforms.uKS.value[kid.idx].copy(kid.sl.c);
        b.mat.uniforms.uKB.value[kid.idx].copy(kid.sl.b);
        b.mat.uniforms.uKA.value[kid.idx].set(Math.cos(kid.sl.r), Math.sin(kid.sl.r));
        b.mat.uniforms.uBS.value[kid.idx] = 0.78 * (kid.t - teOf(kid, viewState.p));
        // a newly unlocked item: the branch reaches it first, then its twig grows out
        if (viewState.p !== viewTarget && kid.usHidden) {
          // an item only Reach practice shows runs on the switch clock: its twig grows once the main branch has finished extending, and shrinks before the main branch retracts
          const grown = clamp((viewState.p - MAIN_END) / (TWIG_END - MAIN_END), 0, 1);
          kid.showP = viewTarget ? (isRevealed(b.folder, kid) ? grown : 0) : Math.min(kid.showP, grown);
          const tw = tweens.get(kid);
          if (tw) delete tw.showP;
        } else kid.showP = tween(kid, 'showP', isRevealed(b.folder, kid) && cut >= teOf(kid, viewState.p) ? 1 : 0, SHOW_S, dt);
        // a folder's twig keeps its colour until the branch beyond it has shrunk back to nothing
        const holding = !isTouched(kid) && (kid.branch?.trunkP ?? 0) > 0.001;
        const doneWas = kid.doneP;
        const doneGoal = (isTouched(kid) && b.trunkP >= teOf(kid, viewState.p)) || holding ? 1 : 0;
        kid.doneP = tween(kid, 'doneP', doneGoal, TWIG_S, dt);
        kid.glow = glowTo(kid.glow, !REDUCED && quiet <= 0 && Math.abs(kid.doneP - doneWas) > 1e-5, dt);
        addGlow(kid.twig, edgeOf(kid.doneP), edgeOf(doneGoal), kid.glow * g, 24, (t) => xfApply(kid.xf, kid.twig.getPointAt(t)));
        b.mat.uniforms.uShow.value[kid.idx] = kid.showP;
        b.mat.uniforms.uDone.value[kid.idx] = kid.doneP;
      }
      for (const kid of b.folder.children) {
        const [x, y] = project(xfApply(kid.xf, kid.anchor));
        // labels follow the zoom, like the branches (but never unreadably small, and not huge when zoomed in)
        const k = clamp(cam.zoom, 0.6, 2);
        kid.el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) scale(${k.toFixed(3)}) translate(${kid.left ? 'calc(-100% + 20px)' : '-20px'}, -21px)`;
        // a name appears after its twig has grown in, and goes before the twig starts to shrink; a twig that sits closer to the base than usual is born earlier
        const named = kid.usHidden ? kid.showP > 0.999 && viewState.p >= LABEL_AT : kid.showP > 0.9;
        kid.el.classList.toggle('shown', b.target > 0 && g >= kid.birth - 0.78 * (kid.t - teOf(kid, viewState.p)) && named);
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

    glowGeo.setDrawRange(0, glowN);
    glowGeo.attributes.position.needsUpdate = true;
    glowGeo.attributes.aAlpha.needsUpdate = true;
    glowGeo.attributes.aSize.needsUpdate = true;
    renderer.render(scene, camera);
    raf = requestAnimationFrame(frame);
  }

  resize();
  open(TREE);
  setActive(TREE);
  cam.x = cam.tx; cam.y = cam.ty; cam.zoom = cam.tzoom;
  raf = requestAnimationFrame(frame);

  /** Switches views without rebuilding anything: items hidden by the new view shrink back, newly allowed ones grow out of their branch. */
  function setView(next: PathView, nextLabel: string) {
    rootLabel = nextLabel;
    applyView(next);
    viewTarget = next === 'reach' ? 1 : 0;
    quiet = 4;
    const closeHidden = (f: TreeNode) => f.children.forEach((c) => c.type === 'folder' && (c.hidden ? close(c) : closeHidden(c)));
    closeHidden(TREE);
    let a = active;
    while (a.hidden && a.parent) a = a.parent;
    setActive(a); // reframe for where the branch is heading, so it zooms out as the branch grows (and back in as it shrinks)
  }

  const destroy = () => {
    cancelAnimationFrame(raf);
    stopTracking();
    resizeObserver.disconnect();
    ac.abort();
    for (const b of branches) {
      b.points.geometry.dispose();
      b.mat.dispose();
    }
    glowGeo.dispose();
    glowMat.dispose();
    renderer.dispose();
    renderer.domElement.remove();
    labels.replaceChildren();
    qlBody.replaceChildren();
    ql.classList.remove('on');
    root.querySelector<HTMLElement>('#ft-hint')!.classList.remove('gone');
  };
  return { destroy, setView };

}
