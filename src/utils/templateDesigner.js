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
  TEMPLATE_IMAGE_SOURCES,
  TEMPLATE_IMAGE_ALIGNS,
  TEMPLATE_IMAGE_LAYER_DEFAULTS,
  TEMPLATE_IMAGE_STYLE_DEFAULTS,
  TEMPLATE_IMAGE_PADDING_MAX,
  PROFILE_IMAGE_MAX_ROTATION,
  IMAGE_LAYER_MAX_ROTATION,
  MM_PER_PT,
  isProfileImageLayer,
  TEMPLATE_FIELD_DISPLAY_MODES,
  TEMPLATE_FIELD_DISPLAY_MODE_VALUES,
  TEMPLATE_ICON_SOURCES,
  TEMPLATE_ICON_POSITIONS,
  TEMPLATE_ICON_POSITION_VALUES,
  TEMPLATE_VALUE_SOURCES,
  TEMPLATE_SCHOOL_VALUE_FIELDS,
  TEMPLATE_FIELD_LABELS,
} from '../constants/template.js';
import { toNumber, round2, clamp, createClientId, lengthForUnit, fontForUnit } from './templateLayout.js';

/**
 * Layer ke frame + fit fields, purani layer par defaults ke saath (payload + canvas dono yahi lete hain)
 */
export const imageLayerStyleOf = (layer) => ({
  fit: layer.fit || TEMPLATE_IMAGE_STYLE_DEFAULTS.fit,
  shape: layer.shape || TEMPLATE_IMAGE_STYLE_DEFAULTS.shape,
  borderRadius: toNumber(layer.borderRadius),
  borderWidth: toNumber(layer.borderWidth),
  borderColor: layer.borderColor || null,
  borderStyle: layer.borderStyle || TEMPLATE_IMAGE_STYLE_DEFAULTS.borderStyle,
  padding: toNumber(layer.padding),
  backgroundColor: layer.backgroundColor || null,
  flipX: layer.flipX === true,
  flipY: layer.flipY === true,
});

/**
 * Padding ki upar ki had: dono taraf se katne ke baad image ke liye jagah bache
 * (backend bhi padding × 2 < chhoti side maangta hai, warna preview 400 deta)
 */
export const maxLayerPadding = (layer) =>
  round2(Math.min(Math.min(toNumber(layer.width), toNumber(layer.height)) * 0.45, TEMPLATE_IMAGE_PADDING_MAX));

/**
 * Size badalne par padding bhi us had ke andar
 * @returns {object} layer (padding theek ho to wahi object)
 */
export const fitLayerPadding = (layer) => {
  const padding = toNumber(layer.padding);
  const max = maxLayerPadding(layer);
  return padding > max ? { ...layer, padding: max } : layer;
};

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

/* ------------------------------------------------------------------ */
/* Field icon + custom value (naye optional props; purane fields par sab null)  */
/* ------------------------------------------------------------------ */

const numOrNull = (v) => (v === null || v === undefined || v === '' || !Number.isFinite(Number(v)) ? null : round2(Number(v)));

/**
 * Field ka icon (API / draft se) → saaf object ya null. LIBRARY par key, UPLOAD par url + publicId.
 */
export const normalizeFieldIcon = (icon) => {
  if (!icon || typeof icon !== 'object') return null;
  const isUpload = icon.source === TEMPLATE_ICON_SOURCES.UPLOAD;
  return {
    source: isUpload ? TEMPLATE_ICON_SOURCES.UPLOAD : TEMPLATE_ICON_SOURCES.LIBRARY,
    key: isUpload ? null : icon.key || null,
    url: isUpload ? icon.url || null : null,
    publicId: isUpload ? icon.publicId || null : null,
    color: hexOrNull(icon.color),
    size: numOrNull(icon.size),
    position: TEMPLATE_ICON_POSITION_VALUES.includes(icon.position) ? icon.position : TEMPLATE_ICON_POSITIONS.LEFT,
    gap: numOrNull(icon.gap),
    background: hexOrNull(icon.background),
  };
};

// Backend sirf apne source wali keys leta hai (baaki strip / reject)
const fieldIconPayload = (icon) => {
  const n = normalizeFieldIcon(icon);
  if (!n) return null;
  const { key, url, publicId, ...rest } = n;
  if (n.source === TEMPLATE_ICON_SOURCES.UPLOAD) return n.url ? { ...rest, url, publicId } : null;
  return key ? { ...rest, key } : null;
};

