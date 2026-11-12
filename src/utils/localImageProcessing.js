// localImageProcessing.js — background removal un images ke liye jo Cloudinary par nahi hain (base64 "data:image/...").
// Pixel logic BILKUL Backend/src/utils/localImageProcessing.js jaisa (preview = print) — ek badle to doosra bhi.
// Cloudinary images ka tareeka (backend ka processed URL) waisa hi hai.

const LOCAL_IMAGE_URL = /^data:image\/(png|jpe?g|webp);base64,/i;
export const LOCAL_PROCESSING_MAX_SIDE = 1600;
const TRIM_ALPHA = 8;
const CACHE_LIMIT = 40;

export const LOCAL_PROCESSING_MODE = 'LOCAL';

export const isLocalProcessableUrl = (url) => typeof url === 'string' && LOCAL_IMAGE_URL.test(url.trim());

// Backend localProcessingSettings jaisa (draft layer → render settings)
export const localProcessingSettings = (settings) => ({
  removeColor: settings.removeColor || '#FFFFFF',
  tolerance: Number(settings.tolerance) || 0,
  trim: settings.trim !== false,
  inkColor: settings.inkColor || null,
  inkStrength: Number(settings.inkStrength) || 0,
  contrast: Number(settings.contrast) || 0,
  sharpen: Number(settings.sharpen) || 0,
});

const hexToRgb = (hex) => {
  let value = String(hex || '#FFFFFF').replace('#', '');
  if (value.length === 3) value = value.replace(/./g, '$&$&');
  const n = Number.parseInt(value, 16);
  return Number.isFinite(n) ? [(n >> 16) & 255, (n >> 8) & 255, n & 255] : [255, 255, 255];
};

const clampByte = (v) => (v < 0 ? 0 : v > 255 ? 255 : Math.round(v));

/**
 * RGBA pixels par saare steps (pure). data badal jata hai; trim ka box lautata hai.
 * @param {Uint8ClampedArray} data
 * @param {number} width
 * @param {number} height
 * @param {object} settings - localProcessingSettings()
 * @returns {{ data: Uint8ClampedArray, width: number, height: number }}
 */
