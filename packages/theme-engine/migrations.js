// migrations.js — theme data ke format ka upgrade, READ par (DB kabhi mass-update nahi hota). Pure + idempotent.
// Naya layer format badle → naya step function + CURRENT_THEME_SCHEMA bump + test.
import { BLEND_MODES, LAYER_LIMITS, LAYER_TYPE_VALUES, THEME_SCHEMA_VERSIONS } from './constants.js';

/** Abhi ka theme data version */
export const CURRENT_THEME_SCHEMA = THEME_SCHEMA_VERSIONS.LAYERS;

const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);

// Layer ke common defaults (Joi jaise) — purane / hand-made data par
const normalizeLayer = (layer) => ({
  ...layer,
  enabled: layer.enabled !== false,
  opacity: typeof layer.opacity === 'number' && Number.isFinite(layer.opacity) ? Math.min(1, Math.max(0, layer.opacity)) : 1,
  blendMode: typeof layer.blendMode === 'string' ? layer.blendMode : BLEND_MODES.NORMAL,
  locked: layer.locked === true,
});

const normalizeList = (list) =>
  (Array.isArray(list) ? list : [])
    .filter((l) => isObject(l) && LAYER_TYPE_VALUES.includes(l.type))
    .slice(0, LAYER_LIMITS.MAX_LAYERS)
    .map(normalizeLayer);

/**
 * v1 → v2: layers ka pakka shape { front: Layer[], back: Layer[] | null } + layer defaults.
 * Bina layers ka v1 theme v2 jaisa hi hai — use chhoda nahi jaata (version 1 rehta hai, render same).
 */
const toV2 = (theme) => {
  const layers = theme.background?.layers;
  if (!isObject(layers) && !Array.isArray(layers)) return theme;
  // Purana / galat shape: seedha array → front
  const front = Array.isArray(layers) ? layers : layers.front;
  const back = Array.isArray(layers) ? null : layers.back;
  return {
    ...theme,
    background: {
      ...theme.background,
      layers: { front: normalizeList(front), back: Array.isArray(back) ? normalizeList(back) : null },
    },
    schemaVersion: 2,
  };
};

// [version, step] — har step "us version tak" le jaata hai
const STEPS = [[2, toV2]];

const versionOf = (theme) => {
  const v = Number(theme?.schemaVersion);
  return Number.isInteger(v) && v >= 1 ? v : THEME_SCHEMA_VERSIONS.LEGACY;
};

/**
 * Theme ko CURRENT_THEME_SCHEMA tak laao. Same input → same output; dobara chalao → koi badlav nahi.
 * @param {object|null|undefined} theme
 * @returns {{ theme: object|null|undefined, from: number, to: number, changed: boolean }}
 */
export const migrateThemeWithInfo = (theme) => {
  if (!isObject(theme)) return { theme, from: CURRENT_THEME_SCHEMA, to: CURRENT_THEME_SCHEMA, changed: false };
  const from = versionOf(theme);
  let next = theme;
  for (const [version, step] of STEPS) {
    if (versionOf(next) < version) next = step(next);
  }
  const to = versionOf(next);
  return { theme: next, from, to, changed: next !== theme };
};

/**
 * @param {object|null|undefined} theme
 * @returns {object|null|undefined} migrated theme (badlav na ho to wahi object)
 */
export const migrateTheme = (theme) => migrateThemeWithInfo(theme).theme;
