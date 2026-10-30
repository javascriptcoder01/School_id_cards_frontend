// templateDesigner.js
// Template designer ke helpers: side (front / back) data, save + preview payload, recommended back layout,
// canvas ka turant (optimistic) render, snap / clamp. Theme / decoration ka hisaab yahan NAHI — wo backend karta hai.
import {
  TEMPLATE_SIDES,
  TEMPLATE_UNITS,
  TEMPLATE_FONT_WEIGHTS,
  TEMPLATE_TEXT_ALIGNS,
  TEMPLATE_BACKGROUND_FITS,
  TEMPLATE_BACKGROUND_TYPES,
  TEMPLATE_QR_CONTENT_TYPES,
  TEMPLATE_FONT_STYLES,
  TEMPLATE_TEXT_TRANSFORMS,
  MM_PER_PT,
} from '../constants/template.js';
import { toNumber, round2, clamp, createClientId, lengthForUnit, fontForUnit } from './templateLayout.js';

const DEFAULT_RETURN_NOTE = 'If found, please return to the school address above.';
// PDF (Helvetica) line height ≈ 1.156 × font size; template ka 1.2 = PDF default
const PDF_LINE_HEIGHT = 1.156;

/* ------------------------------------------------------------------ */
/* Sides                                                               */
/* ------------------------------------------------------------------ */

export const isBackSide = (side) => side === TEMPLATE_SIDES.BACK;

const emptyBack = () => ({
  backgroundAssetId: null,
  background: null,
  backgroundFit: TEMPLATE_BACKGROUND_FITS.COVER,
  backgroundType: TEMPLATE_BACKGROUND_TYPES.SOLID,
  fields: [],
  photo: null,
  qrCode: null,
  imageLayers: [],
});

/**
 * Ek side ke elements + background. FRONT = purane top-level fields.
 * @returns {{ fields, photo, qrCode, imageLayers, backgroundAssetId, background, backgroundFit, backgroundType }}
 */
export const sideOf = (formData, side) => {
  if (isBackSide(side)) return formData.back || emptyBack();
  return {
    fields: formData.fields || [],
    photo: formData.photo || null,
    qrCode: formData.qrCode || null,
    imageLayers: formData.imageLayers || [],
    backgroundAssetId: formData.backgroundAssetId || null,
    background: formData.background || null,
    backgroundFit: formData.backgroundFit || TEMPLATE_BACKGROUND_FITS.COVER,
    backgroundType: formData.frontBackgroundType || (formData.background ? TEMPLATE_BACKGROUND_TYPES.IMAGE : TEMPLATE_BACKGROUND_TYPES.SOLID),
  };
};

/**
 * Side ka patch formData mein lagao. FRONT ka backgroundType → frontBackgroundType.
 */
export const applySidePatch = (formData, side, patch) => {
  if (isBackSide(side)) return { ...formData, back: { ...(formData.back || emptyBack()), ...patch } };
  const { backgroundType, ...rest } = patch;
  return {
    ...formData,
    ...rest,
    ...(backgroundType !== undefined ? { frontBackgroundType: backgroundType } : {}),
  };
};

export const newBackSide = emptyBack;

/* ------------------------------------------------------------------ */
/* Payload (save + live preview)                                       */
/* ------------------------------------------------------------------ */

const num = (v, fallback = 0) => round2(toNumber(v, fallback));
const hexOrNull = (v) => (typeof v === 'string' && /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(v.trim()) ? v.trim() : null);

const fieldPayload = (f) => ({
  field: f.field,
  label: f.label?.trim() || null,
  x: num(f.x),
  y: num(f.y),
  width: f.width === null || f.width === '' || f.width === undefined ? null : num(f.width),
  fontSize: num(f.fontSize, 12),
  fontWeight: f.fontWeight || TEMPLATE_FONT_WEIGHTS.NORMAL,
  fontFamily: f.fontFamily || 'Arial',
  color: f.color || '#000000',
  textAlign: f.textAlign || TEMPLATE_TEXT_ALIGNS.LEFT,
  maxLines: Math.round(toNumber(f.maxLines, 1)),
  visible: f.visible !== false,
  customText: f.field === 'customText' ? f.customText?.trim() || '' : null,
  fontStyle: f.fontStyle || TEMPLATE_FONT_STYLES.NORMAL,
  textTransform: f.textTransform || TEMPLATE_TEXT_TRANSFORMS.NONE,
  letterSpacing: num(f.letterSpacing, 0),
  lineHeight: num(f.lineHeight, 1.2),
  showLabel: f.showLabel !== false,
  labelColor: f.labelColor || null,
});

