// themeLayers.js — Theme Builder ke pure helpers (Redux / React nahi). Sab functions naya object lautate hain.
// Layers shape: { front: Layer[], back: Layer[] | null } — back null = front jaisa design.
import {
  THEME_COLOR_ROLE_VALUES,
  THEME_CURVE_FILL_TO,
  THEME_CURVY_SHAPES,
  THEME_LAYER_LIMITS,
  THEME_LAYER_TYPES,
  THEME_PATTERN_TYPES,
  THEME_SHAPE_TYPES,
} from '../constants/themeBuilder.js';
import { TEMPLATE_SIDES } from '../constants/template.js';

/** 'FRONT' / 'front' → 'front', 'BACK' / 'back' → 'back' */
export const layerSideKey = (side) => (side === TEMPLATE_SIDES.BACK || side === 'back' ? 'back' : 'front');

let idCounter = 0;
/** Layer id: sirf letters / numbers / - / _ (backend Joi rule) */
export const createLayerId = (type = 'layer') => {
  idCounter = (idCounter + 1) % 1e6;
  return `${String(type).toLowerCase().replace(/[^a-z0-9]/g, '')}-${Date.now().toString(36)}${idCounter.toString(36)}`.slice(0, THEME_LAYER_LIMITS.ID_MAX);
};

const deepClone = (value) => (value === undefined ? undefined : JSON.parse(JSON.stringify(value)));

const r = (role, alpha) => (alpha === undefined ? { role } : { role, alpha });

const COMMON = { name: null, enabled: true, opacity: 1, blendMode: 'NORMAL', locked: false };

// Naye layer ke defaults (har type ka ek theek-thaak shuruaat)
const LAYER_DEFAULTS = {
  [THEME_LAYER_TYPES.SOLID]: () => ({ color: r('surface') }),
  [THEME_LAYER_TYPES.LINEAR_GRADIENT]: () => ({
    stops: [{ color: r('primary'), at: 0 }, { color: r('secondary'), at: 1 }],
    angle: 90,
  }),
  [THEME_LAYER_TYPES.RADIAL_GRADIENT]: () => ({
    stops: [{ color: r('accent', 0.5), at: 0 }, { color: r('accent', 0), at: 1 }],
    center: { x: 0.5, y: 0.35 },
    radius: 0.5,
  }),
  [THEME_LAYER_TYPES.MESH_GRADIENT]: () => ({
    points: [
      { x: 0.5, y: 0.5, color: r('surface') },
      { x: 0, y: 0, color: r('primary', 0.4) },
      { x: 1, y: 1, color: r('accent', 0.35) },
    ],
    softness: 0.6,
  }),
  [THEME_LAYER_TYPES.PATTERN]: () => ({
    pattern: THEME_PATTERN_TYPES.DOTS,
    color: r('primary', 0.15),
    size: 0.05,
    strokeWidth: 0.004,
    rotation: 0,
    area: { x: 0, y: 0, w: 1, h: 1 },
  }),
  [THEME_LAYER_TYPES.SHAPE]: () => ({
    shape: THEME_SHAPE_TYPES.WAVE,
    color: r('primary'),
    x: 0,
    y: 0.82,
    w: 1,
    h: 0.18,
    rotation: 0,
    flipX: false,
    flipY: false,
    amplitude: 0.4,
    frequency: 1.5,
    thickness: 0.3,
  }),
  [THEME_LAYER_TYPES.CURVE]: () => ({
    path: {
      points: [
        { x: 0, y: 0.82, cx2: 0.25, cy2: 0.74 },
        { x: 0.5, y: 0.84, cx1: 0.3, cy1: 0.92, cx2: 0.7, cy2: 0.76 },
        { x: 1, y: 0.8, cx1: 0.8, cy1: 0.88 },
      ],
      closed: false,
      fillTo: THEME_CURVE_FILL_TO.BOTTOM,
    },
    color: r('primary'),
    strokeWidth: 0,
  }),
  // artworkId picker se aata hai (preset: { artworkId, name })
  [THEME_LAYER_TYPES.ARTWORK]: () => ({ artworkId: null, slotColors: {}, fit: 'COVER' }),
};

/** Kaun se types add ho sakte hain (ARTWORK sirf tab jab koi active artwork ho — menu decide karta hai) */
export const ADDABLE_LAYER_TYPES = Object.freeze(Object.keys(LAYER_DEFAULTS));

/**
 * Naya layer. preset: us type ke upar override (jaise { shape: 'ARC' } ya poora preset).
 * @param {string} type
 * @param {object} [preset]
 * @returns {object|null}
 */
export const createLayer = (type, preset = null) => {
  const defaults = LAYER_DEFAULTS[type];
  if (!defaults) return null;
  // id + type hamesha naye (preset ke id / type par nahi)
  return { ...COMMON, ...defaults(), ...(preset ? deepClone(preset) : {}), id: createLayerId(type), type };
};

/** Copy with naye id (copy-to-other-side / duplicate) */
export const cloneLayers = (layers) => (layers || []).map((l) => ({ ...deepClone(l), id: createLayerId(l.type) }));

/** Theme ki layers (null = theme mein apni layers nahi) */
export const themeLayersOf = (theme) => {
  const layers = theme?.background?.layers;
  return layers && typeof layers === 'object' ? layers : null;
};

/**
 * Side ki dikhne wali list: back null → front
 * @param {{ front?: object[], back?: object[]|null }|null} layers
 * @param {'FRONT'|'BACK'|'front'|'back'} side
 */