export const processPixels = (data, width, height, settings) => {
  const [rr, rg, rb] = hexToRgb(settings.removeColor);
  // Tolerance % = RGB doori (0 = sirf wahi rang, 100 = sab)
  const maxDistance = Math.sqrt(3) * 255;
  const limit = (Math.min(Math.max(settings.tolerance, 0), 100) / 100) * maxDistance;
  const limitSq = limit * limit;
  // Naram kinara: limit se aage aadhi limit tak dheere-dheere dikhe (kate hue / daanedar kinare nahi)
  const feather = limit * 0.5;
  const outer = limit + feather;
  const outerSq = outer * outer;

  // 1. Rang hatao
  for (let i = 0; i < data.length; i += 4) {
    const dr = data[i] - rr;
    const dg = data[i + 1] - rg;
    const db = data[i + 2] - rb;
    const distSq = dr * dr + dg * dg + db * db;
    if (distSq <= limitSq) {
      data[i + 3] = 0;
    } else if (feather > 0 && distSq < outerSq) {
      const dist = Math.sqrt(distSq);
      data[i + 3] = clampByte(data[i + 3] * ((dist - limit) / feather));
      // Kinare ka rang kagaz se door (ink jaisa), taaki safed jhalak na rahe
      const push = outer / dist;
      data[i] = clampByte(rr + dr * push);
      data[i + 1] = clampByte(rg + dg * push);
      data[i + 2] = clampByte(rb + db * push);
    }
  }

  // 2. Trim (khaali kinare)
  let x0 = 0;
  let y0 = 0;
  let x1 = width - 1;
  let y1 = height - 1;
  if (settings.trim) {
    x0 = width;
    y0 = height;
    x1 = -1;
    y1 = -1;
    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        if (data[(y * width + x) * 4 + 3] > TRIM_ALPHA) {
          if (x < x0) x0 = x;
          if (x > x1) x1 = x;
          if (y < y0) y0 = y;
          if (y > y1) y1 = y;
        }
      }
    }
    // Sab kuch hat gaya (tolerance bahut zyada) → poori image rakho, khaali card se behtar
    if (x1 < 0) {
      x0 = 0;
      y0 = 0;
      x1 = width - 1;
      y1 = height - 1;
    }
  }
  const outW = x1 - x0 + 1;
  const outH = y1 - y0 + 1;
  const out = new Uint8ClampedArray(outW * outH * 4);
  for (let y = 0; y < outH; y += 1) {
    const from = ((y + y0) * width + x0) * 4;
    out.set(data.subarray(from, from + outW * 4), y * outW * 4);
  }

  // 3. Ink colour (bacha hua rang us colour ki taraf)
  const ink = settings.inkColor ? hexToRgb(settings.inkColor) : null;
  const inkMix = ink ? Math.min(Math.max(settings.inkStrength, 0), 100) / 100 : 0;
  // 4. Contrast (-100..100)
  const c = Math.min(Math.max(settings.contrast, -100), 100) * 2.55;
  const contrastFactor = c ? (259 * (c + 255)) / (255 * (259 - c)) : 1;

  if (inkMix > 0 || contrastFactor !== 1) {
    for (let i = 0; i < out.length; i += 4) {
      if (out[i + 3] === 0) continue;
      for (let ch = 0; ch < 3; ch += 1) {
        let v = out[i + ch];
        if (inkMix > 0) v += (ink[ch] - v) * inkMix;
        if (contrastFactor !== 1) v = contrastFactor * (v - 128) + 128;
        out[i + ch] = clampByte(v);
      }
    }
  }

  // 5. Sharpen (0..400): 3×3 unsharp, sirf dikhne wale pixels
  const amount = Math.min(Math.max(settings.sharpen, 0), 400) / 400;
  if (amount > 0 && outW > 2 && outH > 2) {
    const src = out.slice();
    for (let y = 1; y < outH - 1; y += 1) {
      for (let x = 1; x < outW - 1; x += 1) {
        const i = (y * outW + x) * 4;
        if (src[i + 3] === 0) continue;
        for (let ch = 0; ch < 3; ch += 1) {
          const centre = src[i + ch];
          const edge = 4 * centre - src[i - 4 + ch] - src[i + 4 + ch] - src[i - outW * 4 + ch] - src[i + outW * 4 + ch];
          out[i + ch] = clampByte(centre + edge * amount);
        }
      }
    }
  }

  return { data: out, width: outW, height: outH };
};

// Badi base64 string ka chhota hash (cache key)
const hashString = (text) => {
  let h = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(36) + text.length.toString(36);
};

const cache = new Map();

const loadBrowserImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Image could not be loaded'));
    image.src = url;
  });

/**
 * Base64 image → processed PNG ka data URL (browser canvas; memory cache).
 * data:image URL hi — card (IdCardSide) sirf http / data:image draw karta hai, blob: nahi.
 * @param {string} url - data:image/... (isLocalProcessableUrl)
 * @param {object} settings - localProcessingSettings()
 * @returns {Promise<string>}
 */
export const processImageUrlLocally = (url, settings) => {
  const key = `${hashString(url)}|${JSON.stringify(settings)}`;
  if (cache.has(key)) return cache.get(key);

  const pending = (async () => {
    const image = await loadBrowserImage(url);
    const scale = Math.min(1, LOCAL_PROCESSING_MAX_SIDE / Math.max(image.naturalWidth, image.naturalHeight));
    const width = Math.max(1, Math.round(image.naturalWidth * scale));
    const height = Math.max(1, Math.round(image.naturalHeight * scale));
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(image, 0, 0, width, height);
    const { data } = ctx.getImageData(0, 0, width, height);
    const result = processPixels(data, width, height, settings);
    const out = document.createElement('canvas');
    out.width = result.width;
    out.height = result.height;
    const outCtx = out.getContext('2d');
    const imageData = outCtx.createImageData(result.width, result.height);
    imageData.data.set(result.data);
    outCtx.putImageData(imageData, 0, 0);
    const dataUrl = out.toDataURL('image/png');
    if (!dataUrl.startsWith('data:image/png')) throw new Error('Image could not be processed');
    return dataUrl;
  })();

  cache.set(key, pending);
  // Purani entries hatao
  if (cache.size > CACHE_LIMIT) cache.delete(cache.keys().next().value);
  pending.catch(() => cache.delete(key));
  return pending;
};
