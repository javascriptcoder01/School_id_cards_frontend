// renderLayers.js — colour roles + background layers → ek SVG string (pure: koi Node / browser API nahi).
// Backend (PDF raster) aur Frontend (designer + card preview) dono yahi function chalate hain → preview = print.
//
// Rules:
// - Layers array order mein draw (pehla = sabse neeche). enabled === false skip.
// - Sab coordinates normalised 0..1 → width / height se scale.
// - Har id idPrefix + layer index se (front / back / kai cards kabhi clash nahi).
// - Har number clamp + round, har colour hex check → output hamesha hamara banaya safe SVG.
// - SVG filters / blend modes nahi (printers / PDF engines inhe theek nahi chhaapte).
// - Ek layer kharab ho to sirf woh skip hoti hai; function kabhi throw nahi karta.
import {
  ARTWORK_FITS,
  COLOR_ROLE_VALUES,
  CURVE_FILL_TO,
  LAYER_LIMITS,
  LAYER_TYPES,
  PATTERN_TYPES,
  SHAPE_TYPES,
} from './constants.js';

const HEX = /^#[0-9A-Fa-f]{6}$/;
const SHORT_HEX = /^#[0-9A-Fa-f]{3}$/;

/** Roles na mile to ye (renderer kabhi khaali colour nahi chhodta) */
export const DEFAULT_ROLE_COLORS = Object.freeze({
  primary: '#1E3A8A',
  secondary: '#3B82F6',
  accent: '#F59E0B',
  surface: '#FFFFFF',
  text: '#0F172A',
  mutedText: '#475569',
  onPrimary: '#FFFFFF',
});

/* ---------------- small helpers ---------------- */

const isNum = (v) => typeof v === 'number' && Number.isFinite(v);
const num = (v, fallback = 0) => (isNum(v) ? v : fallback);
const clamp = (v, min, max, fallback = min) => Math.min(max, Math.max(min, num(v, fallback)));

/** 3 decimal tak, "-0" nahi → deterministic string */
const fmt = (n) => {
  const r = Math.round(num(n) * 1000) / 1000;
  return Object.is(r, -0) ? '0' : String(r);
};

const safeId = (value, max = 40) => String(value ?? '').replace(/[^A-Za-z0-9_-]/g, '').slice(0, max);

/**
 * '#abc' / '#AABBCC' → '#AABBCC'; galat → null
 * @param {unknown} value
 * @returns {string|null}
 */
export const normalizeHex = (value) => {
  if (typeof value !== 'string') return null;
  const v = value.trim();
  if (HEX.test(v)) return v.toUpperCase();
  if (SHORT_HEX.test(v)) return `#${v[1]}${v[1]}${v[2]}${v[2]}${v[3]}${v[3]}`.toUpperCase();
  return null;
};

/**
 * Har role ka pakka hex: roles[role] → fallback[role] → DEFAULT_ROLE_COLORS[role]
 * @param {Record<string, string|null>|null|undefined} roles
 * @param {Record<string, string|null>} [fallback]
 * @returns {Record<string, string>}
 */
export const resolveRoles = (roles, fallback = {}) =>
  Object.fromEntries(
    COLOR_ROLE_VALUES.map((role) => [
      role,
      normalizeHex(roles?.[role]) || normalizeHex(fallback?.[role]) || DEFAULT_ROLE_COLORS[role],
    ])
  );

/**
 * Layer colour { role } | { hex } (+ alpha) → { hex, alpha } ya null
 * @param {{ role?: string, hex?: string, alpha?: number }|null|undefined} color
 * @param {Record<string, string>} roles - resolveRoles ka output
 */
export const resolveLayerColor = (color, roles) => {
  if (!color || typeof color !== 'object') return null;
  const hex = color.role ? normalizeHex(roles?.[color.role]) : normalizeHex(color.hex);
  if (!hex) return null;
  return { hex, alpha: clamp(color.alpha, 0, 1, 1) };
};

// Deterministic pseudo-random (noise dots, blob) — Math.random kabhi nahi
const hashString = (value) => {
  let h = 2166136261;
  const s = String(value ?? '');
  for (let i = 0; i < s.length; i += 1) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
};
const seededRandom = (seed) => {
  let state = seed || 1;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
};

const opacityAttr = (name, value) => (value < 1 ? ` ${name}="${fmt(value)}"` : '');

/* ---------------- paints (solid / gradient) ---------------- */

const sortStops = (stops, roles) =>
  (Array.isArray(stops) ? stops : [])
    .slice(0, LAYER_LIMITS.MAX_GRADIENT_STOPS)
    .map((stop, index) => ({ index, at: clamp(stop?.at, 0, 1, 0), color: resolveLayerColor(stop?.color, roles) }))
    .filter((stop) => stop.color)
    .sort((a, b) => a.at - b.at || a.index - b.index);

