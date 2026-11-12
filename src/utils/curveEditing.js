// curveEditing.js — custom curve (CURVE layer) ke pure helpers. Sab coordinates normalised 0..1.
// Point: { x, y, cx1?, cy1? (aane wala handle), cx2?, cy2? (jaane wala handle) }. Handle nahi = seedhi line.
import { THEME_CURVE_FILL_TO, THEME_LAYER_LIMITS } from '../constants/themeBuilder.js';

const LIMITS = THEME_LAYER_LIMITS;
const round4 = (v) => Math.round(v * 10000) / 10000;
const clampPos = (v) => round4(Math.min(LIMITS.POSITION_MAX, Math.max(LIMITS.POSITION_MIN, v)));

const hasIn = (p) => typeof p.cx1 === 'number' && typeof p.cy1 === 'number';
const hasOut = (p) => typeof p.cx2 === 'number' && typeof p.cy2 === 'number';

/** Point ke handles hata do (seedhi lines) */
export const withoutHandles = ({ x, y }) => ({ x, y });

/** Point + uske handles ek saath khiskao */
export const movePoint = (point, x, y) => {
  const dx = clampPos(x) - point.x;
  const dy = clampPos(y) - point.y;
  const next = { ...point, x: clampPos(x), y: clampPos(y) };
  if (hasIn(point)) Object.assign(next, { cx1: clampPos(point.cx1 + dx), cy1: clampPos(point.cy1 + dy) });
  if (hasOut(point)) Object.assign(next, { cx2: clampPos(point.cx2 + dx), cy2: clampPos(point.cy2 + dy) });
  return next;
};

/**
 * Ek handle khiskao. mirror = true → dusra handle ulti taraf (smooth point), sirf agar wo pehle se ho.
 * @param {'in'|'out'} which
 */
export const moveHandle = (point, which, x, y, mirror = true) => {
  const next = { ...point };
  if (which === 'in') Object.assign(next, { cx1: clampPos(x), cy1: clampPos(y) });
  else Object.assign(next, { cx2: clampPos(x), cy2: clampPos(y) });
  if (mirror) {
    const ox = 2 * point.x - x;
    const oy = 2 * point.y - y;
    if (which === 'in' && hasOut(point)) Object.assign(next, { cx2: clampPos(ox), cy2: clampPos(oy) });
    if (which === 'out' && hasIn(point)) Object.assign(next, { cx1: clampPos(ox), cy1: clampPos(oy) });
  }
  return next;
};

// Segment a → b ke 4 bezier control points
const segmentControls = (a, b) => [
  [a.x, a.y],
  hasOut(a) ? [a.cx2, a.cy2] : [a.x, a.y],
  hasIn(b) ? [b.cx1, b.cy1] : [b.x, b.y],
  [b.x, b.y],
];

const lerp = (p, q, t) => [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t];

const bezierAt = ([p0, p1, p2, p3], t) => {
  const a = lerp(p0, p1, t);
  const b = lerp(p1, p2, t);
  const c = lerp(p2, p3, t);
  return lerp(lerp(a, b, t), lerp(b, c, t), t);
};

/**
 * Line par sabse paas wali jagah: { index (segment ke baad wala point index), t, distance }
 * @param {object[]} points
 * @param {boolean} closed
 * @param {{ x: number, y: number }} at
 * @param {number} [aspect] - height / width (distance card jaisi dikhe)
 */
export const nearestOnCurve = (points, closed, at, aspect = 1) => {
  let best = null;
  const count = closed ? points.length : points.length - 1;
  for (let i = 0; i < count; i += 1) {
    const controls = segmentControls(points[i], points[(i + 1) % points.length]);
    for (let s = 0; s <= 40; s += 1) {
      const t = s / 40;
      const [x, y] = bezierAt(controls, t);
      const d = Math.hypot(x - at.x, (y - at.y) * aspect);
      if (!best || d < best.distance) best = { segment: i, t, distance: d };
    }
  }
  return best;
};

/**
 * Segment ko t par baanto (de Casteljau) — curve ki shakl bilkul waisi rehti hai, beech mein naya point.
 * @returns {{ points: object[], index: number }} naya array + naye point ka index
 */