const photoPayload = (p) =>
  p
    ? {
      x: num(p.x),
      y: num(p.y),
      width: num(p.width),
      height: num(p.height),
      shape: p.shape,
      borderRadius: num(p.borderRadius),
      borderWidth: num(p.borderWidth),
      borderColor: p.borderColor || null,
      objectFit: p.objectFit,
      visible: p.visible !== false,
    }
    : null;

const qrPayload = (q) =>
  q
    ? {
      x: num(q.x),
      y: num(q.y),
      width: num(q.width),
      height: num(q.height),
      visible: q.visible !== false,
      contentType: q.contentType || TEMPLATE_QR_CONTENT_TYPES.STUDENT_VERIFICATION,
      customText: q.contentType === TEMPLATE_QR_CONTENT_TYPES.CUSTOM_TEXT ? q.customText?.trim() || '' : null,
      foregroundColor: q.foregroundColor || '#000000',
      backgroundColor: q.backgroundColor || '#FFFFFF',
      padding: num(q.padding, 0),
    }
    : null;

// url nahi bhejte — backend asset se copy karta hai. Saved layers apna _id rakhte hain.
const layersPayload = (layers) =>
  (layers || []).map((l) => ({
    ...(l._id ? { _id: l._id } : {}),
    type: l.type,
    assetId: String(l.assetId),
    x: num(l.x),
    y: num(l.y),
    width: num(l.width),
    height: num(l.height),
    opacity: num(l.opacity, 1),
    rotation: num(l.rotation),
    zIndex: Math.round(toNumber(l.zIndex, 10)),
    visible: l.visible !== false,
  }));

const themePayload = (theme = {}) => ({
  presetKey: theme.presetKey,
  colors: Object.fromEntries(
    ['primary', 'secondary', 'accent', 'background', 'text', 'mutedText', 'onPrimary'].map((key) => [key, hexOrNull(theme.colors?.[key])])
  ),
  background: {
    type: theme.background?.type || null,
    gradient: {
      angle: theme.background?.gradient?.angle ?? null,
      from: hexOrNull(theme.background?.gradient?.from),
      to: hexOrNull(theme.background?.gradient?.to),
    },
  },
  frontDecoration: theme.frontDecoration || null,
  backDecoration: theme.backDecoration || null,
  decorationIntensity: theme.decorationIntensity ?? null,
});

/**
 * Poora template (front + back + theme + validity) — save aur preview-render dono.
 */
export const buildTemplatePayload = (formData) => {
  const back = formData.hasBack ? formData.back || emptyBack() : null;
  return {
    name: formData.name?.trim() || '',
    orientation: formData.orientation,
    unit: formData.unit,
    width: num(formData.width),
    height: num(formData.height),
    // Letterhead asset ho to backend uska url `background` mein khud copy karta hai
    backgroundAssetId: formData.backgroundAssetId || null,
    background: formData.backgroundAssetId ? undefined : formData.background || null,
    backgroundFit: formData.backgroundFit,
    logo: formData.logo || null,
    primaryColor: formData.primaryColor?.trim() || null,
    secondaryColor: formData.secondaryColor?.trim() || null,
    fields: (formData.fields || []).map(fieldPayload),
    photo: photoPayload(formData.photo),
    qrCode: qrPayload(formData.qrCode),
    imageLayers: layersPayload(formData.imageLayers),
    theme: themePayload(formData.theme),
    frontBackgroundType: formData.frontBackgroundType || undefined,
    hasBack: Boolean(formData.hasBack),
    back: back
      ? {
        backgroundAssetId: back.backgroundAssetId || null,
        background: back.backgroundAssetId ? undefined : back.background || null,
        backgroundFit: back.backgroundFit || TEMPLATE_BACKGROUND_FITS.COVER,
        backgroundType: back.backgroundType || TEMPLATE_BACKGROUND_TYPES.SOLID,
        fields: (back.fields || []).map(fieldPayload),
        photo: photoPayload(back.photo),
        qrCode: qrPayload(back.qrCode),
        imageLayers: layersPayload(back.imageLayers),
      }
      : undefined,
    validity:
      formData.validity?.session || formData.validity?.validTill
        ? { session: formData.validity.session?.trim() || null, validTill: formData.validity.validTill || null }
        : null,
  };
};

