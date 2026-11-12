// fieldTextBox.js — text field ka box (background / border / padding) aur text effects (outline / shadow / underline).
// Pure helpers. Backend Backend/src/utils/fieldTextBox.js mein BILKUL yahi rules (preview = print) — ek badle to doosra bhi.
// field.textBox null / kuch active nahi = purana output, ek bhi pixel nahi badalta.
import {
  TEMPLATE_TEXT_BOX_BORDER_SIDES,
  TEMPLATE_TEXT_BOX_BORDER_SIDE_VALUES,
  TEMPLATE_TEXT_BOX_BORDER_STYLES,
  TEMPLATE_TEXT_BOX_BORDER_STYLE_VALUES,
  TEMPLATE_TEXT_BOX_LIMITS,
  TEMPLATE_TEXT_DECORATIONS,
  TEMPLATE_TEXT_DECORATION_VALUES,
} from '../constants/template.js';

// Box ki line height: PDF Helvetica ki line (1.156 × font) + lineHeight ka farq — font se independent
export const TEXT_BOX_LINE_HEIGHT = 1.156;
const DEFAULT_LINE_HEIGHT = 1.2;

const toPlain = (value) => (value && typeof value.toObject === 'function' ? value.toObject() : value);
const num = (value, fallback = 0) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};
const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const color = (value) => (typeof value === 'string' && value.trim() ? value.trim() : null);

/**
 * Saari values defaults ke saath (limits ke andar). Save / response ke liye — kuch active na ho tab bhi values rehti hain.
 * @param {object|null} input - field.textBox
 * @returns {object|null}
 */
export const resolveTextBox = (input) => {
  const raw = toPlain(input);
  if (!raw || typeof raw !== 'object') return null;
  const L = TEMPLATE_TEXT_BOX_LIMITS;
  return {
    backgroundColor: color(raw.backgroundColor),
    backgroundOpacity: clamp(num(raw.backgroundOpacity, 1), 0, 1),
    borderWidth: clamp(num(raw.borderWidth), 0, L.BORDER_WIDTH_MAX),
    borderColor: color(raw.borderColor),
    borderStyle: TEMPLATE_TEXT_BOX_BORDER_STYLE_VALUES.includes(raw.borderStyle) ? raw.borderStyle : TEMPLATE_TEXT_BOX_BORDER_STYLES.SOLID,
    borderSides: TEMPLATE_TEXT_BOX_BORDER_SIDE_VALUES.includes(raw.borderSides) ? raw.borderSides : TEMPLATE_TEXT_BOX_BORDER_SIDES.ALL,
    borderRadius: clamp(num(raw.borderRadius), 0, L.BORDER_RADIUS_MAX),
    padding: clamp(num(raw.padding), 0, L.PADDING_MAX),
    strokeWidth: clamp(num(raw.strokeWidth), 0, L.STROKE_WIDTH_MAX),
    strokeColor: color(raw.strokeColor),
    shadowColor: color(raw.shadowColor),
    shadowX: clamp(num(raw.shadowX), -L.SHADOW_OFFSET_MAX, L.SHADOW_OFFSET_MAX),
    shadowY: clamp(num(raw.shadowY), -L.SHADOW_OFFSET_MAX, L.SHADOW_OFFSET_MAX),
    decoration: TEMPLATE_TEXT_DECORATION_VALUES.includes(raw.decoration) ? raw.decoration : TEMPLATE_TEXT_DECORATIONS.NONE,
  };
};

/**
 * Render ke liye: kuch bhi dikhne wala na ho to null (purana output).
 * @param {object|null} input
 * @returns {object|null}
 */
export const activeTextBox = (input) => {
  const box = resolveTextBox(input);
  if (!box) return null;
  const hasBackground = Boolean(box.backgroundColor) && box.backgroundOpacity > 0;
  const hasBorder = box.borderWidth > 0 && Boolean(box.borderColor);
  const hasStroke = box.strokeWidth > 0 && Boolean(box.strokeColor);
  const hasShadow = Boolean(box.shadowColor) && (box.shadowX !== 0 || box.shadowY !== 0);
  const hasDecoration = box.decoration !== TEMPLATE_TEXT_DECORATIONS.NONE;
  return hasBackground || hasBorder || hasStroke || hasShadow || hasDecoration ? box : null;
};