const stopsXml = (stops) =>
  stops
    .map((s) => `<stop offset="${fmt(s.at)}" stop-color="${s.color.hex}" stop-opacity="${fmt(s.color.alpha)}"/>`)
    .join('');

/**
 * Linear gradient (userSpaceOnUse). angle: 0 = left → right, 90 = top → bottom.
 * box: jis area par lagta hai (us element ke apne coordinates mein)
 */
const linearGradientDef = (ctx, id, stops, angle, box) => {
  const rad = (clamp(angle, 0, 360, 0) * Math.PI) / 180;
  const cx = box.x + box.w / 2;
  const cy = box.y + box.h / 2;
  const half = (Math.abs(box.w * Math.cos(rad)) + Math.abs(box.h * Math.sin(rad))) / 2;
  const dx = Math.cos(rad) * half;
  const dy = Math.sin(rad) * half;
  ctx.defs.push(
    `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${fmt(cx - dx)}" y1="${fmt(cy - dy)}" x2="${fmt(cx + dx)}" y2="${fmt(cy + dy)}">${stopsXml(stops)}</linearGradient>`
  );
  return `url(#${id})`;
};

const radialGradientDef = (ctx, id, stops, cx, cy, r) => {
  ctx.defs.push(
    `<radialGradient id="${id}" gradientUnits="userSpaceOnUse" cx="${fmt(cx)}" cy="${fmt(cy)}" r="${fmt(r)}">${stopsXml(stops)}</radialGradient>`
  );
  return `url(#${id})`;
};

/**
 * color ya stops → fill attributes. Gradient na ban sake (1 stop) to solid.
 * @returns {string|null} ' fill="…" fill-opacity="…"' ya null (kuch draw nahi)
 */
const fillAttrs = (ctx, id, { color, stops }, box, angle = 0) => {
  const sorted = sortStops(stops, ctx.roles);
  if (sorted.length >= 2) return ` fill="${linearGradientDef(ctx, id, sorted, angle, box)}"`;
  const solid = sorted.length === 1 ? sorted[0].color : resolveLayerColor(color, ctx.roles);
  if (!solid) return null;
  return ` fill="${solid.hex}"${opacityAttr('fill-opacity', solid.alpha)}`;
};

const fullRect = (ctx, fill) => `<rect x="0" y="0" width="${fmt(ctx.W)}" height="${fmt(ctx.H)}"${fill}/>`;

/* ---------------- SOLID / LINEAR / RADIAL / MESH ---------------- */

const renderSolid = (ctx, layer) => {
  const c = resolveLayerColor(layer.color, ctx.roles);
  return c ? fullRect(ctx, ` fill="${c.hex}"${opacityAttr('fill-opacity', c.alpha)}`) : '';
};

const renderLinear = (ctx, layer, key) => {
  const stops = sortStops(layer.stops, ctx.roles);
  if (stops.length === 0) return '';
  if (stops.length === 1) return fullRect(ctx, ` fill="${stops[0].color.hex}"${opacityAttr('fill-opacity', stops[0].color.alpha)}`);
  const fill = linearGradientDef(ctx, `${key}-g`, stops, num(layer.angle, 90), { x: 0, y: 0, w: ctx.W, h: ctx.H });
  return fullRect(ctx, ` fill="${fill}"`);
};

const renderRadial = (ctx, layer, key) => {
  const stops = sortStops(layer.stops, ctx.roles);
  if (stops.length === 0) return '';
  const r = clamp(layer.radius, 0, LAYER_LIMITS.RADIUS_MAX, 0.5) * Math.max(ctx.W, ctx.H);
  if (r <= 0) return '';
  const cx = clamp(layer.center?.x, LAYER_LIMITS.POSITION_MIN, LAYER_LIMITS.POSITION_MAX, 0.5) * ctx.W;
  const cy = clamp(layer.center?.y, LAYER_LIMITS.POSITION_MIN, LAYER_LIMITS.POSITION_MAX, 0.5) * ctx.H;
  const fill = radialGradientDef(ctx, `${key}-g`, stops.length === 1 ? [stops[0], { ...stops[0], at: 1 }] : stops, cx, cy, r);
  return fullRect(ctx, ` fill="${fill}"`);
};