/* ------------------------------------------------------------------ */
/* Element geometry (canvas overlay)                                   */
/* ------------------------------------------------------------------ */

// Font size template units mein (MM: pt → mm; PX: as is)
export const fontUnitsOf = (fontSize, unit) =>
  unit === TEMPLATE_UNITS.MM ? toNumber(fontSize, 12) * MM_PER_PT : toNumber(fontSize, 12);

/**
 * Text field ka box (PDF jaisa: width na ho to card ke right edge tak; height = lines × line height)
 */
export const fieldBox = (field, unit, cardWidth) => {
  const fontUnits = fontUnitsOf(field.fontSize, unit);
  const lineHeight = PDF_LINE_HEIGHT + (toNumber(field.lineHeight, 1.2) - 1.2);
  const maxLines = Math.max(1, Math.round(toNumber(field.maxLines, 1)));
  const x = toNumber(field.x);
  return {
    x,
    y: toNumber(field.y),
    width: field.width ? toNumber(field.width) : Math.max(cardWidth - x, 1),
    height: Math.max(fontUnits * lineHeight * maxLines, fontUnits),
    autoWidth: !field.width,
  };
};

// Snap grid: 8 px ya 2 mm
export const gridFor = (unit) => (unit === TEMPLATE_UNITS.MM ? 2 : 8);
// Arrow key: 1 px (Shift 10) / 0.5 mm (Shift 5)
export const nudgeFor = (unit, big) => (unit === TEMPLATE_UNITS.MM ? (big ? 5 : 0.5) : big ? 10 : 1);

export const snapTo = (value, grid) => round2(Math.round(value / grid) * grid);

/**
 * Box card ke andar (x, y ≥ 0; x + w ≤ W; y + h ≤ H)
 */
export const clampBox = (box, cardWidth, cardHeight, minSize = 1) => {
  const width = clamp(box.width, minSize, cardWidth);
  const height = clamp(box.height, minSize, cardHeight);
  return {
    x: round2(clamp(box.x, 0, cardWidth - width)),
    y: round2(clamp(box.y, 0, cardHeight - height)),
    width: round2(width),
    height: round2(height),
  };
};

/* ------------------------------------------------------------------ */
/* Optimistic canvas: aakhri preview ka content + draft ki position/style */
/* ------------------------------------------------------------------ */

const placeholderValue = (f) => (f.field === 'customText' ? f.customText || 'Custom text' : `[${f.field}]`);

/**
 * Preview aane tak canvas draft ke hisaab se turant badle: content (values, photo, QR data, theme)
 * aakhri backend preview se, position / size / style draft se.
 */
