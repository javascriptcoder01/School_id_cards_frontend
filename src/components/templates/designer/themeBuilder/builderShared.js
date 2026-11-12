// builderShared.js — Theme Builder UI ke chhote shared helpers (pure)
import { renderLayersSvg, svgToDataUrl } from '@app/theme-engine';

export const labelClass = 'block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1';
export const subTitleClass = 'text-[11px] font-bold text-slate-600';
export const smallButtonClass =
  'inline-flex items-center justify-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40';
export const iconButtonClass =
  'inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-30';
export const activeGradientClass = 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-sm';

export const chipClass = (active) =>
  `shrink-0 whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] font-semibold ${active ? 'border-indigo-300 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`;

// Transparency dikhane ke liye checkerboard (thumbnails ke peeche)
export const CHECKER_STYLE = {
  backgroundImage: 'repeating-conic-gradient(#e2e8f0 0% 25%, #ffffff 0% 50%)',
  backgroundSize: '8px 8px',
};

/**
 * Kuch layers ka chhota preview (data URL). Shared renderer — card jaisa hi.
 * @param {object[]} layers
 * @param {object} roles
 * @param {number} [width]
 * @param {number} [height]
 */
export const layersPreviewUrl = (layers, roles, width = 60, height = 40) =>
  svgToDataUrl(renderLayersSvg({ layers, roles, width, height, idPrefix: 'tb-' }));

export const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
export const round3 = (value) => Math.round(value * 1000) / 1000;

const hexToRgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));

/**
 * Layer colour → CSS rgba (role ya hex, alpha ke saath)
 * @param {{ role?: string, hex?: string, alpha?: number }} color
 * @param {object} roles
 */
export const cssColor = (color, roles) => {
  const hex = color?.role ? roles?.[color.role] : color?.hex;
  if (!/^#[0-9a-f]{6}$/i.test(hex || '')) return 'transparent';
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${color?.alpha ?? 1})`;
};
