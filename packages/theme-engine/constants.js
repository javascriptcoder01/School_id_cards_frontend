// constants.js — Theme Builder enums + limits. Backend (Joi, constants) aur Frontend dono yahin se import karte hain.
// Layer ke colour = { role } (palette badle to badalta hai) ya { hex } (fixed) + optional alpha 0..1.
// Layer ke sab coordinates NORMALISED 0..1 (card width / height ka hissa) → har size / unit / orientation par chalega.

/** Renderer ka version. Output badle (naya layer type, geometry change) to bump karo. */
export const ENGINE_VERSION = '1.0.0';

export const COLOR_ROLES = Object.freeze({
  PRIMARY: 'primary',
  SECONDARY: 'secondary',
  ACCENT: 'accent',
  SURFACE: 'surface', // card ka base
  TEXT: 'text',
  MUTED_TEXT: 'mutedText',
  ON_PRIMARY: 'onPrimary', // primary par text
});
export const COLOR_ROLE_VALUES = Object.freeze(Object.values(COLOR_ROLES));

export const LAYER_TYPES = Object.freeze({
  SOLID: 'SOLID',
  LINEAR_GRADIENT: 'LINEAR_GRADIENT',
  RADIAL_GRADIENT: 'RADIAL_GRADIENT',
  MESH_GRADIENT: 'MESH_GRADIENT',
  PATTERN: 'PATTERN',
  SHAPE: 'SHAPE',
  CURVE: 'CURVE',
  ARTWORK: 'ARTWORK',
});
export const LAYER_TYPE_VALUES = Object.freeze(Object.values(LAYER_TYPES));

export const PATTERN_TYPES = Object.freeze({
  DOTS: 'DOTS',
  GRID: 'GRID',
  DIAGONAL_LINES: 'DIAGONAL_LINES',
  HEXAGON: 'HEXAGON',
  WAVES: 'WAVES',
  ZIGZAG: 'ZIGZAG',
  CHEVRON: 'CHEVRON',
  CIRCLES: 'CIRCLES',
  TRIANGLES: 'TRIANGLES',
  NOISE_DOTS: 'NOISE_DOTS',
});
export const PATTERN_TYPE_VALUES = Object.freeze(Object.values(PATTERN_TYPES));

export const SHAPE_TYPES = Object.freeze({
  WAVE: 'WAVE',
  DOUBLE_WAVE: 'DOUBLE_WAVE',
  ARC: 'ARC',
  BLOB: 'BLOB',
  DIAGONAL_BAND: 'DIAGONAL_BAND',
  CORNER_SWOOSH: 'CORNER_SWOOSH',
  CIRCLE: 'CIRCLE',
  RIBBON: 'RIBBON',
  SPLIT: 'SPLIT',
  HEADER_CURVE: 'HEADER_CURVE',
  FOOTER_CURVE: 'FOOTER_CURVE',
  S_CURVE: 'S_CURVE',
});
export const SHAPE_TYPE_VALUES = Object.freeze(Object.values(SHAPE_TYPES));

// Print engine (PDFKit) blend modes nahi chhaapta, isliye renderer inhe ignore karta hai (preview = print).
export const BLEND_MODES = Object.freeze({
  NORMAL: 'NORMAL',
  MULTIPLY: 'MULTIPLY',
  SCREEN: 'SCREEN',
  OVERLAY: 'OVERLAY',
  SOFT_LIGHT: 'SOFT_LIGHT',
});
export const BLEND_MODE_VALUES = Object.freeze(Object.values(BLEND_MODES));

// Custom curve: closed / fillTo = curve aur us card edge ke beech ka hissa bharo
export const CURVE_FILL_TO = Object.freeze({
  TOP: 'TOP',
  BOTTOM: 'BOTTOM',
  LEFT: 'LEFT',
  RIGHT: 'RIGHT',
  NONE: 'NONE',
});
export const CURVE_FILL_TO_VALUES = Object.freeze(Object.values(CURVE_FILL_TO));

export const ARTWORK_FITS = Object.freeze({ COVER: 'COVER', CONTAIN: 'CONTAIN' });
export const ARTWORK_FIT_VALUES = Object.freeze(Object.values(ARTWORK_FITS));

export const LAYER_LIMITS = Object.freeze({
  MAX_LAYERS: 8,
  MAX_GRADIENT_STOPS: 6,
  MIN_GRADIENT_STOPS: 2,
  MAX_MESH_POINTS: 4,
  MIN_MESH_POINTS: 2,
  MAX_CURVE_POINTS: 16,
  MIN_CURVE_POINTS: 2,
  ID_MAX: 64,
  NAME_MAX: 60,
  PATTERN_SIZE_MIN: 0.01, // card ke chhote side ka hissa
  PATTERN_SIZE_MAX: 0.3,
  STROKE_WIDTH_MAX: 0.05, // card ke chhote side ka hissa
  RADIUS_MAX: 2, // card ke bade side ka hissa
  FREQUENCY_MIN: 1,
  FREQUENCY_MAX: 6,
  // Shape / curve card ke bahar tak ja sakte hain (bleed), isliye 0..1 se thoda zyada
  POSITION_MIN: -0.5,
  POSITION_MAX: 1.5,
  SIZE_MAX: 2,
});

// 1 = purane themes (layers nahi), 2 = layers wale
export const THEME_SCHEMA_VERSIONS = Object.freeze({ LEGACY: 1, LAYERS: 2 });