export const isSchoolValueField = (field) => TEMPLATE_SCHOOL_VALUE_FIELDS.includes(field);

/** School field "Custom" par hai par value khaali */
export const isCustomValueMissing = (f) =>
  isSchoolValueField(f.field) && f.valueSource === TEMPLATE_VALUE_SOURCES.CUSTOM && !String(f.customValue ?? '').trim();

// Custom value: aage-peeche ke space hatao, beech ki line breaks rakho
const cleanCustomValue = (value) => (typeof value === 'string' ? value.trim() : '') || null;

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
  displayMode: TEMPLATE_FIELD_DISPLAY_MODE_VALUES.includes(f.displayMode) ? f.displayMode : null,
  icon: fieldIconPayload(f.icon),
  valueSource: isSchoolValueField(f.field) && f.valueSource ? f.valueSource : null,
  customValue: isSchoolValueField(f.field) && f.valueSource === TEMPLATE_VALUE_SOURCES.CUSTOM ? cleanCustomValue(f.customValue) : null,
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

// url nahi bhejte — backend asset / school profile se leta hai. Saved layers apna _id rakhte hain.
// School profile image: source + profileKey (assetId nahi).
const layersPayload = (layers) =>
  (layers || []).map((l) => ({
    ...(l._id ? { _id: l._id } : {}),
    ...(isProfileImageLayer(l)
      ? { source: TEMPLATE_IMAGE_SOURCES.COLLEGE_PROFILE, profileKey: l.profileKey }
      : { source: TEMPLATE_IMAGE_SOURCES.ASSET, assetId: String(l.assetId) }),
    type: l.type,
    x: num(l.x),
    y: num(l.y),
    width: num(l.width),
    height: num(l.height),
    opacity: num(l.opacity, 1),
    rotation: num(l.rotation),
    zIndex: Math.round(toNumber(l.zIndex, 10)),
    visible: l.visible !== false,
    lockAspectRatio: l.lockAspectRatio !== false,
    align: l.align || null,
    ...imageLayerStyleOf(l),
    imageProcessing: l.imageProcessing || null,
  }));

