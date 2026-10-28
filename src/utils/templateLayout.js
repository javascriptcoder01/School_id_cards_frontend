import {
    TEMPLATE_UNITS,
    PX_PER_MM,
    MM_PER_PT,
    PX_PER_PT,
    IMAGE_LAYER_MAX_URL_LENGTH,
} from '../constants/template.js';

export const toNumber = (value, fallback = 0) => {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
};

export const round2 = (n) => Math.round(n * 100) / 100;

export const clamp = (n, min, max) => Math.min(Math.max(n, min), max);

/** New (unsaved) image layers get a client key; saved ones use their Mongo _id */
export const createClientId = () =>
    `tmp-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export const getLayerKey = (layer) => String(layer?._id || layer?.clientId || '');

/** Card ki width ke % mein position */
export const pct = (value, total) => `${(toNumber(value) / (toNumber(total) || 1)) * 100}%`;

/**
 * Font size ko card-relative unit (cqw) mein badalta hai, taaki zoom par bhi sahi dikhe.
 * MM template: fontSize = pt.  PX template: fontSize = px.
 */
export const fontSizeToCqw = (fontSize, unit, cardWidth) => {
    const size = toNumber(fontSize, 12);
    const width = toNumber(cardWidth, 86) || 86;
    const sizeInCardUnits = unit === TEMPLATE_UNITS.MM ? size * MM_PER_PT : size;
    return (sizeInCardUnits / width) * 100;
};

/** Card units (borderRadius, borderWidth) -> cqw */
export const unitsToCqw = (value, cardWidth) =>
    (toNumber(value) / (toNumber(cardWidth, 86) || 86)) * 100;

/**
 * Backend ke pre('validate') jaisa hi check:
 * x + width > cardWidth ya y + height > cardHeight => bahar
 */
export const getOutOfBoundsElements = (template) => {
    const cardWidth = toNumber(template.width);
    const cardHeight = toNumber(template.height);
    if (!cardWidth || !cardHeight) return [];

    const outside = [];
    const check = (label, el) => {
        if (!el) return;
        const w = toNumber(el.width);
        const h = toNumber(el.height);
        if (toNumber(el.x) + w > cardWidth || toNumber(el.y) + h > cardHeight) outside.push(label);
    };

    (template.fields || []).forEach((f) => check(`Field "${f.field}"`, f));
    check('Photo', template.photo);
    check('QR Code', template.qrCode);
    (template.imageLayers || []).forEach((layer, i) =>
        check(`Image layer ${i + 1} (${layer.type})`, layer)
    );

    return outside;
};

/** Asset jo template layer / letterhead mein use ho sakta hai */
export const isUsableAsset = (asset) =>
    Boolean(
        asset &&
        asset.isActive !== false &&
        typeof asset.url === 'string' &&
        /^https?:\/\//i.test(asset.url) &&
        asset.url.length <= IMAGE_LAYER_MAX_URL_LENGTH
    );

export const isSafeImageUrl = (url) => {
    if (!url || typeof url !== 'string') return false;
    const trimmed = url.trim().toLowerCase();
    return (
        (trimmed.startsWith('http://') ||
            trimmed.startsWith('https://') ||
            trimmed.startsWith('/') ||
            trimmed.startsWith('data:image/')) &&
        !trimmed.includes('<script')
    );
};

/**
 * Poore template ko ek unit se doosre mein convert karta hai (positions, sizes, font).
 */
export const convertTemplateUnits = (template, fromUnit, toUnit) => {
    if (fromUnit === toUnit) return template;

    const toPx = toUnit === TEMPLATE_UNITS.PX;
    const lengthFactor = toPx ? PX_PER_MM : 1 / PX_PER_MM;
    // MM: pt, PX: px
    const fontFactor = toPx ? PX_PER_PT : 1 / PX_PER_PT;

    const len = (v) => (v === null || v === undefined || v === '' ? v : round2(toNumber(v) * lengthFactor));
    const box = (el) =>
        el ? { ...el, x: len(el.x), y: len(el.y), width: len(el.width), height: len(el.height) } : el;

    return {
        ...template,
        unit: toUnit,
        width: len(template.width),
        height: len(template.height),
        fields: (template.fields || []).map((f) => ({
            ...f,
            x: len(f.x),
            y: len(f.y),
            width: len(f.width),
            fontSize: round2(toNumber(f.fontSize, 12) * fontFactor),
        })),
        photo: template.photo
            ? {
                ...box(template.photo),
                borderRadius: len(template.photo.borderRadius),
                borderWidth: len(template.photo.borderWidth),
            }
            : template.photo,
        qrCode: box(template.qrCode),
        imageLayers: (template.imageLayers || []).map(box),
    };
};

/** Default sizes MM mein likhe hain; PX card ke liye convert */
export const lengthForUnit = (mmValue, unit) =>
    unit === TEMPLATE_UNITS.PX ? round2(mmValue * PX_PER_MM) : mmValue;

export const fontForUnit = (pt, unit) => (unit === TEMPLATE_UNITS.PX ? round2(pt * PX_PER_PT) : pt);