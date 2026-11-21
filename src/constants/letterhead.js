// letterhead.js — Letterhead Studio ke constants (backend constants/letterhead.js se match).

export const LETTERHEAD_MODES = Object.freeze({ SYSTEM_TEMPLATE: 'SYSTEM_TEMPLATE', CUSTOM_UPLOAD: 'CUSTOM_UPLOAD' });

export const LETTERHEAD_SEGMENTS = Object.freeze([
  { value: 'ACADEMIC', label: 'Schools & colleges', short: 'Academic' },
  { value: 'CORPORATE', label: 'Corporate / business', short: 'Corporate' },
  { value: 'LEGAL', label: 'Legal / advocates', short: 'Legal' },
  { value: 'MEDICAL', label: 'Clinics & hospitals', short: 'Medical' },
  { value: 'GOVERNMENT', label: 'Government office', short: 'Government' },
  { value: 'NGO', label: 'NGO / trust', short: 'NGO' },
  { value: 'GENERAL', label: 'General', short: 'General' },
]);
export const SEGMENT_LABEL = Object.fromEntries(LETTERHEAD_SEGMENTS.map((s) => [s.value, s.short]));

export const FONT_FAMILIES = Object.freeze(['Inter', 'Poppins', 'Merriweather', 'Playfair Display', 'Lora', 'Roboto', 'Noto Sans Devanagari']);

export const HEADER_LAYOUTS = Object.freeze([
  { value: 'LEFT_LOGO', label: 'Logo left' },
  { value: 'CENTER_CREST', label: 'Centred crest' },
  { value: 'RIGHT_LOGO', label: 'Logo right' },
]);
export const CONTINUATION_STYLES = Object.freeze([
  { value: 'FULL', label: 'Full header' },
  { value: 'COMPACT', label: 'Compact' },
  { value: 'NONE', label: 'No header' },
]);
export const WATERMARK_TYPES = Object.freeze([
  { value: 'NONE', label: 'None' },
  { value: 'LOGO', label: 'Logo' },
  { value: 'TEXT', label: 'Text' },
]);
export const LOGO_SOURCES = Object.freeze([
  { value: 'SCHOOL_LOGO', label: 'School logo' },
  { value: 'UPLOAD', label: 'Upload' },
  { value: 'NONE', label: 'None' },
]);
export const SIGNATURE_SOURCES = Object.freeze([
  { value: 'SCHOOL_PRINCIPAL_SIGN', label: 'Principal signature (school profile)' },
  { value: 'UPLOAD', label: 'Upload' },
  { value: 'NONE', label: 'None' },
]);
export const STAMP_SOURCES = Object.freeze([
  { value: 'SCHOOL_STAMP', label: 'School stamp (profile)' },
  { value: 'UPLOAD', label: 'Upload' },
  { value: 'NONE', label: 'None' },
]);

export const DEFAULT_REFERENCE_FORMAT = '{CODE}/{YEAR}/{SEQ:4}';
export const REFERENCE_TOKENS = Object.freeze(['{CODE}', '{YEAR}', '{SEQ:4}', '{SEGMENT}']);

// A4 (mm) + safe-zone limits (backend LIMITS jaisa)
export const A4_MM = Object.freeze({ width: 210, height: 297 });
export const MARGIN_LIMITS = Object.freeze({ maxEach: 120, maxVertical: 250, maxHorizontal: 170 });
export const DEFAULT_MARGINS = Object.freeze({ topMm: 45, bottomMm: 25, leftMm: 20, rightMm: 20 });
export const LETTERHEAD_UPLOAD_ACCEPT = '.pdf,.png,.jpg,.jpeg';
export const LETTERHEAD_UPLOAD_MAX_BYTES = 15 * 1024 * 1024;

/** "{CODE}/{YEAR}/{SEQ:4}" → "RPIC0123/2026/0001" (live example) */
export const exampleReference = (format, { code = 'CODE', segment = 'ACADEMIC', seq = 1 } = {}) =>
  String(format || DEFAULT_REFERENCE_FORMAT).replace(/\{([A-Z]+)(?::(\d))?\}/g, (_, token, digits) => {
    if (token === 'CODE') return code;
    if (token === 'YEAR') return String(new Date().getFullYear());
    if (token === 'SEGMENT') return segment;
    if (token === 'SEQ') return String(seq).padStart(Number(digits) || 1, '0');
    return `{${token}}`;
  });

/** Reference format check (backend jaisa): sirf jaane tokens + {SEQ} zaroori */
export const referenceFormatError = (format) => {
  const value = String(format || '');
  if (!value) return null;
  if (!/^[A-Za-z0-9/_\-.{}: ]+$/.test(value)) return 'Use letters, digits, / - _ . and tokens';
  const tokens = [...value.matchAll(/\{([A-Z]+)(?::(\d))?\}/g)].map((m) => m[1]);
  if (/[{}]/.test(value.replace(/\{([A-Z]+)(?::(\d))?\}/g, '')) || tokens.some((t) => !['CODE', 'YEAR', 'SEQ', 'SEGMENT'].includes(t))) return 'Unknown token';
  if (!tokens.includes('SEQ')) return 'Must contain {SEQ} or {SEQ:4}';
  return null;
};

/** Margins check (backend jaisa) */
export const marginsError = (m) => {
  if (!m) return 'Margins are required';
  const vals = [m.topMm, m.bottomMm, m.leftMm, m.rightMm];
  if (vals.some((v) => typeof v !== 'number' || Number.isNaN(v) || v < 0 || v > MARGIN_LIMITS.maxEach)) return `Each margin must be 0–${MARGIN_LIMITS.maxEach} mm`;
  if (m.topMm + m.bottomMm >= MARGIN_LIMITS.maxVertical) return `Top + bottom must be under ${MARGIN_LIMITS.maxVertical} mm`;
  if (m.leftMm + m.rightMm >= MARGIN_LIMITS.maxHorizontal) return `Left + right must be under ${MARGIN_LIMITS.maxHorizontal} mm`;
  return null;
};