export const themePayload = (theme = {}) => ({
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
  options: {
    headerSize: theme.options?.headerSize ?? null,
    patternOpacity: theme.options?.patternOpacity ?? null,
    frame: {
      enabled: theme.options?.frame?.enabled ?? null,
      color: hexOrNull(theme.options?.frame?.color),
      width: theme.options?.frame?.width ?? null,
    },
    textColorMode: theme.options?.textColorMode || null,
    cornerStyle: theme.options?.cornerStyle || null,
  },
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

// Backend (idCardRenderData) ke resolveDisplayMode / labelForMode / iconForMode jaise
const draftDisplayMode = (f) =>
  f.displayMode || (f.showLabel === false ? TEMPLATE_FIELD_DISPLAY_MODES.VALUE_ONLY : TEMPLATE_FIELD_DISPLAY_MODES.LABEL);

const draftLabel = (f, rendered) => {
  // displayMode null → bilkul purana rule
  if (!f.displayMode) return f.showLabel === false ? null : f.label?.trim() || rendered?.label || null;
  const mode = f.displayMode;
  if (mode !== TEMPLATE_FIELD_DISPLAY_MODES.LABEL && mode !== TEMPLATE_FIELD_DISPLAY_MODES.ICON_AND_LABEL) return null;
  return f.label?.trim() || rendered?.label || TEMPLATE_FIELD_LABELS[f.field] || null;
};

const draftIcon = (f, textColor) => {
  const mode = draftDisplayMode(f);
  if (mode !== TEMPLATE_FIELD_DISPLAY_MODES.ICON && mode !== TEMPLATE_FIELD_DISPLAY_MODES.ICON_AND_LABEL) return null;
  const icon = normalizeFieldIcon(f.icon);
  if (!icon || !(icon.source === TEMPLATE_ICON_SOURCES.UPLOAD ? icon.url : icon.key)) return null;
  return {
    source: icon.source,
    key: icon.key,
    url: icon.url,
    color: icon.color || f.labelColor || textColor,
    size: icon.size,
    position: icon.position,
    gap: icon.gap,
    background: icon.background,
  };
};

const placeholderValue = (f) => (f.field === 'customText' ? f.customText || 'Custom text' : `[${f.field}]`);

/**
 * Preview aane tak canvas draft ke hisaab se turant badle: content (values, photo, QR data, theme)
 * aakhri backend preview se, position / size / style draft se.
 * profileUrls: { LOGO, PRINCIPAL_SIGNATURE, STAMP } → school profile image ka url (designer-context)
 */
export const mergeDraftIntoRender = (renderData, formData, side, profileUrls = null) => {
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
    const custom = isSchoolValueField(f.field) && f.valueSource === TEMPLATE_VALUE_SOURCES.CUSTOM;
    let value = f.field === 'customText'
      ? f.customText || ''
      : custom
        ? cleanCustomValue(f.customValue) || ''
        : rendered?.displayValue ?? placeholderValue(f);
    if (upper && typeof value === 'string') value = value.toUpperCase();
    const draftColor = f.color || '#000000';
    return {
      ...(rendered || { kind: 'TEXT' }),
      field: f.field,
      label: draftLabel(f, rendered),
      displayValue: value,
      displayMode: draftDisplayMode(f),
      x: f.x,
      y: f.y,
      width: f.width ?? null,
      fontSize: f.fontSize,
      fontWeight: f.fontWeight,
      fontStyle: f.fontStyle,
      fontFamily: f.fontFamily,
      // Default kaala → backend ka readable color (dark theme) rakho
      color: rendered && draftColor.toUpperCase() === '#000000' ? rendered.color : draftColor,
      textAlign: f.textAlign,
      maxLines: f.maxLines,
      visible: f.visible !== false,
      letterSpacing: f.letterSpacing,
      lineHeight: f.lineHeight,
      labelColor: f.labelColor || null,
      icon: draftIcon(f, rendered && draftColor.toUpperCase() === '#000000' ? rendered.color : draftColor),
    };
  });

  const photo = draft.photo ? { source: base.photo?.source || null, ...draft.photo } : null;
  const qrCode = draft.qrCode ? { data: base.qrCode?.data || 'Preview', source: null, ...draft.qrCode } : null;
  const imageLayers = (draft.imageLayers || []).map((l) => {
    const profile = isProfileImageLayer(l);
    const source = profile ? (profileUrls ? profileUrls[l.profileKey] || null : l.url || null) : l.url;
    // Background removal ka URL sirf backend banata hai: aakhri preview ki usi image wali layer se lo.
    // Nayi layer ka id har preview par naya hota hai, isliye type + original url se milan.
    const rendered = (base.imageLayers || []).find(
      (r) => r.type === l.type && r.originalSource && r.originalSource === source
    );
    const processed = l.imageProcessing?.enabled === true && rendered?.processing?.applied === true;
    const processing = l.imageProcessing?.enabled === true ? rendered?.processing || null : null;
    return {
      id: l._id || l.clientId,
      type: l.type,
      source: processed ? rendered.source : source,
      originalSource: source,
      processing,
      imageSource: profile ? TEMPLATE_IMAGE_SOURCES.COLLEGE_PROFILE : TEMPLATE_IMAGE_SOURCES.ASSET,
      profileKey: profile ? l.profileKey : null,
      missing: profile && !source,
      x: l.x,
      y: l.y,
      width: l.width,
      height: l.height,
      opacity: l.opacity,
      rotation: l.rotation,
      zIndex: l.zIndex,
      visible: l.visible !== false,
      ...imageLayerStyleOf(l),
    };
  });

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

/* ------------------------------------------------------------------ */
/* School profile images (logo / principal signature / stamp)          */
/* ------------------------------------------------------------------ */

export const maxRotationFor = (layer) =>
  isProfileImageLayer(layer) ? PROFILE_IMAGE_MAX_ROTATION : IMAGE_LAYER_MAX_ROTATION;

// Koi bhi angle → -180..180 → layer ka range
export const normalizeRotation = (degrees, layer) => {
  const wrapped = ((((toNumber(degrees) + 180) % 360) + 360) % 360) - 180;
  const max = maxRotationFor(layer);
  return round2(clamp(wrapped, -max, max));
};

// Size card mein fit (ratio wahi)
const fitSize = (width, height, maxWidth, maxHeight) => {
  const k = Math.min(1, maxWidth / width, maxHeight / height);
  return { width: round2(width * k), height: round2(height * k) };
};

/**
 * designer-context ka suggested size (reference card, PX) → is card ki units.
 * Card ki chhoti side ke hisaab se scale, taaki landscape card par bhi sahi lage.
 */
export const scaleSuggestedSize = (image, referenceCard, cardWidth, cardHeight) => {
  const refShort = Math.min(toNumber(referenceCard?.width, 638), toNumber(referenceCard?.height, 1011)) || 638;
  const scale = Math.min(cardWidth, cardHeight) / refShort;
  const width = Math.max(toNumber(image?.suggested?.width, refShort * 0.2), 1) * scale;
  const height = Math.max(toNumber(image?.suggested?.height, refShort * 0.2), 1) * scale;
  return fitSize(width, height, cardWidth, cardHeight);
};

const clampPosition = (box, W, H) => ({
  x: round2(clamp(box.x, 0, Math.max(0, W - box.width))),
  y: round2(clamp(box.y, 0, Math.max(0, H - box.height))),
});

/**
 * School image ki naya layer. at = { x, y } (drop point, template units) ho to wahan beech mein,
 * warna suggested align: logo upar, signature / stamp neeche.
 * @param {object} image - designer-context schoolImages[] item
 * @param {{ unit, width, height }} card
 * @param {object} referenceCard
 * @param {{ x: number, y: number }|null} [at]
 */
export const buildProfileImageLayer = (image, card, referenceCard, at = null) => {
  const W = toNumber(card.width);
  const H = toNumber(card.height);
  const margin = lengthForUnit(3, card.unit);
  const { width, height } = scaleSuggestedSize(image, referenceCard, W, H);
  const align = image.suggested?.align || TEMPLATE_IMAGE_ALIGNS.LEFT;

  let x;
  let y;
  if (at) {
    x = at.x - width / 2;
    y = at.y - height / 2;
  } else {
    x = align === TEMPLATE_IMAGE_ALIGNS.RIGHT ? W - width - margin : align === TEMPLATE_IMAGE_ALIGNS.CENTER ? (W - width) / 2 : margin;
    y = image.layerType === 'LOGO' ? margin : H - height - margin;
  }
  const defaults = TEMPLATE_IMAGE_LAYER_DEFAULTS[image.layerType] || TEMPLATE_IMAGE_LAYER_DEFAULTS.CUSTOM;

  return {
    clientId: createClientId(),
    source: TEMPLATE_IMAGE_SOURCES.COLLEGE_PROFILE,
    profileKey: image.key,
    type: image.layerType,
    assetId: null,
    url: image.url || null,
    // Logo chauda / lamba ho sakta hai; sign aur stamp ka ratio na bigde
    lockAspectRatio: image.layerType !== 'LOGO',
    align: at ? null : align,
    ...clampPosition({ x, y, width, height }, W, H),
    width,
    height,
    opacity: image.suggested?.opacity ?? 1,
    rotation: image.suggested?.rotation ?? 0,
    zIndex: defaults.zIndex,
    visible: true,
  };
};

/**
 * "Principal Sign + Seal": signature neeche-daayein, stamp uske daayein aadhe hisse par (0.85 opacity, -12°,
 * upar), signature ke neeche "Principal" text. existingSign ho to usi ke hisaab se stamp lagta hai.
 * @returns {{ sign: object, stamp: object, caption: { x, y, width, fontSize } }}
 */
export const buildSignWithSealLayout = (signImage, stampImage, card, referenceCard, existingSign = null) => {
  const W = toNumber(card.width);
  const H = toNumber(card.height);
  const margin = lengthForUnit(3, card.unit);
  const fontSize = defaultFontSize(card.unit);
  const lineHeight = fontUnitsOf(fontSize, card.unit) * 1.3;

  let sign = existingSign;
  if (!sign) {
    sign = buildProfileImageLayer(signImage, card, referenceCard);
    sign = {
      ...sign,
      ...clampPosition(
        { x: W - sign.width - margin, y: H - margin - lineHeight - sign.height, width: sign.width, height: sign.height },
        W,
        H
      ),
    };
  }
  const sx = toNumber(sign.x);
  const sy = toNumber(sign.y);
  const sw = toNumber(sign.width);
  const sh = toNumber(sign.height);

  const base = buildProfileImageLayer(stampImage, card, referenceCard);
  const size = round2(Math.max(Math.min(base.width, sw * 0.7, H), 1));
  const stamp = {
    ...base,
    align: null,
    width: size,
    height: size,
    ...clampPosition({ x: sx + sw * 0.75 - size / 2, y: sy + sh / 2 - size / 2, width: size, height: size }, W, H),
    opacity: 0.85,
    rotation: -12,
    zIndex: Math.max(toNumber(sign.zIndex, 11) + 1, base.zIndex),
  };

  return {
    sign,
    stamp,
    caption: {
      x: round2(sx),
      y: round2(clamp(sy + sh, 0, Math.max(0, H - lineHeight))),
      width: round2(sw),
      fontSize,
    },
  };
};

/**
 * Properties panel: width ya height badle to ratio ke saath doosra bhi; card ke andar raho.
 */
export const lockedSizePatch = (layer, patch, cardWidth, cardHeight) => {
  const w0 = toNumber(layer.width);
  const h0 = toNumber(layer.height);
  if (!(w0 > 0 && h0 > 0)) return patch;
  const ratio = h0 / w0;
  let width;
  let height;
  if (patch.width !== undefined && patch.width !== null) {
    width = toNumber(patch.width);
    height = width * ratio;
  } else if (patch.height !== undefined && patch.height !== null) {
    height = toNumber(patch.height);
    width = height / ratio;
  } else {
    return patch;
  }
  return fitSize(width, height, cardWidth - toNumber(layer.x), cardHeight - toNumber(layer.y));
};

/**
 * Canvas: ratio lock ke saath resize. Corner = saamne wala kona tika rahe; edge = doosri axis beech se.
 * @param {{ x, y, width, height }} start
 * @param {string} handle - nw | n | ne | e | se | s | sw | w
 */
export const resizeLockedBox = (start, handle, dx, dy, cardWidth, cardHeight, minSize = 1) => {
  const x0 = toNumber(start.x);
  const y0 = toNumber(start.y);
  const w0 = Math.max(toNumber(start.width), 0.01);
  const h0 = Math.max(toNumber(start.height), 0.01);
  const ratio = h0 / w0;
  const horizontal = handle.includes('e') || handle.includes('w');
  const vertical = handle.includes('n') || handle.includes('s');
  const sx = handle.includes('w') ? -1 : 1;
  const sy = handle.includes('n') ? -1 : 1;

  let width;
  if (horizontal && vertical) {
    // Corner: jis taraf zyada kheecha, wahi
    const fromX = w0 + sx * dx;
    const fromY = (h0 + sy * dy) / ratio;
    width = Math.abs(fromX - w0) >= Math.abs(fromY - w0) ? fromX : fromY;
  } else if (horizontal) {
    width = w0 + sx * dx;
  } else {
    width = (h0 + sy * dy) / ratio;
  }
  // Tika hua kona / beech wahin rahe — utni hi jagah tak bado
  const roomX = horizontal ? (handle.includes('w') ? x0 + w0 : cardWidth - x0) : Math.min(x0 + w0 / 2, cardWidth - x0 - w0 / 2) * 2;
  const roomY = vertical ? (handle.includes('n') ? y0 + h0 : cardHeight - y0) : Math.min(y0 + h0 / 2, cardHeight - y0 - h0 / 2) * 2;
  width = Math.max(width, minSize, minSize / ratio);
  width = Math.min(width, cardWidth, cardHeight / ratio, Math.max(roomX, minSize), Math.max(roomY, minSize) / ratio);
  const height = width * ratio;

  let x;
  let y;
  if (horizontal) x = handle.includes('w') ? x0 + w0 - width : x0;
  else x = x0 + (w0 - width) / 2;
  if (vertical) y = handle.includes('n') ? y0 + h0 - height : y0;
  else y = y0 + (h0 - height) / 2;

  return {
    ...clampPosition({ x, y, width, height }, cardWidth, cardHeight),
    width: round2(width),
    height: round2(height),
  };
};