// Mesh: pehle point ka solid base + baaki points ke soft radial blobs (filter nahi)
const renderMesh = (ctx, layer, key) => {
  const points = (Array.isArray(layer.points) ? layer.points : [])
    .slice(0, LAYER_LIMITS.MAX_MESH_POINTS)
    .map((p) => ({ x: clamp(p?.x, 0, 1, 0.5), y: clamp(p?.y, 0, 1, 0.5), color: resolveLayerColor(p?.color, ctx.roles) }))
    .filter((p) => p.color);
  if (points.length === 0) return '';
  const softness = clamp(layer.softness, 0, 1, 0.6);
  const r = (0.35 + 0.65 * softness) * Math.max(ctx.W, ctx.H);
  const [base, ...rest] = points;
  const parts = [fullRect(ctx, ` fill="${base.color.hex}"${opacityAttr('fill-opacity', base.color.alpha)}`)];
  rest.forEach((p, i) => {
    const stops = [
      { at: 0, color: p.color },
      { at: 1, color: { hex: p.color.hex, alpha: 0 } },
    ];
    parts.push(fullRect(ctx, ` fill="${radialGradientDef(ctx, `${key}-m${i}`, stops, p.x * ctx.W, p.y * ctx.H, r)}"`));
  });
  return parts.join('');
};

/* ---------------- PATTERN ---------------- */

const patternTile = (type, s, sw, paint, rand) => {
  const stroke = `fill="none" stroke="${paint.hex}"${opacityAttr('stroke-opacity', paint.alpha)} stroke-width="${fmt(sw)}"`;
  const fill = `fill="${paint.hex}"${opacityAttr('fill-opacity', paint.alpha)}`;
  switch (type) {
    case PATTERN_TYPES.DOTS:
      return { w: s, h: s, body: `<circle cx="${fmt(s / 2)}" cy="${fmt(s / 2)}" r="${fmt(s * 0.16)}" ${fill}/>` };
    case PATTERN_TYPES.GRID:
      return { w: s, h: s, body: `<path d="M0 ${fmt(s / 2)}H${fmt(s)}M${fmt(s / 2)} 0V${fmt(s)}" ${stroke}/>` };
    case PATTERN_TYPES.DIAGONAL_LINES:
      return {
        w: s,
        h: s,
        body: `<path d="M0 ${fmt(s)}L${fmt(s)} 0M${fmt(-s / 2)} ${fmt(s / 2)}L${fmt(s / 2)} ${fmt(-s / 2)}M${fmt(s / 2)} ${fmt(s * 1.5)}L${fmt(s * 1.5)} ${fmt(s / 2)}" ${stroke}/>`,
      };
    case PATTERN_TYPES.HEXAGON: {
      const a = s / 2;
      const h = Math.sqrt(3) * a;
      return {
        w: 3 * a,
        h,
        body: `<path d="M0 ${fmt(h / 2)}L${fmt(a / 2)} 0L${fmt(1.5 * a)} 0L${fmt(2 * a)} ${fmt(h / 2)}L${fmt(1.5 * a)} ${fmt(h)}L${fmt(a / 2)} ${fmt(h)}ZM${fmt(2 * a)} ${fmt(h / 2)}L${fmt(3 * a)} ${fmt(h / 2)}" ${stroke}/>`,
      };
    }
    case PATTERN_TYPES.WAVES: {
      const h = s / 2;
      return {
        w: s,
        h,
        body: `<path d="M0 ${fmt(h / 2)}Q${fmt(s / 4)} 0 ${fmt(s / 2)} ${fmt(h / 2)}T${fmt(s)} ${fmt(h / 2)}" ${stroke}/>`,
      };
    }
    case PATTERN_TYPES.ZIGZAG: {
      const h = s / 2;
      return {
        w: s,
        h,
        body: `<path d="M0 ${fmt(h * 0.75)}L${fmt(s / 2)} ${fmt(h * 0.25)}L${fmt(s)} ${fmt(h * 0.75)}" ${stroke}/>`,
      };
    }
    case PATTERN_TYPES.CHEVRON:
      return {
        w: s,
        h: s,
        body: `<path d="M0 ${fmt(s * 0.5)}L${fmt(s / 2)} 0L${fmt(s)} ${fmt(s * 0.5)}L${fmt(s)} ${fmt(s * 0.8)}L${fmt(s / 2)} ${fmt(s * 0.3)}L0 ${fmt(s * 0.8)}Z" ${fill}/>`,
      };
    case PATTERN_TYPES.CIRCLES:
      return { w: s, h: s, body: `<circle cx="${fmt(s / 2)}" cy="${fmt(s / 2)}" r="${fmt(s * 0.32)}" ${stroke}/>` };
    case PATTERN_TYPES.TRIANGLES:
      return {
        w: s,
        h: s,
        body: `<path d="M${fmt(s / 2)} ${fmt(s * 0.2)}L${fmt(s * 0.8)} ${fmt(s * 0.75)}L${fmt(s * 0.2)} ${fmt(s * 0.75)}Z" ${fill}/>`,
      };
    case PATTERN_TYPES.NOISE_DOTS: {
      const T = s * 4;
      const dots = [];
      for (let i = 0; i < 14; i += 1) {
        dots.push(`<circle cx="${fmt(rand() * T)}" cy="${fmt(rand() * T)}" r="${fmt(s * (0.06 + rand() * 0.12))}"/>`);
      }
      return { w: T, h: T, body: `<g ${fill}>${dots.join('')}</g>` };
    }
    default:
      return null;
  }
};

