// printCheck.js — "Print check": theme print par theek aayega ya nahi (sirf warnings, save kabhi nahi rukta). Pure.
import { BLEND_MODES, LAYER_TYPES, LAYER_LIMITS } from './constants.js';
import { contrastRatio, hexToHsl, MIN_CONTRAST } from './palette.js';
import { resolveLayerColor, resolveRoles } from './renderLayers.js';

const MM_PER_UNIT = { MM: 1, PX: 25.4 / 96, IN: 25.4, CM: 10 };
const MAX_VISIBLE_LAYERS = 6;
const MIN_PATTERN_MM = 0.6;
// White stock par 8% se kam "syaahi" = lagbhag dikhega nahi
const MIN_INK = 0.08;

const luminance = (hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

// Bahut chamkile RGB (neon green / blue / violet / magenta) CMYK mein phike chhapte hain — saral heuristic
const outOfCmyk = (hex) => {
  const { h, s, l } = hexToHsl(hex);
  if (s < 85 || l < 35 || l > 70) return false;
  return (h >= 90 && h <= 160) || (h >= 200 && h <= 330);
};

// Layer ke saare rang (fill, stops, mesh points, stroke, artwork slot colours)
const layerColors = (layer) => [
  layer.color,
  layer.strokeColor,
  ...(layer.stops || []).map((s) => s?.color),
  ...(layer.points || []).map((p) => p?.color),
  ...Object.values(layer.slotColors || {}),
].filter(Boolean);

/**
 * @param {{ roles?: object, layers?: { front?: object[], back?: object[]|null } | object[] }} theme
 *   roles: resolved / partial role colours; layers: dono sides (ya ek list)
 * @param {{ width: number, height: number, unit?: string }} card
 * @returns {Array<{ code: string, message: string, side?: string }>}
 */
export const checkPrintSafety = (theme, { width, height, unit = 'MM' } = {}) => {
  const warnings = [];
  const roles = resolveRoles(theme?.roles);
  const add = (code, message, side) => {
    if (!warnings.some((w) => w.code === code && w.side === side)) warnings.push({ code, message, ...(side ? { side } : {}) });
  };

  if (contrastRatio(roles.text, roles.surface) < MIN_CONTRAST) {
    add('TEXT_CONTRAST', `Text colour is hard to read on the card colour (${contrastRatio(roles.text, roles.surface).toFixed(1)}:1, needs 4.5:1)`);
  }
  if (contrastRatio(roles.mutedText, roles.surface) < MIN_CONTRAST) {
    add('MUTED_CONTRAST', `Muted text is hard to read on the card colour (${contrastRatio(roles.mutedText, roles.surface).toFixed(1)}:1, needs 4.5:1)`);
  }
  if (contrastRatio(roles.onPrimary, roles.primary) < MIN_CONTRAST) {
    add('ON_PRIMARY_CONTRAST', `Text on the primary colour is hard to read (${contrastRatio(roles.onPrimary, roles.primary).toFixed(1)}:1, needs 4.5:1)`);
  }

  const raw = theme?.layers;
  const sides = Array.isArray(raw)
    ? [['front', raw]]
    : [['front', raw?.front || []], ...(Array.isArray(raw?.back) ? [['back', raw.back]] : [])];
  const mmPerUnit = MM_PER_UNIT[String(unit).toUpperCase()] || 1;
  const shortMm = Math.min(Number(width) || 0, Number(height) || 0) * mmPerUnit;

  for (const [side, list] of sides) {
    const visible = (list || []).filter((l) => l && l.enabled !== false && (l.opacity ?? 1) > 0);
    if (visible.length > MAX_VISIBLE_LAYERS) {
      add('MANY_LAYERS', `${visible.length} visible layers on the ${side} — more than ${MAX_VISIBLE_LAYERS} can slow printing`, side);
    }
    for (const layer of visible) {
      if (layer.blendMode && layer.blendMode !== BLEND_MODES.NORMAL) {
        add('BLEND_MODE', 'Blend modes are not printed; those layers print as normal', side);
      }
      if (layer.type === LAYER_TYPES.PATTERN && shortMm > 0) {
        const sizeMm = (Number(layer.size) || LAYER_LIMITS.PATTERN_SIZE_MIN) * shortMm;
        if (sizeMm < MIN_PATTERN_MM) {
          add('PATTERN_TOO_FINE', `A pattern is ${sizeMm.toFixed(2)} mm — under ${MIN_PATTERN_MM} mm it may blur in print`, side);
        }
      }
      for (const color of layerColors(layer)) {
        const c = resolveLayerColor(color, roles);
        if (!c) continue;
        const ink = (1 - luminance(c.hex)) * c.alpha * (layer.opacity ?? 1);
        if (ink > 0 && ink < MIN_INK && c.alpha > 0) {
          add('TOO_LIGHT', 'A very light colour may barely show on white card stock', side);
        }
        if (outOfCmyk(c.hex)) {
          add('OUT_OF_GAMUT', `${c.hex} is a very bright screen colour and may print duller`, side);
        }
      }
    }
  }
  return warnings;
};