export const mergeDraftIntoRender = (renderData, formData, side) => {
  if (!renderData?.sides) return renderData;
  const key = isBackSide(side) ? 'back' : 'front';
  const draft = sideOf(formData, side);
  if (isBackSide(side) && !formData.hasBack) return renderData;

  const W = toNumber(formData.width);
  const H = toNumber(formData.height);
  const unit = formData.unit;
  const base = renderData.sides[key] || {
    side,
    background: { type: TEMPLATE_BACKGROUND_TYPES.SOLID, color: '#FFFFFF', gradient: null, image: null },
    decorations: [],
    fields: [],
    photo: null,
    qrCode: null,
    imageLayers: [],
  };

  const fields = (draft.fields || []).map((f, i) => {
    const rendered = base.fields?.[i]?.field === f.field ? base.fields[i] : null;
    const upper = f.textTransform === TEMPLATE_TEXT_TRANSFORMS.UPPERCASE;
    let value = f.field === 'customText' ? f.customText || '' : rendered?.displayValue ?? placeholderValue(f);
    if (upper && typeof value === 'string') value = value.toUpperCase();
    const draftColor = f.color || '#000000';
    return {
      ...(rendered || { kind: 'TEXT' }),
      field: f.field,
      label: f.showLabel === false ? null : f.label?.trim() || rendered?.label || null,
      displayValue: value,
      x: f.x,
      y: f.y,
      width: f.width ?? null,
      fontSize: f.fontSize,
      fontWeight: f.fontWeight,
      fontStyle: f.fontStyle,
      // Default kaala → backend ka readable color (dark theme) rakho
      color: rendered && draftColor.toUpperCase() === '#000000' ? rendered.color : draftColor,
      textAlign: f.textAlign,
      maxLines: f.maxLines,
      visible: f.visible !== false,
      letterSpacing: f.letterSpacing,
      lineHeight: f.lineHeight,
      labelColor: f.labelColor || null,
    };
  });

  const photo = draft.photo ? { source: base.photo?.source || null, ...draft.photo } : null;
  const qrCode = draft.qrCode ? { data: base.qrCode?.data || 'Preview', source: null, ...draft.qrCode } : null;
  const imageLayers = (draft.imageLayers || []).map((l) => ({
    id: l._id || l.clientId,
    type: l.type,
    source: l.url,
    x: l.x,
    y: l.y,
    width: l.width,
    height: l.height,
    opacity: l.opacity,
    rotation: l.rotation,
    zIndex: l.zIndex,
    visible: l.visible !== false,
  }));

  return {
    ...renderData,
    template: { ...renderData.template, width: W, height: H, unit },
    sides: {
      ...renderData.sides,
      [key]: { ...base, side, width: W, height: H, unit, fields, photo, qrCode, imageLayers },
    },
  };
};

/* ------------------------------------------------------------------ */
/* Recommended back layout                                             */
/* ------------------------------------------------------------------ */

/**
 * Back side ka recommended layout, card size ke hisaab se:
 * QR (school details) upar, school name / address / numbers, student details, session / valid till,
 * return note, principal signature + "Principal".
 * Jagah kam ho to kam zaroori lines chhoot jaati hain (priority order).
 *
 * @param {{ unit, width, height }} card
 * @param {{ signatureAsset?: object, returnNote?: string }} [options]
 * @returns {object} back side (fields, qrCode, imageLayers…)
 */