export const insertPointOnCurve = (points, closed, segment, t) => {
  if (points.length >= LIMITS.MAX_CURVE_POINTS) return { points, index: -1 };
  const a = points[segment];
  const bIndex = (segment + 1) % points.length;
  const b = points[bIndex];
  const straight = !hasOut(a) && !hasIn(b);
  const [p0, p1, p2, p3] = segmentControls(a, b);
  const q0 = lerp(p0, p1, t);
  const q1 = lerp(p1, p2, t);
  const q2 = lerp(p2, p3, t);
  const r0 = lerp(q0, q1, t);
  const r1 = lerp(q1, q2, t);
  const m = lerp(r0, r1, t);

  const next = points.slice();
  const mid = straight
    ? { x: round4(m[0]), y: round4(m[1]) }
    : { x: round4(m[0]), y: round4(m[1]), cx1: round4(r0[0]), cy1: round4(r0[1]), cx2: round4(r1[0]), cy2: round4(r1[1]) };
  if (!straight) {
    next[segment] = { ...a, cx2: round4(q0[0]), cy2: round4(q0[1]) };
    next[bIndex] = { ...b, cx1: round4(q2[0]), cy1: round4(q2[1]) };
  }
  next.splice(segment + 1, 0, mid);
  return { points: next, index: segment + 1 };
};

/** Point hatao (kam se kam 2 rehte hain) */
export const removePoint = (points, index) =>
  points.length <= LIMITS.MIN_CURVE_POINTS ? points : points.filter((_, i) => i !== index);

/** Sab points smooth (Catmull-Rom se handles) */
export const smoothAll = (points, closed) => {
  const n = points.length;
  if (n < 2) return points;
  const at = (i) => {
    if (closed) return points[(i + n) % n];
    return points[Math.min(n - 1, Math.max(0, i))];
  };
  return points.map((p, i) => {
    const prev = at(i - 1);
    const next = at(i + 1);
    const tx = (next.x - prev.x) / 6;
    const ty = (next.y - prev.y) / 6;
    const point = { x: p.x, y: p.y };
    if (closed || i > 0) Object.assign(point, { cx1: clampPos(p.x - tx), cy1: clampPos(p.y - ty) });
    if (closed || i < n - 1) Object.assign(point, { cx2: clampPos(p.x + tx), cy2: clampPos(p.y + ty) });
    return point;
  });
};

/** Left ↔ right ulta (x → 1 − x) */
export const mirrorHorizontally = (points) =>
  points.map((p) => {
    const next = { ...p, x: round4(1 - p.x) };
    if (hasIn(p)) next.cx1 = round4(1 - p.cx1);
    if (hasOut(p)) next.cx2 = round4(1 - p.cx2);
    return next;
  });

/* ---------------- Curve presets (shuruaat ke liye) ---------------- */

const smooth = (pts, closed = false) => smoothAll(pts.map(([x, y]) => ({ x, y })), closed);

export const CURVE_PRESETS = Object.freeze([
  { key: 'WAVE', label: 'Wave', build: () => ({ points: smooth([[0, 0.8], [0.25, 0.74], [0.5, 0.82], [0.75, 0.76], [1, 0.8]]), closed: false, fillTo: THEME_CURVE_FILL_TO.BOTTOM }) },
  { key: 'DOUBLE_WAVE', label: 'Double wave', build: () => ({ points: smooth([[0, 0.78], [0.17, 0.72], [0.33, 0.8], [0.5, 0.72], [0.67, 0.8], [0.83, 0.72], [1, 0.78]]), closed: false, fillTo: THEME_CURVE_FILL_TO.BOTTOM }) },
  { key: 'S_CURVE', label: 'S-curve', build: () => ({ points: [{ x: 0, y: 0.86, cx2: 0.45, cy2: 0.86 }, { x: 1, y: 0.7, cx1: 0.55, cy1: 0.7 }], closed: false, fillTo: THEME_CURVE_FILL_TO.BOTTOM }) },
  { key: 'ARC', label: 'Arc', build: () => ({ points: [{ x: 0, y: 0.84, cx2: 0.25, cy2: 0.7 }, { x: 1, y: 0.84, cx1: 0.75, cy1: 0.7 }], closed: false, fillTo: THEME_CURVE_FILL_TO.BOTTOM }) },
  { key: 'SWOOSH', label: 'Swoosh', build: () => ({ points: [{ x: 0, y: 0.32, cx2: 0.2, cy2: 0.12 }, { x: 0.62, y: 0, cx1: 0.3, cy1: 0.02 }], closed: false, fillTo: THEME_CURVE_FILL_TO.TOP }) },
  { key: 'DIAGONAL', label: 'Diagonal', build: () => ({ points: [{ x: 0, y: 0.92 }, { x: 1, y: 0.72 }], closed: false, fillTo: THEME_CURVE_FILL_TO.BOTTOM }) },
  { key: 'HILL', label: 'Hill', build: () => ({ points: smooth([[0, 0.9], [0.5, 0.7], [1, 0.9]]), closed: false, fillTo: THEME_CURVE_FILL_TO.BOTTOM }) },
  { key: 'VALLEY', label: 'Valley', build: () => ({ points: smooth([[0, 0.72], [0.5, 0.9], [1, 0.72]]), closed: false, fillTo: THEME_CURVE_FILL_TO.BOTTOM }) },
]);