/**
 * Box ka rect (sab ek hi unit mein: PDF = pt, preview = card units).
 * Text apni jagah rehta hai; padding bahar ki taraf badhti hai.
 * @param {{ x: number, y: number, textY: number, width: number, fontSize: number, lineHeight?: number, maxLines?: number, padding: number }} input
 * @returns {{ x: number, y: number, width: number, height: number }}
 */
export const textBoxRect = ({ x, y, textY, width, fontSize, lineHeight, maxLines, padding }) => {
  const lines = Math.max(1, Math.round(num(maxLines, 1)));
  const line = fontSize * (TEXT_BOX_LINE_HEIGHT + (num(lineHeight, DEFAULT_LINE_HEIGHT) - DEFAULT_LINE_HEIGHT));
  const height = (textY - y) + line * lines;
  return { x: x - padding, y: y - padding, width: width + padding * 2, height: height + padding * 2 };
};

/**
 * Border ki lines (stroke ke centre par). ALL = poora rect (radius ke saath), baaki = alag sides.
 * DOUBLE = do patli lines (har ek width / 3).
 * @param {{ x: number, y: number, width: number, height: number }} rect
 * @param {{ borderStyle: string, borderSides: string, borderWidth: number, borderRadius: number }} border - rect ki unit mein
 * @returns {Array<{ type: 'RECT', x: number, y: number, width: number, height: number, radius: number, lineWidth: number }
 *   | { type: 'LINE', x1: number, y1: number, x2: number, y2: number, lineWidth: number }>}
 */
export const textBoxBorderPaths = (rect, { borderStyle, borderSides, borderWidth, borderRadius }) => {
  const double = borderStyle === TEMPLATE_TEXT_BOX_BORDER_STYLES.DOUBLE;
  const lineWidth = double ? borderWidth / 3 : borderWidth;
  const insets = double ? [borderWidth / 6, (borderWidth * 5) / 6] : [borderWidth / 2];
  const radius = Math.min(num(borderRadius), rect.width / 2, rect.height / 2);
  const paths = [];
  for (const inset of insets) {
    const left = rect.x + inset;
    const top = rect.y + inset;
    const right = rect.x + rect.width - inset;
    const bottom = rect.y + rect.height - inset;
    if (right <= left || bottom <= top) continue;
    if (borderSides === TEMPLATE_TEXT_BOX_BORDER_SIDES.ALL) {
      paths.push({ type: 'RECT', x: left, y: top, width: right - left, height: bottom - top, radius: Math.max(radius - inset, 0), lineWidth });
      continue;
    }
    const sides = borderSides;
    const line = (x1, y1, x2, y2) => paths.push({ type: 'LINE', x1, y1, x2, y2, lineWidth });
    if (sides === 'TOP' || sides === 'TOP_BOTTOM') line(rect.x, top, rect.x + rect.width, top);
    if (sides === 'BOTTOM' || sides === 'TOP_BOTTOM') line(rect.x, bottom, rect.x + rect.width, bottom);
    if (sides === 'LEFT' || sides === 'LEFT_RIGHT') line(left, rect.y, left, rect.y + rect.height);
    if (sides === 'RIGHT' || sides === 'LEFT_RIGHT') line(right, rect.y, right, rect.y + rect.height);
  }
  return paths;
};

// Dash (image layer border jaisa): [dash, space] ya null
export const textBoxDash = (style, lineWidth) => {
  if (style === TEMPLATE_TEXT_BOX_BORDER_STYLES.DASHED) return [lineWidth * 3, lineWidth * 2];
  if (style === TEMPLATE_TEXT_BOX_BORDER_STYLES.DOTTED) return [lineWidth, lineWidth * 1.5];
  return null;
};

export default {
  TEXT_BOX_LINE_HEIGHT,
  resolveTextBox,
  activeTextBox,
  textBoxRect,
  textBoxBorderPaths,
  textBoxDash,
};
