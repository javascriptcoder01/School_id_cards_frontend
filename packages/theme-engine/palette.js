// palette.js — EK brand colour se poora role palette (primary … onPrimary). Pure, deterministic.
// Contrast guard (WCAG AA): text / mutedText on surface ≥ 4.5:1, onPrimary on primary ≥ 4.5:1.
import { normalizeHex } from './renderLayers.js';

export const PALETTE_MODES = Object.freeze({
  ANALOGOUS: 'ANALOGOUS',
  COMPLEMENTARY: 'COMPLEMENTARY',
  TRIADIC: 'TRIADIC',
  MONO: 'MONO',
});
export const PALETTE_MODE_VALUES = Object.freeze(Object.values(PALETTE_MODES));

export const MIN_CONTRAST = 4.5;

/* ---------------- colour math ---------------- */

const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

const hexToRgb = (hex) => {
  const h = normalizeHex(hex) || '#000000';
  return [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
};

const rgbToHex = (rgb) =>
  `#${rgb.map((v) => clamp(Math.round(v), 0, 255).toString(16).padStart(2, '0')).join('')}`.toUpperCase();

/** hex → { h 0..360, s 0..100, l 0..100 } */
export const hexToHsl = (hex) => {
  const [r, g, b] = hexToRgb(hex).map((v) => v / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l: l * 100 };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h;
  if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  return { h: h * 60, s: s * 100, l: l * 100 };
};

/** { h, s, l } → '#RRGGBB' */
export const hslToHex = ({ h, s, l }) => {
  const hh = (((h % 360) + 360) % 360) / 360;
  const ss = clamp(s, 0, 100) / 100;
  const ll = clamp(l, 0, 100) / 100;
  if (ss === 0) return rgbToHex([ll * 255, ll * 255, ll * 255]);
  const q = ll < 0.5 ? ll * (1 + ss) : ll + ss - ll * ss;
  const p = 2 * ll - q;
  const channel = (t) => {
    let x = t;
    if (x < 0) x += 1;
    if (x > 1) x -= 1;
    if (x < 1 / 6) return p + (q - p) * 6 * x;
    if (x < 1 / 2) return q;
    if (x < 2 / 3) return p + (q - p) * (2 / 3 - x) * 6;
    return p;
  };
  return rgbToHex([channel(hh + 1 / 3) * 255, channel(hh) * 255, channel(hh - 1 / 3) * 255]);
};

const luminance = (hex) => {
  const [r, g, b] = hexToRgb(hex).map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

/** WCAG contrast ratio 1..21 */
export const contrastRatio = (a, b) => {
  const la = luminance(a);
  const lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
};

/**
 * `color` ki lightness ko `direction` (-1 darker / +1 lighter) mein tab tak badlo jab tak `against` par
 * contrast ≥ min ho jaaye. Na ho sake to black / white.
 */
const ensureContrast = (color, against, direction, min = MIN_CONTRAST) => {
  const hsl = hexToHsl(color);
  let hex = hslToHex(hsl);
  for (let l = hsl.l; contrastRatio(hex, against) < min; l += direction * 2) {
    if (l < 0 || l > 100) return direction < 0 ? '#000000' : '#FFFFFF';
    hex = hslToHex({ ...hsl, l });
  }
  return hex;
};

/* ---------------- palette ---------------- */

// [secondary hue shift, accent hue shift] har mode ke liye
const HUE_SHIFTS = {
  ANALOGOUS: [30, -35],
  COMPLEMENTARY: [-18, 180],
  TRIADIC: [120, 240],
  MONO: [0, 0],
};

/**
 * Ek brand colour se roles.
 * @param {string} baseHex - brand colour (#RGB / #RRGGBB)
 * @param {{ mode?: 'ANALOGOUS'|'COMPLEMENTARY'|'TRIADIC'|'MONO', variant?: number }} [options]
 *   variant: "Shuffle" ke liye 0,1,2… (har number thoda alag, par hamesha same output)
 * @returns {{ primary: string, secondary: string, accent: string, surface: string, text: string,
 *   mutedText: string, onPrimary: string }}
 */
export const buildPalette = (baseHex, { mode = PALETTE_MODES.ANALOGOUS, variant = 0 } = {}) => {
  const base = hexToHsl(normalizeHex(baseHex) || '#1E3A8A');
  const shifts = HUE_SHIFTS[mode] || HUE_SHIFTS.ANALOGOUS;
  const v = Math.abs(Math.trunc(Number(variant) || 0)) % 6;
  // Shuffle: halka hue jitter + lightness badlav (deterministic)
  const jitter = [0, 12, -12, 24, -24, 6][v];
  const lightShift = [0, -6, 6, -10, 4, 10][v];
  const sat = clamp(base.s, 25, 90);

  // Primary: brand jaisa, bahut light ho to card header ke liye thoda gehra
  let primary = hslToHex({ h: base.h, s: base.s, l: clamp(base.l, 18, 62) });

  const secondary = mode === PALETTE_MODES.MONO
    ? hslToHex({ h: base.h + jitter / 2, s: clamp(sat - 10, 15, 85), l: clamp(base.l + 14 + lightShift, 25, 70) })
    : hslToHex({ h: base.h + shifts[0] + jitter, s: sat, l: clamp(base.l + 6 + lightShift, 25, 65) });

  const accent = mode === PALETTE_MODES.MONO
    ? hslToHex({ h: base.h, s: clamp(sat, 30, 68), l: clamp(base.l + 24, 42, 72) })
    : hslToHex({ h: base.h + shifts[1] - jitter, s: clamp(sat, 35, 68), l: clamp(47 + lightShift / 2, 38, 56) });

  // Surface: brand ka bahut halka tint (card body)
  const surface = hslToHex({ h: base.h, s: clamp(base.s * 0.35, 0, 30), l: 97 });

  // onPrimary: white ya dark, jo zyada contrast de; dono kam ho to primary gehra / halka karo
  const dark = hslToHex({ h: base.h, s: clamp(base.s * 0.4, 0, 40), l: 10 });
  let onPrimary = contrastRatio('#FFFFFF', primary) >= contrastRatio(dark, primary) ? '#FFFFFF' : dark;
  if (contrastRatio(onPrimary, primary) < MIN_CONTRAST) {
    primary = ensureContrast(primary, onPrimary, onPrimary === '#FFFFFF' ? -1 : 1);
    if (contrastRatio(onPrimary, primary) < MIN_CONTRAST) onPrimary = onPrimary === '#FFFFFF' ? '#000000' : '#FFFFFF';
  }

  const text = ensureContrast(hslToHex({ h: base.h, s: clamp(base.s * 0.5, 0, 45), l: 12 }), surface, -1);
  const mutedText = ensureContrast(hslToHex({ h: base.h, s: clamp(base.s * 0.3, 0, 25), l: 38 }), surface, -1);

  return { primary, secondary, accent, surface, text, mutedText, onPrimary };
};
