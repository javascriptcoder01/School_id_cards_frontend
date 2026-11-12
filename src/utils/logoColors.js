// logoColors.js — school logo ke 3–5 main rang (browser only).
// Offscreen canvas (max 64×64) → white / black / transparent pixels hata kar simple k-means → bade cluster pehle.
// Image padh na sake (CORS / load fail) → reject; caller "Couldn't read logo colours" dikhata hai.

const SAMPLE = 64;
const MAX_COLORS = 5;
const ITERATIONS = 10;

const toHex = (rgb) => `#${rgb.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')}`.toUpperCase();

const loadImage = (url) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    // Cloudinary CORS deta hai; data: URL par asar nahi
    if (!/^data:/i.test(url)) img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('LOGO_LOAD_FAILED'));
    img.src = url;
  });

// Bahut safed / bahut kaala / bina rang (grey) / transparent pixel nahi chahiye
const usable = (r, g, b, a) => {
  if (a < 128) return false;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const light = (max + min) / 510;
  if (light > 0.92 || light < 0.08) return false;
  return max - min > 18; // grey nahi
};

const distance = (a, b) => (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2;

/**
 * @param {number[][]} pixels - [[r,g,b], …]
 * @returns {{ color: number[], count: number }[]}
 */
const kMeans = (pixels, k) => {
  // Deterministic shuruaat: brightness ke hisaab se sort, barabar doori par k centroids
  const sorted = pixels.slice().sort((a, b) => a[0] + a[1] + a[2] - (b[0] + b[1] + b[2]));
  let centroids = Array.from({ length: k }, (_, i) => sorted[Math.floor(((i + 0.5) * sorted.length) / k)].slice());
  let assignment = new Array(pixels.length).fill(0);
  for (let iter = 0; iter < ITERATIONS; iter += 1) {
    assignment = pixels.map((p) => {
      let best = 0;
      for (let c = 1; c < centroids.length; c += 1) if (distance(p, centroids[c]) < distance(p, centroids[best])) best = c;
      return best;
    });
    centroids = centroids.map((old, c) => {
      const members = pixels.filter((_, i) => assignment[i] === c);
      if (members.length === 0) return old;
      return [0, 1, 2].map((ch) => members.reduce((sum, m) => sum + m[ch], 0) / members.length);
    });
  }
  return centroids
    .map((color, c) => ({ color, count: assignment.filter((a) => a === c).length }))
    .filter((cluster) => cluster.count > 0)
    .sort((a, b) => b.count - a.count);
};

/**
 * @param {string} url - logo URL (http(s) ya data:image)
 * @returns {Promise<string[]>} 1–5 hex colours, sabse zyada wala pehle
 */
export const extractLogoColors = async (url) => {
  if (typeof url !== 'string' || !url.trim()) throw new Error('NO_LOGO');
  const img = await loadImage(url.trim());
  const scale = Math.min(1, SAMPLE / Math.max(img.naturalWidth || 1, img.naturalHeight || 1));
  const w = Math.max(1, Math.round((img.naturalWidth || SAMPLE) * scale));
  const h = Math.max(1, Math.round((img.naturalHeight || SAMPLE) * scale));
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(img, 0, 0, w, h);
  // CORS na ho to yahan SecurityError
  const { data } = ctx.getImageData(0, 0, w, h);

  const pixels = [];
  for (let i = 0; i < data.length; i += 4) {
    if (usable(data[i], data[i + 1], data[i + 2], data[i + 3])) pixels.push([data[i], data[i + 1], data[i + 2]]);
  }
  if (pixels.length < 8) throw new Error('NO_COLOURS');

  const clusters = kMeans(pixels, Math.min(MAX_COLORS, pixels.length));
  // Bahut chhote clusters (< 3%) chhodo, kam se kam ek rakho
  const minCount = pixels.length * 0.03;
  const colors = clusters.filter((c, i) => i === 0 || c.count >= minCount).map((c) => toHex(c.color));
  // Ek jaise rang ek baar
  return colors.filter((hex, i) => colors.indexOf(hex) === i).slice(0, MAX_COLORS);
};

export default { extractLogoColors };
