// themeBuilder.js — Theme Builder constants. Ek hi list: shared package @app/theme-engine (Backend bhi wahi).
// Naam backend constants/cardTheme.js jaise (THEME_*).
import {
  ARTWORK_FITS,
  ARTWORK_FIT_VALUES,
  BLEND_MODES,
  BLEND_MODE_VALUES,
  COLOR_ROLES,
  COLOR_ROLE_VALUES,
  CURVE_FILL_TO,
  CURVE_FILL_TO_VALUES,
  ENGINE_VERSION,
  LAYER_LIMITS,
  LAYER_TYPES,
  LAYER_TYPE_VALUES,
  PALETTE_MODES,
  PALETTE_MODE_VALUES,
  PATTERN_TYPES,
  PATTERN_TYPE_VALUES,
  SHAPE_TYPES,
  SHAPE_TYPE_VALUES,
  THEME_SCHEMA_VERSIONS as SCHEMA_VERSIONS,
} from '@app/theme-engine';

export const THEME_ENGINE_VERSION = ENGINE_VERSION;
export const THEME_COLOR_ROLES = COLOR_ROLES;
export const THEME_COLOR_ROLE_VALUES = COLOR_ROLE_VALUES;
export const THEME_LAYER_TYPES = LAYER_TYPES;
export const THEME_LAYER_TYPE_VALUES = LAYER_TYPE_VALUES;
export const THEME_PATTERN_TYPES = PATTERN_TYPES;
export const THEME_PATTERN_TYPE_VALUES = PATTERN_TYPE_VALUES;
export const THEME_SHAPE_TYPES = SHAPE_TYPES;
export const THEME_SHAPE_TYPE_VALUES = SHAPE_TYPE_VALUES;
export const THEME_BLEND_MODES = BLEND_MODES;
export const THEME_BLEND_MODE_VALUES = BLEND_MODE_VALUES;
export const THEME_CURVE_FILL_TO = CURVE_FILL_TO;
export const THEME_CURVE_FILL_TO_VALUES = CURVE_FILL_TO_VALUES;
export const THEME_ARTWORK_FITS = ARTWORK_FITS;
export const THEME_ARTWORK_FIT_VALUES = ARTWORK_FIT_VALUES;
export const THEME_LAYER_LIMITS = LAYER_LIMITS;
export const THEME_SCHEMA_VERSIONS = SCHEMA_VERSIONS;
export const THEME_PALETTE_MODES = PALETTE_MODES;
export const THEME_PALETTE_MODE_VALUES = PALETTE_MODE_VALUES;

// Backend catalog ki "Layered" category
export const THEME_LAYERED_CATEGORY = 'LAYERED';

/* ---------------- UI labels ---------------- */

export const THEME_LAYER_TYPE_LABELS = Object.freeze({
  SOLID: 'Colour',
  LINEAR_GRADIENT: 'Gradient',
  RADIAL_GRADIENT: 'Radial glow',
  MESH_GRADIENT: 'Mesh',
  PATTERN: 'Pattern',
  SHAPE: 'Shape',
  CURVE: 'Custom curve',
  ARTWORK: 'Artwork',
});

export const THEME_ROLE_LABELS = Object.freeze({
  primary: 'Primary',
  secondary: 'Secondary',
  accent: 'Accent',
  surface: 'Surface',
  text: 'Text',
  mutedText: 'Muted',
  onPrimary: 'On primary',
});

export const THEME_PALETTE_MODE_LABELS = Object.freeze({
  ANALOGOUS: 'Analogous',
  COMPLEMENTARY: 'Complementary',
  TRIADIC: 'Triadic',
  MONO: 'Mono',
});

export const THEME_PATTERN_LABELS = Object.freeze({
  DOTS: 'Dots',
  GRID: 'Grid',
  DIAGONAL_LINES: 'Diagonal',
  HEXAGON: 'Hexagon',
  WAVES: 'Waves',
  ZIGZAG: 'Zigzag',
  CHEVRON: 'Chevron',
  CIRCLES: 'Circles',
  TRIANGLES: 'Triangles',
  NOISE_DOTS: 'Confetti',
});

export const THEME_SHAPE_LABELS = Object.freeze({
  WAVE: 'Wave',
  DOUBLE_WAVE: 'Double wave',
  ARC: 'Arc',
  BLOB: 'Blob',
  DIAGONAL_BAND: 'Diagonal band',
  CORNER_SWOOSH: 'Corner swoosh',
  CIRCLE: 'Circle',
  RIBBON: 'Ribbon',
  SPLIT: 'Split',
  HEADER_CURVE: 'Header curve',
  FOOTER_CURVE: 'Footer curve',
  S_CURVE: 'S-curve',
});

export const THEME_BLEND_MODE_LABELS = Object.freeze({
  NORMAL: 'Normal',
  MULTIPLY: 'Multiply',
  SCREEN: 'Screen',
  OVERLAY: 'Overlay',
  SOFT_LIGHT: 'Soft light',
});

export const THEME_CURVE_FILL_TO_LABELS = Object.freeze({
  NONE: 'None',
  TOP: 'Top',
  BOTTOM: 'Bottom',
  LEFT: 'Left',
  RIGHT: 'Right',
});

// Easy mode "Curve height" slider in shapes ki amplitude badalta hai
export const THEME_CURVY_SHAPES = Object.freeze([
  'WAVE',
  'DOUBLE_WAVE',
  'ARC',
  'BLOB',
  'RIBBON',
  'SPLIT',
  'HEADER_CURVE',
  'FOOTER_CURVE',
  'S_CURVE',
  'CORNER_SWOOSH',
]);

export default {
  THEME_ENGINE_VERSION,
  THEME_COLOR_ROLES,
  THEME_COLOR_ROLE_VALUES,
  THEME_LAYER_TYPES,
  THEME_LAYER_TYPE_VALUES,
  THEME_PATTERN_TYPES,
  THEME_PATTERN_TYPE_VALUES,
  THEME_SHAPE_TYPES,
  THEME_SHAPE_TYPE_VALUES,
  THEME_BLEND_MODES,
  THEME_BLEND_MODE_VALUES,
  THEME_CURVE_FILL_TO,
  THEME_CURVE_FILL_TO_VALUES,
  THEME_ARTWORK_FITS,
  THEME_ARTWORK_FIT_VALUES,
  THEME_LAYER_LIMITS,
  THEME_SCHEMA_VERSIONS,
  THEME_PALETTE_MODES,
  THEME_PALETTE_MODE_VALUES,
  THEME_LAYERED_CATEGORY,
  THEME_LAYER_TYPE_LABELS,
  THEME_ROLE_LABELS,
  THEME_PALETTE_MODE_LABELS,
  THEME_PATTERN_LABELS,
  THEME_SHAPE_LABELS,
  THEME_BLEND_MODE_LABELS,
  THEME_CURVE_FILL_TO_LABELS,
  THEME_CURVY_SHAPES,
};
