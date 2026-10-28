import React, { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CreditCard,
  Palette,
  Save,
  Layout,
  Settings2,
  AlertTriangle,
  FileImage,
  Check,
  RefreshCw,
  X,
} from 'lucide-react';
import { ROUTES } from '../../constants/routes.js';
import {
  TEMPLATE_ORIENTATIONS,
  TEMPLATE_ORIENTATION_VALUES,
  TEMPLATE_FONT_WEIGHTS,
  TEMPLATE_FIELDS,
  TEMPLATE_FIELD_LABELS,
  TEMPLATE_UNITS,
  TEMPLATE_UNIT_VALUES,
  TEMPLATE_UNIT_LABELS,
  TEMPLATE_TEXT_ALIGNS,
  TEMPLATE_BACKGROUND_FITS,
  TEMPLATE_BACKGROUND_FIT_VALUES,
  TEMPLATE_BACKGROUND_FIT_LABELS,
  TEMPLATE_PHOTO_SHAPES,
  TEMPLATE_OBJECT_FITS,
  TEMPLATE_IMAGE_LAYER_ASSET_TYPE,
  TEMPLATE_IMAGE_LAYER_DEFAULTS,
  TEMPLATE_MAX_IMAGE_LAYERS,
  TEMPLATE_MAX_FIELDS,
  TEMPLATE_DEFAULT_CARD,
  LETTERHEAD_ASSET_TYPE,
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
import { useCollegeAssets } from '../../hooks/useCollegeAssets.js';
import ErrorMessage from '../common/ErrorMessage.jsx';
import RouteLoader from '../common/RouteLoader.jsx';

// Lazy load the visual template designer to keep the initial bundle small
const TemplateDesigner = lazy(() => import('./designer/TemplateDesigner.jsx'));

/* ------------------------------------------------------------------ */
/* Defaults & normalizers                                              */
/* ------------------------------------------------------------------ */

const makeField = (field, overrides = {}) => ({
  field,
  label: TEMPLATE_FIELD_LABELS[field] || '',
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

const makeQrCode = (unit, cardWidth, cardHeight) => {
  const size = lengthForUnit(13, unit);
  const margin = lengthForUnit(3, unit);
  return {
    // Upar-daayein kona (signature/stamp neeche-daayein jaate hain)
    x: Math.max(0, round2(cardWidth - size - margin)),
    y: margin,
    width: size,
    height: size,
    visible: true,
  };
};

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
  });

const buildInitialState = (iv) => {
  if (!iv) {
    const { unit, width, height } = TEMPLATE_DEFAULT_CARD;
    return {
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
      version: null,
    };
  }

  return {
    name: iv.name || '',
    orientation: iv.orientation || TEMPLATE_ORIENTATIONS.PORTRAIT,
    // Purane templates bina unit ke = PX (backend default)
    unit: iv.unit || TEMPLATE_UNITS.PX,
    width: toNumber(iv.width, 86),
    height: toNumber(iv.height, 54),
    backgroundAssetId: idOf(iv.backgroundAssetId),
    background: iv.background || null,
    backgroundFit: iv.backgroundFit || TEMPLATE_BACKGROUND_FITS.COVER,
    logo: iv.logo || null,
    primaryColor: iv.primaryColor || '#4F46E5',
    secondaryColor: iv.secondaryColor || '#9333EA',
    fields: Array.isArray(iv.fields) && iv.fields.length > 0 ? iv.fields.map(normalizeField) : DEFAULT_FIELDS,
    photo: iv.photo ? { ...makePhoto(iv.unit || TEMPLATE_UNITS.PX), ...iv.photo } : null,
    qrCode: iv.qrCode || null,
    imageLayers: (iv.imageLayers || []).map((l) => ({
      ...l,
      _id: l._id ? String(l._id) : undefined,
      assetId: idOf(l.assetId),
    })),
    version: iv.version ?? null,
  };
};

/* ------------------------------------------------------------------ */
/* Small UI pieces                                                     */
/* ------------------------------------------------------------------ */

const sectionClass = 'bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6';
const labelClass = 'block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2';
const inputClass =
  'w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all';

const SectionHeader = ({ icon: Icon, tone, title, subtitle, action }) => (
  <div className="flex items-center justify-between gap-3 pb-4 border-b border-slate-100">
    <div className="flex items-center gap-3">
      <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${tone}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <h2 className="text-base font-bold text-slate-800">{title}</h2>
        <p className="text-xs text-slate-500">{subtitle}</p>
      </div>
    </div>
    {action}
  </div>
);

/* ------------------------------------------------------------------ */
/* Form                                                                */
/* ------------------------------------------------------------------ */

export const TemplateForm = ({
  initialValues = null,
  isEdit = false,
  isLoading = false,
  errorMessage = null,
  onSubmit,
  onCancel,
}) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('DESIGN'); // 'DESIGN' | 'SETUP'
  const [formData, setFormData] = useState(() => buildInitialState(initialValues));
  const [errors, setErrors] = useState({});

  const { assets, isLoading: assetsLoading, error: assetsError, reload: reloadAssets } = useCollegeAssets();

  useEffect(() => {
    if (initialValues) setFormData(buildInitialState(initialValues));
  }, [initialValues]);

  const usableAssets = useMemo(() => assets.filter(isUsableAsset), [assets]);
  // Base64 / bahut lambe URL wale assets layer mein save nahi ho sakte (backend maxlength 1000)
  const unusableAssetCount = assets.length - usableAssets.length;
  const letterheads = usableAssets.filter((a) => a.type === LETTERHEAD_ASSET_TYPE);
  const outOfBounds = useMemo(() => getOutOfBoundsElements(formData), [formData]);

  const unit = formData.unit;
  const u = TEMPLATE_UNIT_LABELS[unit] || unit;
  const cardWidth = toNumber(formData.width, 86);
  const cardHeight = toNumber(formData.height, 54);

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

  /* ---------- Card setup ---------- */

  const handleOrientationChange = (orientation) => {
    setFormData((prev) => {
      const w = toNumber(prev.width);
      const h = toNumber(prev.height);
      const wantsPortrait = orientation === TEMPLATE_ORIENTATIONS.PORTRAIT;
      // Orientation badle to width/height swap, taaki card sach mein ghoome
      const shouldSwap = (wantsPortrait && w > h) || (!wantsPortrait && h > w);
      return shouldSwap ? { ...prev, orientation, width: h, height: w } : { ...prev, orientation };
    });
  };

  const handleUnitChange = (nextUnit) => {
    setFormData((prev) => convertTemplateUnits(prev, prev.unit, nextUnit));
  };

  /* ---------- Fields ---------- */

  const handleAddField = (fieldName) => {
    setFormData((prev) => {
      if (prev.fields.some((f) => f.field === fieldName) || prev.fields.length >= TEMPLATE_MAX_FIELDS) return prev;
      const lastY = prev.fields.reduce((max, f) => Math.max(max, toNumber(f.y)), 0);
      const gap = lengthForUnit(5, prev.unit);
      const fontSize = fontForUnit(8, prev.unit);
      const y = clamp(round2(lastY + gap), 0, Math.max(0, toNumber(prev.height) - gap));
      const x = clamp(lengthForUnit(34, prev.unit), 0, Math.max(0, toNumber(prev.width) - gap));
      return { ...prev, fields: [...prev.fields, makeField(fieldName, { x, y, fontSize })] };
    });
  };

  const handleUpdateField = (index, patch) => {
    setFormData((prev) => {
      const fields = [...prev.fields];
      fields[index] = { ...fields[index], ...patch };
      return { ...prev, fields };
    });
    if (errors.fields) setErrors((prev) => ({ ...prev, fields: null }));
  };

  const handleRemoveField = (index) => {
    setFormData((prev) => ({ ...prev, fields: prev.fields.filter((_, i) => i !== index) }));
  };

  /* ---------- Photo & QR ---------- */

  const handleAddPhoto = () => setFormData((prev) => ({ ...prev, photo: makePhoto(prev.unit) }));
  const handleUpdatePhoto = (photo) => setFormData((prev) => ({ ...prev, photo }));
  const handleAddQrCode = () =>
    setFormData((prev) => ({
      ...prev,
      qrCode: makeQrCode(prev.unit, toNumber(prev.width), toNumber(prev.height)),
    }));
  const handleUpdateQrCode = (qrCode) => setFormData((prev) => ({ ...prev, qrCode }));

  /* ---------- Image layers ---------- */

  // Returns the new layer's key so the designer can select it
  const handleAddLayer = (type) => {
    if (formData.imageLayers.length >= TEMPLATE_MAX_IMAGE_LAYERS) return null;
    const assetType = TEMPLATE_IMAGE_LAYER_ASSET_TYPE[type];
    const candidates = usableAssets.filter((a) => !assetType || a.type === assetType);
    if (candidates.length === 0) return null;

    const usedIds = new Set(formData.imageLayers.map((l) => String(l.assetId)));
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
    setFormData((prev) => ({ ...prev, imageLayers: [...prev.imageLayers, layer] }));
    return clientId;
  };

  const handleUpdateLayer = (key, patch) => {
    setFormData((prev) => ({
      ...prev,
      imageLayers: prev.imageLayers.map((l) => (getLayerKey(l) === key ? { ...l, ...patch } : l)),
    }));
  };

  const handleRemoveLayer = (key) => {
    setFormData((prev) => ({
      ...prev,
      imageLayers: prev.imageLayers.filter((l) => getLayerKey(l) !== key),
    }));
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

    if (formData.fields.length === 0) newErrors.fields = 'Add at least one student field to the card';
    if (formData.fields.length > TEMPLATE_MAX_FIELDS) newErrors.fields = `A card can have at most ${TEMPLATE_MAX_FIELDS} fields`;

    if (formData.imageLayers.length > TEMPLATE_MAX_IMAGE_LAYERS) {
      newErrors.imageLayers = `A card can have at most ${TEMPLATE_MAX_IMAGE_LAYERS} images`;
    } else {
      const unknown = formData.imageLayers.findIndex(
        (l) => !l.assetId || !usableAssets.some((a) => String(a._id) === String(l.assetId))
      );
      // Assets load na hue hon to ye check skip (backend phir bhi verify karta hai)
      if (!assetsLoading && !assetsError && unknown !== -1) {
        newErrors.imageLayers = `Image ${unknown + 1} on the card is no longer available. Pick another image or remove it.`;
      }
    }

    if (outOfBounds.length) newErrors.layout = `These go outside the card: ${outOfBounds.join(', ')}`;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const buildPayload = () => {
    const num = (v, fallback = 0) => round2(toNumber(v, fallback));
    return {
      name: formData.name.trim(),
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
      fields: formData.fields.map((f) => ({
        field: f.field,
        label: f.label?.trim() || null,
        x: num(f.x),
        y: num(f.y),
        width: f.width === null || f.width === '' ? null : num(f.width),
        fontSize: num(f.fontSize, 12),
        fontWeight: f.fontWeight || TEMPLATE_FONT_WEIGHTS.NORMAL,
        fontFamily: f.fontFamily || 'Arial',
        color: f.color || '#000000',
        textAlign: f.textAlign || TEMPLATE_TEXT_ALIGNS.LEFT,
        maxLines: Math.round(toNumber(f.maxLines, 1)),
        visible: f.visible !== false,
      })),
      photo: formData.photo
        ? {
          x: num(formData.photo.x),
          y: num(formData.photo.y),
          width: num(formData.photo.width),
          height: num(formData.photo.height),
          shape: formData.photo.shape,
          borderRadius: num(formData.photo.borderRadius),
          borderWidth: num(formData.photo.borderWidth),
          borderColor: formData.photo.borderColor || null,
          objectFit: formData.photo.objectFit,
          visible: formData.photo.visible !== false,
        }
        : null,
      qrCode: formData.qrCode
        ? {
          x: num(formData.qrCode.x),
          y: num(formData.qrCode.y),
          width: num(formData.qrCode.width),
          height: num(formData.qrCode.height),
          visible: formData.qrCode.visible !== false,
        }
        : null,
      // url nahi bhejte — backend asset se copy karta hai. Saved layers apna _id rakhte hain.
      imageLayers: formData.imageLayers.map((l) => ({
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
      })),
    };
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLoading) return;
    if (!validate()) return;

    // undefined keys hata do (JSON mein waise bhi nahi jaate, par saaf rakhna)
    const payload = JSON.parse(JSON.stringify(buildPayload()));
    onSubmit(payload);
  };

  const handleCancel = () => (onCancel ? onCancel() : navigate(ROUTES.TEMPLATES));

  const selectedLetterhead = letterheads.find((a) => String(a._id) === String(formData.backgroundAssetId));
  const errorList = [errors.fields, errors.imageLayers, errors.layout].filter(Boolean);

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6 max-w-6xl">
      {errorMessage && <ErrorMessage message={errorMessage} title="Couldn't save the template" />}

      {errorList.length > 0 && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800" role="alert">
          <p className="font-semibold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> Fix these before saving
          </p>
          <ul className="mt-2 ml-6 list-disc space-y-1">
            {errorList.map((msg) => (
              <li key={msg}>{msg}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Section 1: Basics (always visible) */}
      <div className={sectionClass}>
        <SectionHeader
          icon={CreditCard}
          tone="bg-indigo-50 border-indigo-100 text-indigo-600"
          title="Template Details"
          subtitle="Name, orientation and card size"
          action={
            isEdit && formData.version ? (
              <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                Version {formData.version}
              </span>
            ) : null
          }
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="sm:col-span-2 lg:col-span-4">
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
            {errors.name && <p className="text-xs text-rose-500 mt-1.5 font-medium">{errors.name}</p>}
          </div>

          <div>
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

          <div>
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
            {errors.width && <p className="text-xs text-rose-500 mt-1.5 font-medium">{errors.width}</p>}
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
            {errors.height && <p className="text-xs text-rose-500 mt-1.5 font-medium">{errors.height}</p>}
          </div>
        </div>
        <p className="text-[11px] text-slate-400 -mt-2">
          Standard ID card: 86 × 54 mm. Changing the unit converts every position and size on the card.
        </p>
      </div>

      {/* Live layout warning */}
      {outOfBounds.length > 0 && !errors.layout && (
        <div className="flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            Outside the card, move or resize before saving: <strong>{outOfBounds.join(', ')}</strong>
          </span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200" role="tablist">
        {[
          { key: 'DESIGN', icon: Layout, label: 'Card Designer' },
          { key: 'SETUP', icon: Settings2, label: 'Letterhead & Theme' },
        ].map(({ key, icon: Icon, label }) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={activeTab === key}
            onClick={() => setActiveTab(key)}
            className={`flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all ${activeTab === key ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Asset loading problems affect both tabs */}
      {assetsError && (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
          <span className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            College images (letterhead, logo, signature, stamp) couldn&apos;t be loaded: {assetsError}
          </span>
          <button type="button" onClick={reloadAssets} className="inline-flex items-center gap-1 font-semibold hover:underline">
            <RefreshCw className="w-3.5 h-3.5" /> Retry
          </button>
        </div>
      )}
      {!assetsLoading && unusableAssetCount > 0 && (
        <p className="text-xs text-slate-500">
          {unusableAssetCount} college {unusableAssetCount === 1 ? 'image is' : 'images are'} hidden because{' '}
          {unusableAssetCount === 1 ? 'it was' : 'they were'} saved as embedded data instead of an uploaded file link.
          Re-upload {unusableAssetCount === 1 ? 'it' : 'them'} in the College profile to use on cards.
        </p>
      )}

      {activeTab === 'DESIGN' && (
        <Suspense fallback={<RouteLoader message="Loading card designer..." />}>
          <TemplateDesigner
            formData={formData}
            usableAssets={usableAssets}
            assetsLoading={assetsLoading}
            onAddField={handleAddField}
            onUpdateField={handleUpdateField}
            onRemoveField={handleRemoveField}
            onAddPhoto={handleAddPhoto}
            onUpdatePhoto={handleUpdatePhoto}
            onAddQrCode={handleAddQrCode}
            onUpdateQrCode={handleUpdateQrCode}
            onAddLayer={handleAddLayer}
            onUpdateLayer={handleUpdateLayer}
            onRemoveLayer={handleRemoveLayer}
          />
        </Suspense>
      )}

      {activeTab === 'SETUP' && (
        <>
          {/* Letterhead */}
          <div className={sectionClass}>
            <SectionHeader
              icon={FileImage}
              tone="bg-emerald-50 border-emerald-100 text-emerald-600"
              title="Letterhead (Card Background)"
              subtitle="Pick one of the college's uploaded letterhead designs"
            />

            {assetsLoading ? (
              <p className="text-sm text-slate-500">Loading letterheads…</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                <button
                  type="button"
                  onClick={() => update({ backgroundAssetId: null, background: null })}
                  aria-pressed={!formData.backgroundAssetId && !formData.background}
                  className={`aspect-[86/54] rounded-xl border-2 grid place-items-center text-xs font-semibold transition-colors ${!formData.backgroundAssetId && !formData.background
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-dashed border-slate-300 text-slate-500 hover:border-slate-400'
                    }`}
                >
                  No letterhead
                </button>

                {letterheads.map((asset) => {
                  const isSelected = String(asset._id) === String(formData.backgroundAssetId);
                  return (
                    <button
                      key={asset._id}
                      type="button"
                      onClick={() => update({ backgroundAssetId: asset._id, background: asset.url })}
                      aria-pressed={isSelected}
                      title={asset.name}
                      className={`relative aspect-[86/54] rounded-xl border-2 overflow-hidden bg-slate-50 transition-colors ${isSelected ? 'border-indigo-500' : 'border-slate-200 hover:border-slate-400'
                        }`}
                    >
                      <img src={asset.url} alt={asset.name || 'Letterhead'} className="w-full h-full object-cover" />
                      {isSelected && (
                        <span className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-indigo-600 text-white grid place-items-center">
                          <Check className="w-3 h-3" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {!assetsLoading && letterheads.length === 0 && (
              <p className="text-xs text-slate-500">
                No letterhead uploaded for this college yet. Upload one as a college asset of type LETTERHEAD to use it here.
              </p>
            )}

            {/* Old templates: background URL without an asset */}
            {!formData.backgroundAssetId && formData.background && (
              <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 border border-slate-200 p-3 text-xs text-slate-600">
                <span>This template uses an older background image link. Pick a letterhead above to replace it.</span>
                <button type="button" onClick={() => update({ background: null })} className="inline-flex items-center gap-1 font-semibold text-rose-600 hover:text-rose-700 shrink-0">
                  <X className="w-3.5 h-3.5" /> Remove
                </button>
              </div>
            )}

            {(formData.backgroundAssetId || formData.background) && (
              <div className="max-w-xs">
                <label htmlFor="template-bg-fit" className={labelClass}>Background fit</label>
                <select
                  id="template-bg-fit"
                  value={formData.backgroundFit}
                  onChange={(e) => update({ backgroundFit: e.target.value })}
                  className={`${inputClass} border-slate-200 cursor-pointer`}
                >
                  {TEMPLATE_BACKGROUND_FIT_VALUES.map((f) => (
                    <option key={f} value={f}>{TEMPLATE_BACKGROUND_FIT_LABELS[f] || f}</option>
                  ))}
                </select>
                {selectedLetterhead && (
                  <p className="text-[11px] text-slate-400 mt-1.5 truncate">Selected: {selectedLetterhead.name}</p>
                )}
              </div>
            )}
          </div>

          {/* Theme colors */}
          <div className={sectionClass}>
            <SectionHeader
              icon={Palette}
              tone="bg-purple-50 border-purple-100 text-purple-600"
              title="Theme Colors"
              subtitle="Used for the accent bars when the card has no letterhead"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                { key: 'primaryColor', label: 'Primary color', fallback: '#4F46E5' },
                { key: 'secondaryColor', label: 'Secondary color', fallback: '#9333EA' },
              ].map(({ key, label, fallback }) => (
                <div key={key}>
                  <label htmlFor={`template-${key}`} className={labelClass}>{label}</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={/^#[0-9a-f]{6}$/i.test(formData[key] || '') ? formData[key] : fallback}
                      disabled={isLoading}
                      onChange={(e) => update({ [key]: e.target.value })}
                      className="w-10 h-10 p-0 border border-slate-200 rounded-xl cursor-pointer shrink-0"
                      aria-label={`${label} picker`}
                    />
                    <input
                      id={`template-${key}`}
                      type="text"
                      maxLength={50}
                      value={formData[key] || ''}
                      disabled={isLoading}
                      onChange={(e) => update({ [key]: e.target.value })}
                      placeholder={fallback}
                      className={`${inputClass} border-slate-200 font-mono`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Old logo link (only for older templates) */}
          {formData.logo && (
            <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
              <span>
                This template has an older logo link. Add a <strong>Logo</strong> image in the Card Designer instead, then remove the old one.
              </span>
              <button type="button" onClick={() => update({ logo: null })} className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700 shrink-0">
                <X className="w-3.5 h-3.5" /> Remove old logo
              </button>
            </div>
          )}
        </>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          disabled={isLoading}
          onClick={handleCancel}
          className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-100 disabled:opacity-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-600/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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