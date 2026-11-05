// themeColors.js — "Shuffle colours" aur "Match my logo colours" ke helpers (pure, canvas wala hissa alag).
// Asli text contrast backend preview sambhalta hai; yahan sirf itna ki header par kuch padhne layak ban sake.
const DARK_TEXT = '#111827';
const WHITE_TEXT = '#FFFFFF';
const WCAG_AA = 4.5;

const SKIP_LIGHT = 235; // Isse upar teeno channel = safed kagaz / background
const SKIP_DARK = 25; // Isse neeche = kaala
const MIN_ALPHA = 128;
const MIN_COLOR_DISTANCE = 48; // Itna paas = ek hi rang
const LOGO_SAMPLE_SIZE = 64;

const toHex = (value) => Math.round(value).toString(16).padStart(2, '0');
const rgbToHex = ([r, g, b]) => `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();

const hexToRgb = (hex) => {
  let h = String(hex).replace('#', '');
  if (h.length === 3) h = h.replace(/./g, '$&$&');
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
};

const luminance = (hex) => {
  const [r, g, b] = hexToRgb(hex).map((value) => {
    const c = value / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const contrast = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

/**
 * Is rang par safed ya kaala text 4.5:1 se padha ja sakta hai?
 * @param {string} hex
 * @returns {boolean}
 */
export const canHoldText = (hex) => Math.max(contrast(hex, WHITE_TEXT), contrast(hex, DARK_TEXT)) >= WCAG_AA;

// Ulta rang (hue 180°): RGB mein max + min se
export const complementaryColor = (hex) => {
  const [r, g, b] = hexToRgb(hex);
  const sum = Math.max(r, g, b) + Math.min(r, g, b);
  return rgbToHex([sum - r, sum - g, sum - b]);
};

/**
 * Shuffle ke sab mel: palette ko ghumao + primary ka ulta rang. Sirf jinke primary par text padha ja sake.
 * @param {{ primary: string, secondary: string, accent: string }} palette - preset ke rang
 * @returns {Array<{ primary: string, secondary: string, accent: string }>}
 */
export const shuffleOptions = ({ primary, secondary, accent }) => {
  const opposite = complementaryColor(primary);
  return [
    { primary: secondary, secondary: accent, accent: primary },
    { primary: accent, secondary: primary, accent: secondary },
    { primary, secondary, accent: opposite },
    { primary: opposite, secondary: primary, accent: secondary },
    { primary, secondary, accent },
  ].filter((option) => canHoldText(option.primary));
};

/**
 * Image ke sabse zyada wale rang: 4-bit buckets. Transparent, safed aur kaale pixel nahi ginte.
 * @param {Uint8ClampedArray|number[]} rgba
 * @param {number} [count]
 * @returns {string[]} hex, zyada wala pehle (kam bhi ho sakte hain)
 */
export const dominantColors = (rgba, count = 3) => {
  const buckets = new Map();
  for (let i = 0; i + 3 < rgba.length; i += 4) {
    const r = rgba[i];
    const g = rgba[i + 1];
    const b = rgba[i + 2];
    if (rgba[i + 3] < MIN_ALPHA) continue;
    if (r > SKIP_LIGHT && g > SKIP_LIGHT && b > SKIP_LIGHT) continue;
    if (r < SKIP_DARK && g < SKIP_DARK && b < SKIP_DARK) continue;
    const key = (r >> 4) * 256 + (g >> 4) * 16 + (b >> 4);
    const bucket = buckets.get(key) || { n: 0, r: 0, g: 0, b: 0 };
    bucket.n += 1;
    bucket.r += r;
    bucket.g += g;
    bucket.b += b;
    buckets.set(key, bucket);
  }

  const picked = [];
  const sorted = [...buckets.values()].sort((a, b) => b.n - a.n);
  for (const bucket of sorted) {
    const color = [bucket.r / bucket.n, bucket.g / bucket.n, bucket.b / bucket.n];
    const isNew = picked.every((p) => Math.hypot(p[0] - color[0], p[1] - color[1], p[2] - color[2]) >= MIN_COLOR_DISTANCE);
    if (isNew) picked.push(color);
    if (picked.length === count) break;
  }
  return picked.map(rgbToHex);
};

/**
 * Logo → primary, secondary, accent. Kam rang milen to wahi dohra do.
 * @param {string[]} colors
 * @returns {{ primary: string, secondary: string, accent: string }|null}
 */
export const paletteFromColors = (colors) => {
  if (!colors.length) return null;
  const [first, second = first, third = second] = colors;
  return { primary: first, secondary: second, accent: third };
};

/**
 * Logo ko chhote canvas par padh kar palette. CORS / load fail ya rang na mile to reject.
 * @param {string} url
 * @returns {Promise<{ primary: string, secondary: string, accent: string }>}
 */
export const readLogoPalette = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = LOGO_SAMPLE_SIZE;
        canvas.height = LOGO_SAMPLE_SIZE;
        const context = canvas.getContext('2d');
        context.drawImage(image, 0, 0, LOGO_SAMPLE_SIZE, LOGO_SAMPLE_SIZE);
        const palette = paletteFromColors(dominantColors(context.getImageData(0, 0, LOGO_SAMPLE_SIZE, LOGO_SAMPLE_SIZE).data));
        if (palette) resolve(palette);
        else reject(new Error('No colours found'));
      } catch (error) {
        reject(error);
      }
    };
    image.onerror = () => reject(new Error('Image failed to load'));
    image.src = url;
  });