const renderPattern = (ctx, layer, key) => {
  const paint = resolveLayerColor(layer.color, ctx.roles);
  if (!paint) return '';
  const short = Math.min(ctx.W, ctx.H);
  const s = clamp(layer.size, LAYER_LIMITS.PATTERN_SIZE_MIN, LAYER_LIMITS.PATTERN_SIZE_MAX, 0.05) * short;
  let sw = clamp(layer.strokeWidth, 0, LAYER_LIMITS.STROKE_WIDTH_MAX, 0.004) * short;
  if (sw <= 0) sw = s * 0.08;
  const tile = patternTile(layer.pattern, s, sw, paint, seededRandom(hashString(layer.id)));
  if (!tile) return '';

  const area = layer.area || {};
  const ax = clamp(area.x, 0, 1, 0) * ctx.W;
  const ay = clamp(area.y, 0, 1, 0) * ctx.H;
  const aw = clamp(area.w, 0, 1, 1) * ctx.W;
  const ah = clamp(area.h, 0, 1, 1) * ctx.H;
  if (aw <= 0 || ah <= 0) return '';
  const rotation = clamp(layer.rotation, 0, 360, 0);
  const id = `${key}-p`;
  // Pattern hamesha 0,0 se; area translate group se. (Skia / PDF raster pattern x/y offset par kuch nahi banata.)
  ctx.defs.push(
    `<pattern id="${id}" patternUnits="userSpaceOnUse" x="0" y="0" width="${fmt(tile.w)}" height="${fmt(tile.h)}"${rotation ? ` patternTransform="rotate(${fmt(rotation)})"` : ''}>${tile.body}</pattern>`
  );
  const rect = `<rect x="0" y="0" width="${fmt(aw)}" height="${fmt(ah)}" fill="url(#${id})"/>`;
  return ax || ay ? `<g transform="translate(${fmt(ax)} ${fmt(ay)})">${rect}</g>` : rect;
};

/* ---------------- SHAPE ---------------- */

/**
 * Sine jaisi wave: har half period ek cubic bezier (peak = A).
 * reverse: right → left (closed band ke neeche wale edge ke liye)
 */
const waveSegments = (w, y, A, frequency, { reverse = false, invert = false } = {}) => {
  const n = Math.max(1, Math.round(frequency * 2));
  const d = w / n;
  const order = Array.from({ length: n }, (_, i) => i);
  if (reverse) order.reverse();
  return order
    .map((i) => {
      const sign = (i % 2 === 0 ? -1 : 1) * (invert ? -1 : 1);
      const peak = y + (sign * A * 4) / 3;
      const x0 = i * d;
      const x1 = (i + 1) * d;
      return reverse
        ? `C${fmt(x1 - d / 3)} ${fmt(peak)} ${fmt(x0 + d / 3)} ${fmt(peak)} ${fmt(x0)} ${fmt(y)}`
        : `C${fmt(x0 + d / 3)} ${fmt(peak)} ${fmt(x1 - d / 3)} ${fmt(peak)} ${fmt(x1)} ${fmt(y)}`;
    })
    .join('');
};

// Closed smooth curve (Catmull-Rom → cubic bezier)
const smoothClosedPath = (pts) => {
  const n = pts.length;
  const p = (i) => pts[(i + n) % n];
  let d = `M${fmt(pts[0][0])} ${fmt(pts[0][1])}`;
  for (let i = 0; i < n; i += 1) {
    const p0 = p(i - 1);
    const p1 = p(i);
    const p2 = p(i + 1);
    const p3 = p(i + 2);
    d += `C${fmt(p1[0] + (p2[0] - p0[0]) / 6)} ${fmt(p1[1] + (p2[1] - p0[1]) / 6)} ${fmt(p2[0] - (p3[0] - p1[0]) / 6)} ${fmt(p2[1] - (p3[1] - p1[1]) / 6)} ${fmt(p2[0])} ${fmt(p2[1])}`;
  }
  return `${d}Z`;
};

