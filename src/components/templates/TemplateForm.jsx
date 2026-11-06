import React, { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { CreditCard, Save, AlertTriangle, RefreshCw, X, Sparkles } from 'lucide-react';
import { ROUTES } from '../../constants/routes.js';
import {
  TEMPLATE_ORIENTATIONS,
  TEMPLATE_ORIENTATION_VALUES,
  TEMPLATE_FONT_WEIGHTS,
  TEMPLATE_FIELDS,
  TEMPLATE_FIELD_LABELS,
  TEMPLATE_NEW_FIELDS,
  TEMPLATE_REPEATABLE_FIELDS,
  TEMPLATE_UNITS,
  TEMPLATE_UNIT_VALUES,
  TEMPLATE_UNIT_LABELS,
  TEMPLATE_TEXT_ALIGNS,
  TEMPLATE_BACKGROUND_FITS,
  TEMPLATE_BACKGROUND_TYPES,
  TEMPLATE_PHOTO_SHAPES,
  TEMPLATE_OBJECT_FITS,
  TEMPLATE_IMAGE_LAYER_ASSET_TYPE,
  TEMPLATE_IMAGE_LAYER_DEFAULTS,
  TEMPLATE_MAX_IMAGE_LAYERS,
  TEMPLATE_MAX_FIELDS,
  TEMPLATE_DEFAULT_CARD,
  TEMPLATE_SIZE_PRESETS,
  TEMPLATE_SIDES,
  TEMPLATE_QR_CONTENT_TYPES,
  TEMPLATE_FONT_STYLES,
  TEMPLATE_TEXT_TRANSFORMS,
  DEFAULT_CARD_THEME_KEY,
  DEFAULT_QR_PADDING_MM,
  TEMPLATE_COLLEGE_PROFILE_IMAGES,
  TEMPLATE_COLLEGE_PROFILE_IMAGE_LABELS,
  isProfileImageLayer,
} from '../../constants/template.js';
import {
  toNumber,
  round2,
  clamp,
  createClientId,
  getLayerKey,
  getOutOfBoundsElements,
  convertTemplateUnits,
  isUsableAsset,
  lengthForUnit,
  fontForUnit,
} from '../../utils/templateLayout.js';
import {
  sideOf,
  applySidePatch,
  newBackSide,
  buildTemplatePayload,
  buildRecommendedBackLayout,
  buildProfileImageLayer,
  buildSignWithSealLayout,
  fitLayerPadding,
  themePayload,
} from '../../utils/templateDesigner.js';
import { useCollegeAssets } from '../../hooks/useCollegeAssets.js';
import {
  fetchThemesRequested,
  saveSchoolThemeRequested,
  renameSchoolThemeRequested,
  deleteSchoolThemeRequested,
  previewRenderRequested,
  clearDesignerPreview,
  fetchDesignerContextRequested,
} from '../../features/templates/templateSlice.js';
import {
  selectDesignerContext,
  selectDesignerSchoolImages,
  selectDesignerContextLoading,
  selectDesignerContextError,
  selectCardThemes,
  selectCardThemesLoading,
  selectDesignerPreview,
  selectDesignerPreviewLoading,
  selectDesignerPreviewError,
  selectDesignerValidationErrors,
} from '../../features/templates/templateSelectors.js';
import ErrorMessage from '../common/ErrorMessage.jsx';
import RouteLoader from '../common/RouteLoader.jsx';

// Lazy load the visual card designer to keep the initial bundle small
const CardDesigner = lazy(() => import('./designer/CardDesigner.jsx'));

/* ------------------------------------------------------------------ */
/* Defaults & normalizers                                              */
/* ------------------------------------------------------------------ */

const makeField = (field, overrides = {}) => ({
  field,
  // Naye fields (back side) mein label khaali → backend ka chhota default label ("Toll-free")
  label: TEMPLATE_NEW_FIELDS.includes(field) ? '' : TEMPLATE_FIELD_LABELS[field] || '',
  x: 0,
  y: 0,
  width: null,
  fontSize: 8,
  fontWeight: TEMPLATE_FONT_WEIGHTS.NORMAL,
  fontFamily: 'Arial',
  color: '#000000',
  textAlign: TEMPLATE_TEXT_ALIGNS.LEFT,
  maxLines: 1,
  visible: true,
  customText: field === TEMPLATE_FIELDS.CUSTOM_TEXT ? 'Custom text' : null,
  fontStyle: TEMPLATE_FONT_STYLES.NORMAL,
  textTransform: TEMPLATE_TEXT_TRANSFORMS.NONE,
  letterSpacing: 0,
  lineHeight: 1.2,
  showLabel: true,
  labelColor: null,
  ...overrides,
});

// Standard 86 x 54 mm landscape card
const DEFAULT_FIELDS = [
  makeField(TEMPLATE_FIELDS.NAME, { label: '', x: 34, y: 15, width: 48, fontSize: 10, fontWeight: TEMPLATE_FONT_WEIGHTS.BOLD }),
  makeField(TEMPLATE_FIELDS.STUDENT_ID, { label: 'ID', x: 34, y: 22 }),
  makeField(TEMPLATE_FIELDS.CLASS_NAME, { label: 'Class', x: 34, y: 27 }),
  makeField(TEMPLATE_FIELDS.ROLL_NUMBER, { label: 'Roll No', x: 34, y: 32 }),
];

const makePhoto = (unit) => ({
  x: lengthForUnit(5, unit),
  y: lengthForUnit(14, unit),
  width: lengthForUnit(25, unit),
  height: lengthForUnit(30, unit),
  shape: TEMPLATE_PHOTO_SHAPES.ROUNDED,
  borderRadius: lengthForUnit(2, unit),
  borderWidth: 0,
  borderColor: '#FFFFFF',
  objectFit: TEMPLATE_OBJECT_FITS.COVER,
  visible: true,
});

// Front: student verification; back: school details
const makeQrCode = (unit, cardWidth, side) => {
  const size = lengthForUnit(13, unit);
  const margin = lengthForUnit(3, unit);
  return {
    // Upar-daayein kona (signature/stamp neeche-daayein jaate hain)
    x: Math.max(0, round2(cardWidth - size - margin)),
    y: margin,
    width: size,
    height: size,
    visible: true,
    contentType: side === TEMPLATE_SIDES.BACK ? TEMPLATE_QR_CONTENT_TYPES.SCHOOL_DETAILS : TEMPLATE_QR_CONTENT_TYPES.STUDENT_VERIFICATION,
    customText: null,
    foregroundColor: '#000000',
    backgroundColor: '#FFFFFF',
    padding: lengthForUnit(DEFAULT_QR_PADDING_MM, unit),
  };
};

/* ---------- Front layout (photo + text fields) ---------- */
// Sab naap card ke % mein, isliye mm / px aur har card size par sahi.
// Landscape ke % purane default (86 × 54 mm) se hi nikle hain, isliye landscape pehle jaisa dikhta hai.
const CARD_LAYOUTS = {
  PORTRAIT: {
    // Photo upar beech mein (passport ratio), text uske neeche, center aligned
    photoWidth: 0.46,
    photoRatio: 1.2,
    photoTop: 0.15,
    gapAfterPhoto: 0.07,
    textX: 0.06,
    textWidth: 0.88,
    lineGap: 0.065,
    maxBottom: 0.92,
    align: TEMPLATE_TEXT_ALIGNS.CENTER,
  },
  LANDSCAPE: {
    // Photo baayein, text daayein (left aligned)
    photoX: 5 / 86,
    photoTop: 14 / 54,
    photoWidth: 25 / 86,
    photoHeight: 30 / 54,
    textX: 34 / 86,
    textTop: 15 / 54,
    textWidth: 48 / 86,
    lineGap: 5 / 54,
    gapAfterName: 7 / 54,
    maxBottom: 0.92,
    align: TEMPLATE_TEXT_ALIGNS.LEFT,
  },
};

/**
 * Ek side ke photo + dikhne wale fields ki jagah (portrait ya landscape, card ke size se).
 * Sirf position / width / alignment badalte hain, naam bold; label, rang, font size waise hi.
 * @returns {{ photo?: object, fields: object[] }} applySidePatch ke liye patch
 */
const buildSideLayout = (sideData, width, height) => {
  const W = toNumber(width);
  const H = toNumber(height);
  if (!(W > 0 && H > 0)) return {};

  const portrait = H > W;
  const L = portrait ? CARD_LAYOUTS.PORTRAIT : CARD_LAYOUTS.LANDSCAPE;
  const patch = {};
  let textTop = H * (L.textTop ?? L.photoTop);

  if (sideData.photo) {
    const photoWidth = round2(W * L.photoWidth);
    const photoHeight = round2(portrait ? photoWidth * L.photoRatio : H * L.photoHeight);
    const photoY = round2(H * L.photoTop);
    patch.photo = {
      ...sideData.photo,
      x: round2(portrait ? (W - photoWidth) / 2 : W * L.photoX),
      y: photoY,
      width: photoWidth,
      height: photoHeight,
    };
    if (portrait) textTop = photoY + photoHeight + H * L.gapAfterPhoto;
  } else if (portrait) {
    textTop = H * L.photoTop;
  }

  // Dikhne wale fields stack mein; naam sabse upar, baaki apne order mein
  const stack = sideData.fields
    .map((field, index) => ({ field, index }))
    .filter(({ field }) => field.visible !== false)
    .sort((a, b) => Number(b.field.field === TEMPLATE_FIELDS.NAME) - Number(a.field.field === TEMPLATE_FIELDS.NAME));

  // Line ke beech ki doori (naam ke baad thodi zyada); jagah kam ho to sab barabar ghatao
  const lastAllowed = H * L.maxBottom;
  const gaps = stack.map((_, i) => (i === 0 ? 0 : H * (i === 1 ? L.gapAfterName ?? L.lineGap : L.lineGap)));
  const needed = gaps.reduce((sum, g) => sum + g, 0);
  const scale = needed > 0 && textTop + needed > lastAllowed ? Math.max(0, lastAllowed - textTop) / needed : 1;

  const fields = [...sideData.fields];
  let y = textTop;
  stack.forEach(({ field, index }, i) => {
    y += gaps[i] * scale;
    fields[index] = {
      ...field,
      x: round2(W * L.textX),
      y: round2(Math.min(y, lastAllowed)),
      width: round2(W * L.textWidth),
      textAlign: L.align,
      ...(field.field === TEMPLATE_FIELDS.NAME ? { fontWeight: TEMPLATE_FONT_WEIGHTS.BOLD } : {}),
    };
  });
  patch.fields = fields;
  return patch;
};

// Card ke size ke hisaab se front ka layout (naye template ke liye)
const layoutFront = (data) =>
  applySidePatch(data, TEMPLATE_SIDES.FRONT, buildSideLayout(sideOf(data, TEMPLATE_SIDES.FRONT), data.width, data.height));

const idOf = (value) => (value && typeof value === 'object' ? value._id || value.id : value) || null;

const normalizeField = (f) =>
  makeField(f.field, {
    label: f.label ?? '',
    x: toNumber(f.x),
    y: toNumber(f.y),
    width: f.width ?? null,
    fontSize: toNumber(f.fontSize, 12),
    fontWeight: f.fontWeight || TEMPLATE_FONT_WEIGHTS.NORMAL,
    fontFamily: f.fontFamily || 'Arial',
    color: f.color || '#000000',
    textAlign: f.textAlign || TEMPLATE_TEXT_ALIGNS.LEFT,
    maxLines: f.maxLines ?? 1,
    visible: f.visible !== false,
    customText: f.customText ?? null,
    fontStyle: f.fontStyle || TEMPLATE_FONT_STYLES.NORMAL,
    textTransform: f.textTransform || TEMPLATE_TEXT_TRANSFORMS.NONE,
    letterSpacing: toNumber(f.letterSpacing, 0),
    lineHeight: toNumber(f.lineHeight, 1.2),
    showLabel: f.showLabel !== false,
    labelColor: f.labelColor || null,
  });

const normalizeLayers = (layers) =>
  (layers || []).map((l) => ({
    ...l,
    _id: l._id ? String(l._id) : l.id ? String(l.id) : undefined,
    assetId: idOf(l.assetId),
  }));

const normalizeTheme = (theme) => ({
  presetKey: theme?.presetKey || DEFAULT_CARD_THEME_KEY,
  colors: { ...(theme?.colors || {}) },
  background: {
    type: theme?.background?.type || null,
    gradient: { ...(theme?.background?.gradient || {}) },
  },
  frontDecoration: theme?.frontDecoration || null,
  backDecoration: theme?.backDecoration || null,
  decorationIntensity: theme?.decorationIntensity ?? null,
  options: {
    headerSize: theme?.options?.headerSize ?? null,
    patternOpacity: theme?.options?.patternOpacity ?? null,
    frame: { ...(theme?.options?.frame || {}) },
    textColorMode: theme?.options?.textColorMode || null,
    cornerStyle: theme?.options?.cornerStyle || null,
  },
});

const normalizeBack = (back, unit) =>
  back
    ? {
      backgroundAssetId: idOf(back.backgroundAssetId),
      background: back.background || null,
      backgroundFit: back.backgroundFit || TEMPLATE_BACKGROUND_FITS.COVER,
      backgroundType: back.backgroundType || (back.background ? TEMPLATE_BACKGROUND_TYPES.IMAGE : TEMPLATE_BACKGROUND_TYPES.SOLID),
      fields: (back.fields || []).map(normalizeField),
      photo: back.photo ? { ...makePhoto(unit), ...back.photo } : null,
      qrCode: back.qrCode || null,
      imageLayers: normalizeLayers(back.imageLayers),
    }
    : null;

const buildInitialState = (iv) => {
  if (!iv) {
    const { unit, width, height } = TEMPLATE_DEFAULT_CARD;
    // Naya template: card portrait ho to photo upar beech mein, text neeche
    return layoutFront({
      name: '',
      orientation: TEMPLATE_DEFAULT_CARD.orientation,
      unit,
      width,
      height,
      backgroundAssetId: null,
      background: null,
      backgroundFit: TEMPLATE_BACKGROUND_FITS.COVER,
      logo: null,
      primaryColor: '#4F46E5',
      secondaryColor: '#9333EA',
      fields: DEFAULT_FIELDS,
      photo: makePhoto(unit),
      qrCode: null,
      imageLayers: [],
      theme: normalizeTheme(null),
      frontBackgroundType: TEMPLATE_BACKGROUND_TYPES.SOLID,
      hasBack: false,
      back: null,
      validity: { session: '', validTill: null },
      version: null,
    });
  }

  const unit = iv.unit || TEMPLATE_UNITS.PX;
  return {
    name: iv.name || '',
    orientation: iv.orientation || TEMPLATE_ORIENTATIONS.PORTRAIT,
    // Purane templates bina unit ke = PX (backend default)
    unit,
    width: toNumber(iv.width, 86),
    height: toNumber(iv.height, 54),
    backgroundAssetId: idOf(iv.backgroundAssetId),
    background: iv.background || null,
    backgroundFit: iv.backgroundFit || TEMPLATE_BACKGROUND_FITS.COVER,
    logo: iv.logo || null,
    primaryColor: iv.primaryColor || '#4F46E5',
    secondaryColor: iv.secondaryColor || '#9333EA',
    fields: Array.isArray(iv.fields) && iv.fields.length > 0 ? iv.fields.map(normalizeField) : DEFAULT_FIELDS,
    photo: iv.photo ? { ...makePhoto(unit), ...iv.photo } : null,
    qrCode: iv.qrCode || null,
    imageLayers: normalizeLayers(iv.imageLayers),
    theme: normalizeTheme(iv.theme),
    frontBackgroundType: iv.frontBackgroundType || (iv.background ? TEMPLATE_BACKGROUND_TYPES.IMAGE : TEMPLATE_BACKGROUND_TYPES.SOLID),
    hasBack: Boolean(iv.hasBack && iv.back),
    back: normalizeBack(iv.back, unit),
    validity: {
      session: iv.validity?.session || '',
      validTill: iv.validity?.validTill ? String(iv.validity.validTill).slice(0, 10) : null,
    },
    version: iv.version ?? null,
  };
};

// "Back: Field ..." / "Field ..." jaisi API layout messages → element labels (canvas par laal outline)
const labelsFromErrors = (messages) =>
  (messages || []).flatMap((message) => {
    const match = /outside the card area:\s*(.+)$/i.exec(message || '');
    return match ? match[1].split(/,\s*/) : [];
  });

/* ------------------------------------------------------------------ */
/* Small UI pieces                                                     */
/* ------------------------------------------------------------------ */

// Halka gradient card, upar rangeen header patti (SectionHeader)
const sectionClass =
  'relative overflow-hidden rounded-3xl border border-indigo-100/80 bg-linear-to-br from-white via-indigo-50/40 to-violet-50/60 shadow-sm shadow-indigo-500/5';
const labelClass = 'block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5';
const inputClass =
  'w-full h-10 px-3.5 bg-white/90 border rounded-xl text-sm text-slate-800 placeholder-slate-400 shadow-xs transition-all hover:border-indigo-300 focus:outline-hidden focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/15 focus:bg-white disabled:opacity-60';

// Dark gradient header: icon tile, title, subtitle, daayein action
const SectionHeader = ({ icon: Icon, title, subtitle, action }) => (
  <div className="relative flex items-center justify-between gap-3 overflow-hidden bg-linear-to-r from-slate-900 via-indigo-900 to-violet-800 px-4 py-3 text-white sm:px-5">
    <div className="pointer-events-none absolute -right-10 -top-16 h-40 w-40 rounded-full bg-fuchsia-500/30 blur-2xl" />
    <div className="pointer-events-none absolute -bottom-16 left-1/3 h-32 w-32 rounded-full bg-sky-500/20 blur-2xl" />
    <div className="relative flex min-w-0 items-center gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-indigo-400 via-violet-500 to-fuchsia-500 shadow-lg shadow-fuchsia-500/30 ring-1 ring-white/30">
        <Icon className="h-4.5 w-4.5" />
      </div>
      <div className="min-w-0">
        <h2 className="truncate text-sm font-extrabold tracking-tight sm:text-base">{title}</h2>
        {subtitle && <p className="truncate text-[11px] font-medium text-indigo-200">{subtitle}</p>}
      </div>
    </div>
    {action && <div className="relative shrink-0">{action}</div>}
  </div>
);

export const TemplateForm = ({
  initialValues = null,
  isEdit = false,
  isLoading = false,
  errorMessage = null,
  onSubmit,
  onCancel,
}) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [formData, setFormData] = useState(() => buildInitialState(initialValues));
  const [errors, setErrors] = useState({});

  const themes = useSelector(selectCardThemes);
  const themesLoading = useSelector(selectCardThemesLoading);
  const previewData = useSelector(selectDesignerPreview);
  const previewLoading = useSelector(selectDesignerPreviewLoading);
  const previewError = useSelector(selectDesignerPreviewError);
  const validationErrors = useSelector(selectDesignerValidationErrors);
  const designerContext = useSelector(selectDesignerContext);
  const schoolImages = useSelector(selectDesignerSchoolImages);
  const schoolImagesLoading = useSelector(selectDesignerContextLoading);
  const schoolImagesError = useSelector(selectDesignerContextError);

  const { assets, isLoading: assetsLoading, error: assetsError, reload: reloadAssets } = useCollegeAssets();

  useEffect(() => {
    if (initialValues) setFormData(buildInitialState(initialValues));
  }, [initialValues]);

  // School profile images + page band hone par preview saaf
  useEffect(() => {
    dispatch(fetchDesignerContextRequested());
    return () => {
      dispatch(clearDesignerPreview());
    };
  }, [dispatch]);

  // Themes catalog (cache): thumbnails template ki orientation ke hisaab se
  useEffect(() => {
    dispatch(fetchThemesRequested({ orientation: formData.orientation }));
  }, [dispatch, formData.orientation]);

  // Har change par backend preview (saga 400 ms debounce + purani request cancel)
  useEffect(() => {
    dispatch(previewRenderRequested({ template: JSON.parse(JSON.stringify(buildTemplatePayload(formData))) }));
  }, [dispatch, formData]);

  const usableAssets = useMemo(() => assets.filter(isUsableAsset), [assets]);
  // Base64 / bahut lambe URL wale assets layer mein save nahi ho sakte (backend maxlength 1000)
  const unusableAssetCount = assets.length - usableAssets.length;
  const outOfBounds = useMemo(() => getOutOfBoundsElements(formData), [formData]);
  const invalidLabels = useMemo(
    () => [...new Set([...outOfBounds, ...labelsFromErrors(validationErrors)])],
    [outOfBounds, validationErrors]
  );

  // School profile image key → url (null = upload nahi hai); context na aaya ho to null (layer ka cached url chalega)
  const profileUrls = useMemo(
    () =>
      designerContext
        ? Object.fromEntries(schoolImages.map((img) => [img.key, img.available ? img.url : null]))
        : null,
    [designerContext, schoolImages]
  );

  const unit = formData.unit;
  const u = TEMPLATE_UNIT_LABELS[unit] || unit;

  const update = (patch) => {
    setFormData((prev) => ({ ...prev, ...patch }));
    const keys = Object.keys(patch);
    if (keys.some((k) => errors[k])) {
      setErrors((prev) => {
        const next = { ...prev };
        keys.forEach((k) => delete next[k]);
        return next;
      });
    }
  };

  // Ek side (front / back) ka patch
  const updateSide = (side, fn) => setFormData((prev) => applySidePatch(prev, side, fn(sideOf(prev, side), prev)));

  /* ---------- Card setup ---------- */

  // Naya template banate waqt orientation / size badle to front ka layout bhi naye card ke hisaab se.
  // Edit mein apne aap kuch nahi hilta (designer ka "Center layout" button hai).
  const relayoutIfNew = (data) => (isEdit ? data : layoutFront(data));

  const handleOrientationChange = (orientation) => {
    setFormData((prev) => {
      const w = toNumber(prev.width);
      const h = toNumber(prev.height);
      const wantsPortrait = orientation === TEMPLATE_ORIENTATIONS.PORTRAIT;
      // Orientation badle to width/height swap, taaki card sach mein ghoome
      const shouldSwap = (wantsPortrait && w > h) || (!wantsPortrait && h > w);
      return shouldSwap ? relayoutIfNew({ ...prev, orientation, width: h, height: w }) : { ...prev, orientation };
    });
  };

  const handleUnitChange = (nextUnit) => {
    setFormData((prev) => convertTemplateUnits(prev, prev.unit, nextUnit));
  };

  // CR80 preset: pehle unit badlo (positions convert), phir size + orientation
  const handleSizePreset = (key) => {
    const preset = TEMPLATE_SIZE_PRESETS.find((p) => p.key === key);
    if (!preset) return;
    setFormData((prev) =>
      relayoutIfNew({
        ...convertTemplateUnits(prev, prev.unit, preset.unit),
        width: preset.width,
        height: preset.height,
        orientation: preset.orientation,
      })
    );
  };

  /* ---------- Fields ---------- */

  const handleAddField = (side, fieldName) => {
    updateSide(side, (s, prev) => {
      const repeatable = TEMPLATE_REPEATABLE_FIELDS.includes(fieldName);
      if ((!repeatable && s.fields.some((f) => f.field === fieldName)) || s.fields.length >= TEMPLATE_MAX_FIELDS) return {};
      const lastY = s.fields.reduce((max, f) => Math.max(max, toNumber(f.y)), 0);
      const gap = lengthForUnit(5, prev.unit);
      const fontSize = fontForUnit(8, prev.unit);
      const y = clamp(round2(s.fields.length ? lastY + gap : gap), 0, Math.max(0, toNumber(prev.height) - gap));
      const x = clamp(lengthForUnit(side === TEMPLATE_SIDES.BACK ? 5 : 34, prev.unit), 0, Math.max(0, toNumber(prev.width) - gap));
      return { fields: [...s.fields, makeField(fieldName, { x, y, fontSize })] };
    });
  };

  const handleUpdateField = (side, index, patch) => {
    updateSide(side, (s) => {
      const fields = [...s.fields];
      fields[index] = { ...fields[index], ...patch };
      return { fields };
    });
    if (errors.fields) setErrors((prev) => ({ ...prev, fields: null }));
  };

  const handleRemoveField = (side, index) => {
    updateSide(side, (s) => ({ fields: s.fields.filter((_, i) => i !== index) }));
  };

  // Designer ka "Center layout": photo upar beech mein, text neeche (ek hi update)
  const handleApplyCenterLayout = (side) => {
    updateSide(side, (s, prev) => buildSideLayout(s, prev.width, prev.height));
    if (errors.layout) setErrors((prev) => ({ ...prev, layout: null }));
  };

  /* ---------- Photo & QR ---------- */

  const handleAddPhoto = (side) => updateSide(side, (s, prev) => ({ photo: makePhoto(prev.unit) }));
  const handleUpdatePhoto = (side, photo) => updateSide(side, () => ({ photo }));
  const handleAddQrCode = (side) =>
    updateSide(side, (s, prev) => ({ qrCode: makeQrCode(prev.unit, toNumber(prev.width), side) }));
  const handleUpdateQrCode = (side, qrCode) => updateSide(side, () => ({ qrCode }));

  /* ---------- Image layers ---------- */

  // Returns the new layer's key so the designer can select it
  const handleAddLayer = (side, type) => {
    const layers = sideOf(formData, side).imageLayers;
    if (layers.length >= TEMPLATE_MAX_IMAGE_LAYERS) return null;
    const assetType = TEMPLATE_IMAGE_LAYER_ASSET_TYPE[type];
    const candidates = usableAssets.filter((a) => !assetType || a.type === assetType);
    if (candidates.length === 0) return null;

    const cardWidth = toNumber(formData.width, 86);
    const cardHeight = toNumber(formData.height, 54);
    const usedIds = new Set(layers.map((l) => String(l.assetId)));
    const asset = candidates.find((a) => !usedIds.has(String(a._id))) || candidates[0];
    const defaults = TEMPLATE_IMAGE_LAYER_DEFAULTS[type] || TEMPLATE_IMAGE_LAYER_DEFAULTS.CUSTOM;
    const width = Math.min(lengthForUnit(defaults.width, unit), cardWidth);
    const height = Math.min(lengthForUnit(defaults.height, unit), cardHeight);
    const margin = lengthForUnit(3, unit);

    const clientId = createClientId();
    const layer = {
      clientId,
      type,
      assetId: asset._id,
      url: asset.url,
      // Default jagah: logo upar-baayein, signature neeche-daayein, stamp signature ke thoda baayein (overlap)
      x: type === 'LOGO' ? margin : Math.max(0, round2(cardWidth - width - margin - (type === 'STAMP' ? lengthForUnit(16, unit) : 0))),
      y: type === 'LOGO' ? margin : Math.max(0, round2(cardHeight - height - margin)),
      width,
      height,
      opacity: defaults.opacity,
      rotation: defaults.rotation,
      zIndex: defaults.zIndex,
      visible: true,
    };
    updateSide(side, (s) => ({ imageLayers: [...s.imageLayers, layer] }));
    return clientId;
  };

  const availableSchoolImage = (key) => schoolImages.find((img) => img.key === key && img.available) || null;
  const cardOf = (data) => ({ unit: data.unit, width: toNumber(data.width, 86), height: toNumber(data.height, 54) });

  // School profile image (logo / principal signature / stamp). at = drop point. Returns the new layer's key.
  const handleAddProfileImage = (side, profileKey, at = null) => {
    const image = availableSchoolImage(profileKey);
    if (!image || sideOf(formData, side).imageLayers.length >= TEMPLATE_MAX_IMAGE_LAYERS) return null;
    const layer = buildProfileImageLayer(image, cardOf(formData), designerContext?.referenceCard, at);
    updateSide(side, (s) => ({ imageLayers: [...s.imageLayers, layer] }));
    return layer.clientId;
  };

  // "Principal Sign + Seal": jo nahi laga wo add (signature, stamp uske upar, "Principal" text). Returns signature key.
  const handleAddSignWithSeal = (side) => {
    const signImage = availableSchoolImage(TEMPLATE_COLLEGE_PROFILE_IMAGES.PRINCIPAL_SIGNATURE);
    const stampImage = availableSchoolImage(TEMPLATE_COLLEGE_PROFILE_IMAGES.STAMP);
    if (!signImage || !stampImage) return null;

    const s = sideOf(formData, side);
    const findProfile = (key) => s.imageLayers.find((l) => isProfileImageLayer(l) && l.profileKey === key) || null;
    const existingSign = findProfile(TEMPLATE_COLLEGE_PROFILE_IMAGES.PRINCIPAL_SIGNATURE);
    const existingStamp = findProfile(TEMPLATE_COLLEGE_PROFILE_IMAGES.STAMP);
    if (existingSign && existingStamp) return getLayerKey(existingSign);

    const needed = (existingSign ? 0 : 1) + (existingStamp ? 0 : 1);
    if (s.imageLayers.length + needed > TEMPLATE_MAX_IMAGE_LAYERS) return null;

    const { sign, stamp, caption } = buildSignWithSealLayout(signImage, stampImage, cardOf(formData), designerContext?.referenceCard, existingSign);
    const added = [...(existingSign ? [] : [sign]), ...(existingStamp ? [] : [stamp])];
    const hasCaption = s.fields.some((f) => f.field === TEMPLATE_FIELDS.CUSTOM_TEXT && f.customText?.trim().toLowerCase() === 'principal');
    const captionField =
      !hasCaption && s.fields.length < TEMPLATE_MAX_FIELDS
        ? makeField(TEMPLATE_FIELDS.CUSTOM_TEXT, {
          label: '',
          showLabel: false,
          customText: 'Principal',
          x: caption.x,
          y: caption.y,
          width: caption.width,
          fontSize: caption.fontSize,
          fontWeight: TEMPLATE_FONT_WEIGHTS.BOLD,
          textAlign: TEMPLATE_TEXT_ALIGNS.CENTER,
        })
        : null;

    updateSide(side, (cur) => ({
      imageLayers: [...cur.imageLayers, ...added],
      ...(captionField ? { fields: [...cur.fields, captionField] } : {}),
    }));
    return getLayerKey(sign);
  };

  const handleUpdateLayer = (side, key, patch) => {
    updateSide(side, (s) => ({
      imageLayers: s.imageLayers.map((l) => (getLayerKey(l) === key ? fitLayerPadding({ ...l, ...patch }) : l)),
    }));
  };

  // Background removal: dono sides ke har signature + stamp par same settings
  const handleApplyImageProcessingToAll = (settings) => {
    const apply = (layers) =>
      (layers || []).map((l) => (l.type === 'SIGNATURE' || l.type === 'STAMP' ? { ...l, imageProcessing: { ...settings } } : l));
    setFormData((prev) => ({
      ...prev,
      imageLayers: apply(prev.imageLayers),
      back: prev.back ? { ...prev.back, imageLayers: apply(prev.back.imageLayers) } : prev.back,
    }));
  };

  const handleRemoveLayer = (side, key) => {
    updateSide(side, (s) => ({ imageLayers: s.imageLayers.filter((l) => getLayerKey(l) !== key) }));
  };

  /* ---------- Theme, background, back side, validity ---------- */

  // Preset se shuru: override colors / decorations hatao; letterhead wali side letterhead hi rahe
  const handleApplyPreset = (preset) => {
    setFormData((prev) => {
      const presetBg = preset.background?.type || TEMPLATE_BACKGROUND_TYPES.SOLID;
      const keepImage = (type, assetId) => type === TEMPLATE_BACKGROUND_TYPES.IMAGE && assetId;
      return {
        ...prev,
        theme: normalizeTheme({ presetKey: preset.key }),
        frontBackgroundType: keepImage(prev.frontBackgroundType, prev.backgroundAssetId) ? TEMPLATE_BACKGROUND_TYPES.IMAGE : presetBg,
        back: prev.back
          ? {
            ...prev.back,
            backgroundType: keepImage(prev.back.backgroundType, prev.back.backgroundAssetId) ? TEMPLATE_BACKGROUND_TYPES.IMAGE : presetBg,
          }
          : prev.back,
      };
    });
  };

  const handleThemeChange = (patch) => setFormData((prev) => ({ ...prev, theme: { ...prev.theme, ...patch } }));

  // School themes: designer ka abhi ka theme (callbacks se modal ka saving / error)
  const handleSaveSchoolTheme = (name, callbacks) =>
    dispatch(saveSchoolThemeRequested({ name, theme: themePayload(formData.theme), ...callbacks }));
  const handleRenameSchoolTheme = (themeId, name, callbacks) =>
    dispatch(renameSchoolThemeRequested({ themeId, name, ...callbacks }));
  const handleDeleteSchoolTheme = (themeId, callbacks) =>
    dispatch(deleteSchoolThemeRequested({ themeId, ...callbacks }));

  const handleSideBackgroundChange = (side, patch) => updateSide(side, () => patch);

  const handleToggleBack = (enabled) =>
    setFormData((prev) => ({ ...prev, hasBack: enabled, back: enabled ? prev.back || newBackSide() : prev.back }));

  const handleApplyRecommendedBack = () =>
    setFormData((prev) => {
      const layout = buildRecommendedBackLayout(
        { unit: prev.unit, width: prev.width, height: prev.height },
        { signatureAsset: usableAssets.find((a) => a.type === 'SIGNATURE') || null }
      );
      // Back ka background (type / letterhead) waisa hi rahe
      const current = prev.back || newBackSide();
      return {
        ...prev,
        hasBack: true,
        back: {
          ...layout,
          backgroundType: current.backgroundType,
          backgroundAssetId: current.backgroundAssetId,
          background: current.background,
          backgroundFit: current.backgroundFit,
        },
      };
    });

  const handleValidityChange = (patch) => setFormData((prev) => ({ ...prev, validity: { ...prev.validity, ...patch } }));

  const designerHandlers = {
    onAddField: handleAddField,
    onUpdateField: handleUpdateField,
    onRemoveField: handleRemoveField,
    onApplyCenterLayout: handleApplyCenterLayout,
    onAddPhoto: handleAddPhoto,
    onUpdatePhoto: handleUpdatePhoto,
    onAddQrCode: handleAddQrCode,
    onUpdateQrCode: handleUpdateQrCode,
    onAddLayer: handleAddLayer,
    onAddProfileImage: handleAddProfileImage,
    onAddSignWithSeal: handleAddSignWithSeal,
    onUpdateLayer: handleUpdateLayer,
    onApplyImageProcessingToAll: handleApplyImageProcessingToAll,
    onRemoveLayer: handleRemoveLayer,
    onApplyPreset: handleApplyPreset,
    onThemeChange: handleThemeChange,
    onSaveSchoolTheme: handleSaveSchoolTheme,
    onRenameSchoolTheme: handleRenameSchoolTheme,
    onDeleteSchoolTheme: handleDeleteSchoolTheme,
    onSideBackgroundChange: handleSideBackgroundChange,
    onToggleBack: handleToggleBack,
    onApplyRecommendedBack: handleApplyRecommendedBack,
    onValidityChange: handleValidityChange,
  };

  /* ---------- Validation & submit ---------- */

  const validate = () => {
    const newErrors = {};
    const name = formData.name.trim();
    if (!name) newErrors.name = 'Template name is required';
    else if (name.length < 2) newErrors.name = 'Template name must be at least 2 characters long';
    else if (name.length > 150) newErrors.name = 'Template name cannot exceed 150 characters';

    if (!(toNumber(formData.width) > 0)) newErrors.width = 'Width must be a positive number';
    if (!(toNumber(formData.height) > 0)) newErrors.height = 'Height must be a positive number';

    if (formData.fields.length === 0) newErrors.fields = 'Add at least one student field to the front of the card';
    if (formData.fields.length > TEMPLATE_MAX_FIELDS) newErrors.fields = `A card side can have at most ${TEMPLATE_MAX_FIELDS} fields`;

    // Custom text / QR custom text khaali nahi (dono sides)
    const sides = [TEMPLATE_SIDES.FRONT, ...(formData.hasBack ? [TEMPLATE_SIDES.BACK] : [])];
    const emptyText = sides.some((side) => {
      const s = sideOf(formData, side);
      return (
        s.fields.some((f) => f.field === TEMPLATE_FIELDS.CUSTOM_TEXT && !f.customText?.trim()) ||
        (s.qrCode?.contentType === TEMPLATE_QR_CONTENT_TYPES.CUSTOM_TEXT && !s.qrCode.customText?.trim())
      );
    });
    if (emptyText) newErrors.customText = 'Every custom text field (and custom-text QR) needs some text';

    const allLayers = sides.flatMap((side) => sideOf(formData, side).imageLayers);
    // School profile images asset nahi — unka check neeche alag
    const unknown = allLayers.findIndex(
      (l) => !isProfileImageLayer(l) && (!l.assetId || !usableAssets.some((a) => String(a._id) === String(l.assetId)))
    );
    // Assets load na hue hon to ye check skip (backend phir bhi verify karta hai)
    if (!assetsLoading && !assetsError && unknown !== -1) {
      newErrors.imageLayers = 'An image on the card is no longer available. Pick another image or remove it.';
    }
    // School profile mein upload nahi (context load hua ho tabhi; backend bhi rokta hai)
    const missingProfile = profileUrls
      ? [...new Set(allLayers.filter((l) => isProfileImageLayer(l) && !profileUrls[l.profileKey]).map((l) => l.profileKey))]
      : [];
    if (missingProfile.length) {
      const names = missingProfile.map((key) => TEMPLATE_COLLEGE_PROFILE_IMAGE_LABELS[key] || key).join(', ');
      newErrors.profileImages = `${names} ${missingProfile.length === 1 ? 'is' : 'are'} not uploaded in the school profile. Remove it from the card or ask the Super Admin to upload it.`;
    }

    if (outOfBounds.length) newErrors.layout = `These go outside the card: ${outOfBounds.join(', ')}`;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLoading) return;
    if (!validate()) return;

    // undefined keys hata do (JSON mein waise bhi nahi jaate, par saaf rakhna)
    const payload = JSON.parse(JSON.stringify(buildTemplatePayload(formData)));
    onSubmit(payload);
  };

  const handleCancel = () => (onCancel ? onCancel() : navigate(ROUTES.TEMPLATES));

  const errorList = [errors.fields, errors.customText, errors.imageLayers, errors.profileImages, errors.layout].filter(Boolean);
  const sizePresetKey =
    TEMPLATE_SIZE_PRESETS.find(
      (p) => p.unit === unit && p.width === toNumber(formData.width) && p.height === toNumber(formData.height)
    )?.key || '';

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {errorMessage && <ErrorMessage message={errorMessage} title="Couldn't save the template" />}

      {errorList.length > 0 && (
        <div className="rounded-2xl border border-rose-200 bg-linear-to-r from-rose-50 via-red-50 to-pink-50 px-4 py-3 text-sm text-rose-800 shadow-sm shadow-rose-500/10" role="alert">
          <p className="font-bold flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-linear-to-br from-rose-500 to-red-600 text-white shadow-sm">
              <AlertTriangle className="w-3.5 h-3.5" />
            </span>
            Fix these before saving
          </p>
          <ul className="mt-1.5 ml-9 list-disc space-y-0.5 text-xs font-medium">
            {errorList.map((msg) => (
              <li key={msg}>{msg}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Section 1: Basics */}
      <div className={sectionClass}>
        <SectionHeader
          icon={CreditCard}
          title="Template Details"
          subtitle="Name, card size and orientation"
          action={
            isEdit && formData.version ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-bold ring-1 ring-white/25 backdrop-blur-sm">
                <Sparkles className="h-3 w-3" /> v{formData.version}
              </span>
            ) : null
          }
        />

        <div className="grid grid-cols-2 gap-x-3 gap-y-3.5 p-4 sm:p-5 lg:grid-cols-6">
          <div className="col-span-2 lg:col-span-3">
            <label htmlFor="template-name" className={labelClass}>
              Template Name <span className="text-rose-500">*</span>
            </label>
            <input
              id="template-name"
              type="text"
              maxLength={150}
              value={formData.name}
              disabled={isLoading}
              onChange={(e) => update({ name: e.target.value })}
              placeholder="e.g. Student ID 2026"
              className={`${inputClass} ${errors.name ? 'border-rose-400 focus:ring-rose-400' : 'border-slate-200'}`}
            />
            {errors.name && <p className="text-[11px] text-rose-600 mt-1 font-semibold">{errors.name}</p>}
          </div>

          <div className="col-span-2 lg:col-span-3">
            <label htmlFor="template-size-preset" className={labelClass}>Card size</label>
            <select
              id="template-size-preset"
              value={sizePresetKey}
              disabled={isLoading}
              onChange={(e) => handleSizePreset(e.target.value)}
              className={`${inputClass} border-slate-200 cursor-pointer`}
            >
              <option value="">Custom size</option>
              {TEMPLATE_SIZE_PRESETS.map((p) => (
                <option key={p.key} value={p.key}>{p.label}</option>
              ))}
            </select>
          </div>

          <div className="col-span-1 lg:col-span-2">
            <label htmlFor="template-orientation" className={labelClass}>Orientation</label>
            <select
              id="template-orientation"
              value={formData.orientation}
              disabled={isLoading}
              onChange={(e) => handleOrientationChange(e.target.value)}
              className={`${inputClass} border-slate-200 cursor-pointer`}
            >
              {TEMPLATE_ORIENTATION_VALUES.map((o) => (
                <option key={o} value={o}>{o.charAt(0) + o.slice(1).toLowerCase()}</option>
              ))}
            </select>
          </div>

          <div className="col-span-1 lg:col-span-2">
            <label htmlFor="template-unit" className={labelClass}>Measurement Unit</label>
            <select
              id="template-unit"
              value={unit}
              disabled={isLoading}
              onChange={(e) => handleUnitChange(e.target.value)}
              className={`${inputClass} border-slate-200 cursor-pointer`}
            >
              {TEMPLATE_UNIT_VALUES.map((v) => (
                <option key={v} value={v}>
                  {v === TEMPLATE_UNITS.MM ? 'Millimetres (print)' : 'Pixels'}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="template-width" className={labelClass}>
              Width ({u}) <span className="text-rose-500">*</span>
            </label>
            <input
              id="template-width"
              type="number"
              min="1"
              step="0.1"
              value={formData.width}
              disabled={isLoading}
              onChange={(e) => update({ width: e.target.value })}
              className={`${inputClass} font-mono ${errors.width ? 'border-rose-400' : 'border-slate-200'}`}
            />
            {errors.width && <p className="text-[11px] text-rose-600 mt-1 font-semibold">{errors.width}</p>}
          </div>

          <div>
            <label htmlFor="template-height" className={labelClass}>
              Height ({u}) <span className="text-rose-500">*</span>
            </label>
            <input
              id="template-height"
              type="number"
              min="1"
              step="0.1"
              value={formData.height}
              disabled={isLoading}
              onChange={(e) => update({ height: e.target.value })}
              className={`${inputClass} font-mono ${errors.height ? 'border-rose-400' : 'border-slate-200'}`}
            />
            {errors.height && <p className="text-[11px] text-rose-600 mt-1 font-semibold">{errors.height}</p>}
          </div>
        </div>
        {/* <p className="text-[11px] text-slate-400 -mt-2">
          Standard ID card (CR80): 86 × 54 mm. Changing the unit converts every position and size on both sides.
        </p> */}
      </div>

      {/* Live layout warning */}
      {outOfBounds.length > 0 && !errors.layout && (
        <div className="flex items-start gap-2.5 rounded-2xl border border-amber-200 bg-linear-to-r from-amber-50 via-orange-50 to-yellow-50 px-3.5 py-2.5 text-xs text-amber-900 shadow-sm shadow-amber-500/10">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-linear-to-br from-amber-400 to-orange-500 text-white">
            <AlertTriangle className="w-3 h-3" />
          </span>
          <span className="pt-0.5">
            Outside the card, move or resize before saving: <strong>{outOfBounds.join(', ')}</strong>
          </span>
        </div>
      )}

      {/* Asset loading problems */}
      {assetsError && (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-linear-to-r from-amber-50 via-orange-50 to-yellow-50 px-3.5 py-2.5 text-xs text-amber-900">
          <span className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            School images (letterhead, logo, signature, stamp) couldn&apos;t be loaded: {assetsError}
          </span>
          <button type="button" onClick={reloadAssets} className="inline-flex items-center gap-1 font-semibold hover:underline">
            <RefreshCw className="w-3.5 h-3.5" /> Retry
          </button>
        </div>
      )}
      {!assetsLoading && unusableAssetCount > 0 && (
        <p className="text-xs text-slate-500">
          {unusableAssetCount} school {unusableAssetCount === 1 ? 'image is' : 'images are'} hidden because{' '}
          {unusableAssetCount === 1 ? 'it was' : 'they were'} saved as embedded data instead of an uploaded file link.
          Re-upload {unusableAssetCount === 1 ? 'it' : 'them'} in the school profile to use on cards.
        </p>
      )}

      {/* Old templates: background URL without an asset / old logo link */}
      {!formData.backgroundAssetId && formData.background && (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-indigo-100 bg-linear-to-r from-white to-indigo-50/60 px-3.5 py-2.5 text-xs text-slate-600">
          <span>This template uses an older background image link. Pick a letterhead in Design → Background to replace it.</span>
          <button type="button" onClick={() => update({ background: null, frontBackgroundType: TEMPLATE_BACKGROUND_TYPES.SOLID })} className="inline-flex items-center gap-1 font-semibold text-rose-600 hover:text-rose-700 shrink-0">
            <X className="w-3.5 h-3.5" /> Remove
          </button>
        </div>
      )}
      {formData.logo && (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-indigo-100 bg-linear-to-r from-white to-indigo-50/60 px-3.5 py-2.5 text-xs text-slate-600">
          <span>
            This template has an older logo link. Add a <strong>Logo</strong> image in Elements instead, then remove the old one.
          </span>
          <button type="button" onClick={() => update({ logo: null })} className="inline-flex items-center gap-1 font-semibold text-rose-600 hover:text-rose-700 shrink-0">
            <X className="w-3.5 h-3.5" /> Remove old logo
          </button>
        </div>
      )}

      <Suspense fallback={<RouteLoader message="Loading card designer..." />}>
        <CardDesigner
          formData={formData}
          themes={themes}
          themesLoading={themesLoading}
          usableAssets={usableAssets}
          assetsLoading={assetsLoading}
          schoolImages={schoolImages}
          schoolImagesLoading={schoolImagesLoading}
          schoolImagesError={schoolImagesError}
          onRetrySchoolImages={() => dispatch(fetchDesignerContextRequested())}
          profileUrls={profileUrls}
          previewData={previewData}
          previewLoading={previewLoading}
          previewError={previewError}
          invalidLabels={invalidLabels}
          handlers={designerHandlers}
        />
      </Suspense>

      {/* Actions */}
      {/* Neeche chipka hua action bar: lamba designer scroll karte hue bhi Save haath mein */}
      <div className="sticky bottom-3 z-20 flex items-center justify-end gap-2 rounded-2xl border border-white/60 bg-white/80 p-2 shadow-lg shadow-indigo-500/10 ring-1 ring-slate-200/70 backdrop-blur-md">
        <button
          type="button"
          disabled={isLoading}
          onClick={handleCancel}
          className="h-10 rounded-xl px-4 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-linear-to-r from-indigo-600 via-violet-600 to-fuchsia-600 px-5 text-sm font-bold text-white shadow-lg shadow-violet-500/30 transition-all hover:-translate-y-0.5 hover:shadow-xl focus:outline-hidden focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Saving…
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              {isEdit ? 'Save Template' : 'Create Template'}
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default TemplateForm;