export const getSideLayers = (layers, side) => {
  if (!layers) return [];
  const key = layerSideKey(side);
  if (key === 'back' && Array.isArray(layers.back)) return layers.back;
  return Array.isArray(layers.front) ? layers.front : [];
};

/** Back apna design use karta hai ya front jaisa */
export const backUsesFront = (layers) => !layers || !Array.isArray(layers.back);

/**
 * Side ki list badlo. Back null tha aur back edit hua → front ki copy se shuru (front waisa hi).
 * list === null (sirf back) → "back uses front".
 */
export const setSideLayers = (layers, side, list) => {
  const base = layers || { front: [], back: null };
  const key = layerSideKey(side);
  if (key === 'back') return { front: base.front || [], back: list === null ? null : (list || []).slice(0, THEME_LAYER_LIMITS.MAX_LAYERS) };
  return { front: (list || []).slice(0, THEME_LAYER_LIMITS.MAX_LAYERS), back: base.back ?? null };
};

const editSide = (layers, side, fn) => setSideLayers(layers, side, fn(getSideLayers(layers, side).slice()));

export const updateLayerIn = (layers, side, id, patch) =>
  editSide(layers, side, (list) => list.map((l) => (l.id === id ? { ...l, ...(typeof patch === 'function' ? patch(l) : patch) } : l)));

export const addLayerTo = (layers, side, layer) =>
  editSide(layers, side, (list) => (layer && list.length < THEME_LAYER_LIMITS.MAX_LAYERS ? [...list, layer] : list));

export const removeLayerFrom = (layers, side, id) => editSide(layers, side, (list) => list.filter((l) => l.id !== id));

/** delta: -1 = neeche (pehle draw), +1 = upar */
export const moveLayerIn = (layers, side, id, delta) =>
  editSide(layers, side, (list) => {
    const from = list.findIndex((l) => l.id === id);
    const to = from + delta;
    if (from < 0 || to < 0 || to >= list.length) return list;
    const next = list.slice();
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    return next;
  });

export const duplicateLayerIn = (layers, side, id) =>
  editSide(layers, side, (list) => {
    const index = list.findIndex((l) => l.id === id);
    if (index < 0 || list.length >= THEME_LAYER_LIMITS.MAX_LAYERS) return list;
    const source = list[index];
    const copy = { ...deepClone(source), id: createLayerId(source.type), name: source.name ? `${source.name} copy`.slice(0, THEME_LAYER_LIMITS.NAME_MAX) : null, locked: false };
    return [...list.slice(0, index + 1), copy, ...list.slice(index + 1)];
  });

/** fromSide ki layers dusre side par (naye ids) */
export const copyLayersToOtherSide = (layers, fromSide) => {
  const from = layerSideKey(fromSide);
  const copy = cloneLayers(getSideLayers(layers, from));
  return setSideLayers(layers, from === 'front' ? 'back' : 'front', copy);
};

/* ---------------- Easy mode style sliders ---------------- */

const numOr = (value, fallback) => (typeof value === 'number' && Number.isFinite(value) ? value : fallback);
const round3 = (value) => Math.round(value * 1000) / 1000;

export const isCurvyLayer = (layer) => layer?.type === THEME_LAYER_TYPES.SHAPE && THEME_CURVY_SHAPES.includes(layer.shape);
export const isPatternLayer = (layer) => layer?.type === THEME_LAYER_TYPES.PATTERN;

const maxOf = (list, predicate, read) => (list || []).filter(predicate).reduce((max, l) => Math.max(max, read(l)), 0);

/**
 * Sliders ki abhi ki value (sab layers mein sabse bada) — easy mode yahi dikhata hai
 * @param {object[]} list
 */
export const layerStyleValues = (list) => ({
  strength: maxOf(list, () => true, (l) => numOr(l.opacity, 1)),
  curveHeight: maxOf(list, isCurvyLayer, (l) => numOr(l.amplitude, 0.3)),
  hasCurves: (list || []).some(isCurvyLayer),
  patternSize: maxOf(list, isPatternLayer, (l) => numOr(l.size, 0.05)),
  hasPatterns: (list || []).some(isPatternLayer),
});

/**
 * Ek key sab matching layers mein ek saath, aapas ka anupaat bana kar (sabse bada = target).
 * Locked layers nahi badalte.
 */
export const scaleLayerValues = (list, predicate, key, target, { min, max, fallback }) => {
  const current = maxOf(list, predicate, (l) => numOr(l[key], fallback));
  return (list || []).map((l) => {
    if (!predicate(l) || l.locked) return l;
    const value = current > 0 ? (numOr(l[key], fallback) * target) / current : target;
    return { ...l, [key]: round3(Math.min(max, Math.max(min, value))) };
  });
};

/** Preset / school theme se form ke liye roles + layers (deep copy). Purane presets → null. */
export const presetThemeBuilderData = (preset) => {
  const layers = preset?.layers && Array.isArray(preset.layers.front)
    ? { front: deepClone(preset.layers.front), back: Array.isArray(preset.layers.back) ? deepClone(preset.layers.back) : null }
    : null;
  const roles = preset?.roles && typeof preset.roles === 'object'
    ? Object.fromEntries(THEME_COLOR_ROLE_VALUES.map((role) => [role, preset.roles[role] || null]))
    : null;
  return { layers, roles };
};