/**
 * Shape ke paths, apne box (0..w, 0..h) ke coordinates mein.
 * @returns {{ d: string, opacity?: number }[]}
 */
const shapePaths = (shape, w, h, layer) => {
  const amp = clamp(layer.amplitude, 0, 1, 0.3);
  const freq = clamp(layer.frequency, LAYER_LIMITS.FREQUENCY_MIN, LAYER_LIMITS.FREQUENCY_MAX, 1);
  const thick = clamp(layer.thickness, 0, 1, 0.3);
  switch (shape) {
    case SHAPE_TYPES.WAVE: {
      const A = amp * h * 0.5;
      return [{ d: `M0 ${fmt(A)}${waveSegments(w, A, A, freq)}L${fmt(w)} ${fmt(h)}L0 ${fmt(h)}Z` }];
    }
    case SHAPE_TYPES.DOUBLE_WAVE: {
      const A = amp * h * 0.5;
      const y2 = A + h * 0.15;
      return [
        { d: `M0 ${fmt(A)}${waveSegments(w, A, A, freq, { invert: true })}L${fmt(w)} ${fmt(h)}L0 ${fmt(h)}Z`, opacity: 0.45 },
        { d: `M0 ${fmt(y2)}${waveSegments(w, y2, A, freq)}L${fmt(w)} ${fmt(h)}L0 ${fmt(h)}Z` },
      ];
    }
    case SHAPE_TYPES.ARC: {
      const y = amp * h;
      return [{ d: `M0 ${fmt(h)}L0 ${fmt(y)}Q${fmt(w / 2)} ${fmt(-y)} ${fmt(w)} ${fmt(y)}L${fmt(w)} ${fmt(h)}Z` }];
    }
    case SHAPE_TYPES.BLOB: {
      const N = 8;
      const pts = [];
      for (let i = 0; i < N; i += 1) {
        const angle = (i / N) * Math.PI * 2;
        const r = 1 - amp * 0.4 * (0.5 + 0.5 * Math.sin(i * 2.399 * freq + 1));
        pts.push([w / 2 + Math.cos(angle) * (w / 2) * r, h / 2 + Math.sin(angle) * (h / 2) * r]);
      }
      return [{ d: smoothClosedPath(pts) }];
    }
    case SHAPE_TYPES.DIAGONAL_BAND: {
      const t = Math.max(0.02, thick) * h;
      return [{ d: `M0 ${fmt(h - t / 2)}L${fmt(w)} ${fmt(-t / 2)}L${fmt(w)} ${fmt(t / 2)}L0 ${fmt(h + t / 2)}Z` }];
    }
    case SHAPE_TYPES.CORNER_SWOOSH:
      return [
        {
          d: `M0 0L${fmt(w)} 0C${fmt(w * 0.55)} ${fmt(h * (0.15 + amp * 0.3))} ${fmt(w * 0.35)} ${fmt(h * 0.35)} 0 ${fmt(h)}Z`,
        },
      ];
    case SHAPE_TYPES.CIRCLE: {
      const rx = w / 2;
      const ry = h / 2;
      return [
        { d: `M0 ${fmt(ry)}A${fmt(rx)} ${fmt(ry)} 0 1 0 ${fmt(w)} ${fmt(ry)}A${fmt(rx)} ${fmt(ry)} 0 1 0 0 ${fmt(ry)}Z` },
      ];
    }
    case SHAPE_TYPES.RIBBON: {
      const t = Math.max(0.05, thick) * h;
      const yTop = (h - t) / 2;
      const A = amp * h * 0.25;
      return [
        {
          d: `M0 ${fmt(yTop)}${waveSegments(w, yTop, A, freq)}L${fmt(w)} ${fmt(yTop + t)}${waveSegments(w, yTop + t, A, freq, { reverse: true })}Z`,
        },
      ];
    }
    case SHAPE_TYPES.SPLIT:
      return [{ d: `M0 0L${fmt(w)} 0L${fmt(w)} ${fmt(h * (1 - amp))}L0 ${fmt(h)}Z` }];
    case SHAPE_TYPES.HEADER_CURVE:
      return [{ d: `M0 0L${fmt(w)} 0L${fmt(w)} ${fmt(h * (1 - amp))}Q${fmt(w / 2)} ${fmt(h * (1 + amp))} 0 ${fmt(h * (1 - amp))}Z` }];
    case SHAPE_TYPES.FOOTER_CURVE:
      return [{ d: `M0 ${fmt(h)}L${fmt(w)} ${fmt(h)}L${fmt(w)} ${fmt(h * amp)}Q${fmt(w / 2)} ${fmt(-h * amp)} 0 ${fmt(h * amp)}Z` }];
    case SHAPE_TYPES.S_CURVE: {
      const a = amp * 0.5;
      return [
        {
          d: `M0 ${fmt(h * (0.5 + a))}C${fmt(w * 0.4)} ${fmt(h * (0.5 + a))} ${fmt(w * 0.6)} ${fmt(h * (0.5 - a))} ${fmt(w)} ${fmt(h * (0.5 - a))}L${fmt(w)} ${fmt(h)}L0 ${fmt(h)}Z`,
        },
      ];
    }
    default:
      return [];
  }
};