export const buildRecommendedBackLayout = ({ unit, width, height }, { signatureAsset = null, returnNote = null } = {}) => {
  const W = toNumber(width);
  const H = toNumber(height);
  const isLandscape = W > H;
  const short = Math.min(W, H);
  const margin = round2(short * 0.05);

  // Font: MM → pt, PX → px (fontUnitsOf se template units)
  const baseFont = round2(unit === TEMPLATE_UNITS.MM ? clamp(short * 0.12, 5, 9) : clamp(short * 0.028, 10, 28));
  const lineStep = (font, lines = 1) => fontUnitsOf(font, unit) * 1.3 * lines;
  const qrPadding = lengthForUnit(0.5, unit);

  // QR: portrait = upar beech mein, landscape = right side
  const qrSize = round2(isLandscape ? H * 0.42 : W * 0.34);
  const qrCode = {
    x: round2(isLandscape ? W - qrSize - margin : (W - qrSize) / 2),
    y: margin,
    width: qrSize,
    height: qrSize,
    visible: true,
    contentType: TEMPLATE_QR_CONTENT_TYPES.SCHOOL_DETAILS,
    customText: null,
    foregroundColor: '#000000',
    backgroundColor: '#FFFFFF',
    padding: qrPadding,
  };

  const textX = margin;
  const textWidth = round2(isLandscape ? W - qrSize - margin * 3 : W - margin * 2);
  let y = isLandscape ? margin : round2(margin + qrSize + margin * 0.6);

  // Neeche: footer decoration (wave / band) ke liye jagah, uske upar signature, uske upar return note
  const bottomReserve = round2(H * 0.15);
  const signatureHeight = round2(short * 0.14);
  const sigY = round2(H - bottomReserve - signatureHeight);
  const footerTop = round2(sigY - lineStep(baseFont * 0.85));
  const fields = [];

  const make = (field, opts = {}) => ({
    field,
    label: opts.label ?? '',
    x: textX,
    y: round2(y),
    width: opts.width ?? textWidth,
    fontSize: round2(opts.fontSize ?? baseFont),
    fontWeight: opts.bold ? TEMPLATE_FONT_WEIGHTS.BOLD : TEMPLATE_FONT_WEIGHTS.NORMAL,
    fontFamily: 'Arial',
    color: '#000000',
    textAlign: opts.align || (isLandscape ? TEMPLATE_TEXT_ALIGNS.LEFT : TEMPLATE_TEXT_ALIGNS.CENTER),
    maxLines: opts.lines || 1,
    visible: true,
    customText: opts.customText ?? null,
    fontStyle: opts.italic ? TEMPLATE_FONT_STYLES.ITALIC : TEMPLATE_FONT_STYLES.NORMAL,
    textTransform: TEMPLATE_TEXT_TRANSFORMS.NONE,
    letterSpacing: 0,
    lineHeight: 1.2,
    showLabel: opts.showLabel ?? true,
    labelColor: null,
  });

  // Priority order — jagah khatam to baaki chhoot jaate hain
  const rows = [
    { field: 'collegeName', bold: true, fontSize: baseFont * 1.25, showLabel: false },
    { field: 'collegeAddress', lines: 2, showLabel: false },
    { field: 'emergencyNumber' },
    { field: 'tollFreeNumber' },
    { field: 'receptionNumber' },
    { field: 'guardianName', label: 'Guardian' },
    { field: 'guardianPhone', label: 'Guardian Ph' },
    { field: 'bloodGroup' },
    { field: 'collegeEmail' },
    { field: 'collegeWebsite' },
    { field: 'studentAddress', lines: 2 },
    { field: 'session' },
    { field: 'validTill' },
  ];

  for (const row of rows) {
    const step = lineStep(row.fontSize ?? baseFont, row.lines || 1);
    if (y + step > footerTop) break;
    fields.push(make(row.field, row));
    y += step;
  }

  // Return note (footer ke upar, italic, poori chaudai)
  y = footerTop;
  fields.push(
    make('customText', {
      customText: returnNote || DEFAULT_RETURN_NOTE,
      italic: true,
      fontSize: baseFont * 0.85,
      width: round2(W - margin * 2),
      align: TEMPLATE_TEXT_ALIGNS.CENTER,
      lines: 1,
    })
  );
  fields[fields.length - 1].x = margin;

  // Principal signature (asset ho to) + "Principal" text uske neeche
  const imageLayers = [];
  const sigWidth = round2(short * 0.36);
  const sigX = round2(W - sigWidth - margin);
  if (signatureAsset) {
    imageLayers.push({
      clientId: createClientId(),
      type: 'SIGNATURE',
      assetId: signatureAsset._id,
      url: signatureAsset.url,
      x: sigX,
      y: round2(sigY - signatureHeight * 0.35),
      width: sigWidth,
      height: round2(signatureHeight * 0.75),
      opacity: 1,
      rotation: 0,
      zIndex: 11,
      visible: true,
    });
  }
  y = round2(sigY + signatureHeight * 0.45);
  fields.push(
    make('customText', {
      customText: 'Principal',
      width: sigWidth,
      align: TEMPLATE_TEXT_ALIGNS.CENTER,
      fontSize: baseFont * 0.85,
      bold: true,
    })
  );
  fields[fields.length - 1].x = sigX;

  return {
    ...emptyBack(),
    fields,
    qrCode,
    imageLayers,
  };
};

// Default text size naye field ke liye (MM 8pt, PX ~11px)
export const defaultFontSize = (unit) => fontForUnit(8, unit);