const renderShape = (ctx, layer, key) => {
  const P = LAYER_LIMITS;
  const bx = clamp(layer.x, P.POSITION_MIN, P.POSITION_MAX, 0) * ctx.W;
  const by = clamp(layer.y, P.POSITION_MIN, P.POSITION_MAX, 0) * ctx.H;
  const bw = clamp(layer.w, 0, P.SIZE_MAX, 1) * ctx.W;
  const bh = clamp(layer.h, 0, P.SIZE_MAX, 1) * ctx.H;
  if (bw <= 0 || bh <= 0) return '';
  const paths = shapePaths(layer.shape, bw, bh, layer);
  if (paths.length === 0) return '';
  const fill = fillAttrs(ctx, `${key}-g`, layer, { x: 0, y: 0, w: bw, h: bh }, 0);
  if (!fill) return '';

  const rotation = clamp(layer.rotation, 0, 360, 0);
  const sx = layer.flipX === true ? -1 : 1;
  const sy = layer.flipY === true ? -1 : 1;
  const transform =
    rotation || sx < 0 || sy < 0
      ? `translate(${fmt(bx + bw / 2)} ${fmt(by + bh / 2)})${rotation ? ` rotate(${fmt(rotation)})` : ''}${sx < 0 || sy < 0 ? ` scale(${sx} ${sy})` : ''} translate(${fmt(-bw / 2)} ${fmt(-bh / 2)})`
      : `translate(${fmt(bx)} ${fmt(by)})`;
  const body = paths
    .map((p) => `<path d="${p.d}"${fill}${p.opacity !== undefined ? ` opacity="${fmt(p.opacity)}"` : ''}/>`)
    .join('');
  return `<g transform="${transform}">${body}</g>`;
};

/* ---------------- CURVE (custom) ---------------- */

const renderCurve = (ctx, layer, key) => {
  const P = LAYER_LIMITS;
  const pos = (v, size, fallback) => clamp(v, P.POSITION_MIN, P.POSITION_MAX, fallback) * size;
  const points = (Array.isArray(layer.path?.points) ? layer.path.points : [])
    .slice(0, P.MAX_CURVE_POINTS)
    .filter((p) => p && isNum(p.x) && isNum(p.y))
    .map((p) => {
      const x = pos(p.x, ctx.W, 0);
      const y = pos(p.y, ctx.H, 0);
      return {
        x,
        y,
        // Handle na ho to point khud (seedhi line)
        c1x: isNum(p.cx1) ? pos(p.cx1, ctx.W, 0) : x,
        c1y: isNum(p.cy1) ? pos(p.cy1, ctx.H, 0) : y,
        c2x: isNum(p.cx2) ? pos(p.cx2, ctx.W, 0) : x,
        c2y: isNum(p.cy2) ? pos(p.cy2, ctx.H, 0) : y,
      };
    });
  if (points.length < P.MIN_CURVE_POINTS) return '';

  // P[i] ka outgoing handle (cx2) → P[i+1] ka incoming handle (cx1)
  const segment = (a, b) =>
    a.c2x === a.x && a.c2y === a.y && b.c1x === b.x && b.c1y === b.y
      ? `L${fmt(b.x)} ${fmt(b.y)}`
      : `C${fmt(a.c2x)} ${fmt(a.c2y)} ${fmt(b.c1x)} ${fmt(b.c1y)} ${fmt(b.x)} ${fmt(b.y)}`;

  let d = `M${fmt(points[0].x)} ${fmt(points[0].y)}`;
  for (let i = 1; i < points.length; i += 1) d += segment(points[i - 1], points[i]);

  const first = points[0];
  const last = points[points.length - 1];
  const closed = layer.path?.closed === true;
  const fillTo = layer.path?.fillTo || CURVE_FILL_TO.NONE;
  let fillD = null;
  if (closed) {
    fillD = `${d}${segment(last, first)}Z`;
  } else if (fillTo === CURVE_FILL_TO.BOTTOM) {
    fillD = `${d}L${fmt(last.x)} ${fmt(ctx.H)}L${fmt(first.x)} ${fmt(ctx.H)}Z`;
  } else if (fillTo === CURVE_FILL_TO.TOP) {
    fillD = `${d}L${fmt(last.x)} 0L${fmt(first.x)} 0Z`;
  } else if (fillTo === CURVE_FILL_TO.LEFT) {
    fillD = `${d}L0 ${fmt(last.y)}L0 ${fmt(first.y)}Z`;
  } else if (fillTo === CURVE_FILL_TO.RIGHT) {
    fillD = `${d}L${fmt(ctx.W)} ${fmt(last.y)}L${fmt(ctx.W)} ${fmt(first.y)}Z`;
  }

  const parts = [];
  if (fillD) {
    const fill = fillAttrs(ctx, `${key}-g`, layer, { x: 0, y: 0, w: ctx.W, h: ctx.H }, 0);
    if (fill) parts.push(`<path d="${fillD}"${fill}/>`);
  }
  const stroke = resolveLayerColor(layer.strokeColor, ctx.roles);
  const strokeWidth = clamp(layer.strokeWidth, 0, P.STROKE_WIDTH_MAX, 0) * Math.min(ctx.W, ctx.H);
  if (stroke && strokeWidth > 0) {
    parts.push(
      `<path d="${closed ? `${d}${segment(last, first)}Z` : d}" fill="none" stroke="${stroke.hex}"${opacityAttr('stroke-opacity', stroke.alpha)} stroke-width="${fmt(strokeWidth)}" stroke-linecap="round" stroke-linejoin="round"/>`
    );
  }
  return parts.join('');
};

/* ---------------- ARTWORK (Super Admin SVG, server par sanitise hua) ---------------- */

const SLOT_TOKEN = /\{\{([A-Za-z][A-Za-z0-9_-]{0,31})\}\}/g;

/** "x y w h" ya [x,y,w,h] → 4 numbers (w, h > 0) ya null */
export const parseViewBox = (value) => {
  const parts = Array.isArray(value) ? value : String(value ?? '').trim().split(/[\s,]+/);
  const nums = parts.map(Number);
  if (nums.length !== 4 || nums.some((n) => !Number.isFinite(n)) || nums[2] <= 0 || nums[3] <= 0) return null;
  return nums;
};

/** Root <svg …> ke andar ka content (sanitised SVG hamesha ek root svg hai) */
const innerSvg = (svg) => {
  const open = svg.search(/<svg[\s>]/i);
  if (open < 0) return '';
  const start = svg.indexOf('>', open);
  const end = svg.lastIndexOf('</svg>');
  return start >= 0 && end > start ? svg.slice(start + 1, end) : '';
};

/**
 * Artwork slot ka rang: layer.slotColors[name] → slot ka defaultRole → defaultHex → black
 */
const artworkSlotHex = (artwork, layer, name, roles) => {
  const fromLayer = resolveLayerColor(layer.slotColors?.[name], roles);
  if (fromLayer) return fromLayer.hex;
  const slot = (artwork.slots || []).find((s) => s?.name === name);
  if (slot?.defaultRole && roles[slot.defaultRole]) return normalizeHex(roles[slot.defaultRole]) || '#000000';
  return normalizeHex(slot?.defaultHex) || '#000000';
};

const renderArtwork = (ctx, layer, key) => {
  const artwork = ctx.artworks?.[layer.artworkId];
  if (!artwork || typeof artwork.svg !== 'string') return '';
  const viewBox = parseViewBox(artwork.viewBox);
  if (!viewBox) return '';
  const idp = `${key}-a-`;
  const body = innerSvg(artwork.svg)
    // Slot tokens → pakka hex (sirf hamare validated colours)
    .replace(SLOT_TOKEN, (_, name) => artworkSlotHex(artwork, layer, name, ctx.roles))
    // Andar ke ids prefix → front / back / kai cards kabhi clash nahi
    .replace(/\sid="([^"]+)"/g, (_, id) => ` id="${idp}${safeId(id, 80)}"`)
    .replace(/url\(\s*#([^)\s"']+)\s*\)/g, (_, id) => `url(#${idp}${safeId(id, 80)})`)
    .replace(/(\s(?:xlink:)?href)="#([^"]+)"/g, (_, attr, id) => `${attr}="#${idp}${safeId(id, 80)}"`);
  if (!body.trim()) return '';
  const fit = layer.fit === ARTWORK_FITS.CONTAIN ? 'xMidYMid meet' : 'xMidYMid slice';
  return `<svg x="0" y="0" width="${fmt(ctx.W)}" height="${fmt(ctx.H)}" viewBox="${viewBox.map(fmt).join(' ')}" preserveAspectRatio="${fit}" overflow="hidden">${body}</svg>`;
};

/** Layers mein kaun se artwork ids hain (fetch / cache ke liye) */
export const artworkIdsOf = (layers) =>
  Array.from(
    new Set(
      (Array.isArray(layers) ? layers : [])
        .filter((l) => l && l.type === LAYER_TYPES.ARTWORK && typeof l.artworkId === 'string' && l.artworkId)
        .map((l) => l.artworkId)
    )
  );

/* ---------------- main ---------------- */

const RENDERERS = {
  [LAYER_TYPES.SOLID]: renderSolid,
  [LAYER_TYPES.LINEAR_GRADIENT]: renderLinear,
  [LAYER_TYPES.RADIAL_GRADIENT]: renderRadial,
  [LAYER_TYPES.MESH_GRADIENT]: renderMesh,
  [LAYER_TYPES.PATTERN]: renderPattern,
  [LAYER_TYPES.SHAPE]: renderShape,
  [LAYER_TYPES.CURVE]: renderCurve,
  [LAYER_TYPES.ARTWORK]: renderArtwork,
};

/**
 * Kya is side par kuch draw hoga?
 * @param {object[]|null|undefined} layers
 */
export const hasVisibleLayers = (layers) =>
  Array.isArray(layers) && layers.some((l) => l && l.enabled !== false && RENDERERS[l.type]);

/**
 * Roles + layers → SVG string. Kuch draw na ho to '' (empty string).
 *
 * @param {{
 *   layers: object[],
 *   roles?: Record<string, string>,
 *   width: number,
 *   height: number,
 *   idPrefix?: string,
 *   outputWidth?: number,
 *   outputHeight?: number,
 *   artworks?: Record<string, { svg: string, viewBox: string|number[], slots?: object[] }>,
 * }} input - artworks: ARTWORK layers ke liye (id → sanitised SVG). Na mile to woh layer skip. - width / height: card size (template units, viewBox). outputWidth / outputHeight: SVG ka
 *   width / height attribute (raster ke liye pixels); na ho to width / height.
 * @returns {string}
 */
export const renderLayersSvg = ({ layers, roles, width, height, idPrefix = 'tl-', outputWidth, outputHeight, artworks = null } = {}) => {
  const W = num(width);
  const H = num(height);
  if (!(W > 0) || !(H > 0) || !Array.isArray(layers)) return '';

  const prefix = safeId(idPrefix) || 'tl-';
  const ctx = { W, H, roles: resolveRoles(roles), defs: [], artworks: artworks && typeof artworks === 'object' ? artworks : null };
  const body = [];

  layers.slice(0, LAYER_LIMITS.MAX_LAYERS).forEach((layer, index) => {
    if (!layer || typeof layer !== 'object' || layer.enabled === false) return;
    const render = RENDERERS[layer.type];
    if (!render) return;
    const defsBefore = ctx.defs.length;
    try {
      const content = render(ctx, layer, `${prefix}${index}`);
      if (!content) {
        ctx.defs.length = defsBefore;
        return;
      }
      const opacity = clamp(layer.opacity, 0, 1, 1);
      if (opacity <= 0) {
        ctx.defs.length = defsBefore;
        return;
      }
      body.push(opacity < 1 ? `<g opacity="${fmt(opacity)}">${content}</g>` : content);
    } catch {
      // Kharab layer: sirf woh skip (renderer kabhi throw nahi karta)
      ctx.defs.length = defsBefore;
    }
  });

  if (body.length === 0) return '';
  const ow = num(outputWidth) > 0 ? outputWidth : W;
  const oh = num(outputHeight) > 0 ? outputHeight : H;
  const defs = ctx.defs.length ? `<defs>${ctx.defs.join('')}</defs>` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${fmt(ow)}" height="${fmt(oh)}" viewBox="0 0 ${fmt(W)} ${fmt(H)}" preserveAspectRatio="none">${defs}${body.join('')}</svg>`;
};

/**
 * <img src> / <image href> ke liye data URL ('' agar kuch draw nahi)
 * @param {string} svg
 */
export const svgToDataUrl = (svg) => (svg ? `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}` : '');

/**
 * Side ki layers: back null / missing → front jaisi
 * @param {{ front?: object[], back?: object[]|null }|null|undefined} layers
 * @param {'front'|'back'} sideKey
 */
export const layersForSide = (layers, sideKey) => {
  if (!layers || typeof layers !== 'object') return null;
  if (sideKey === 'back' && Array.isArray(layers.back)) return layers.back;
  return Array.isArray(layers.front) ? layers.front : null;
};
