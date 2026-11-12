import React, { useEffect, useState } from 'react';
import { Sliders, Trash2, Eye, EyeOff, AlertTriangle, Lock, Unlock, BringToFront, SendToBack, School } from 'lucide-react';
import {
  TEMPLATE_FONT_WEIGHTS,
  TEMPLATE_FIELD_LABELS,
  TEMPLATE_TEXT_ALIGN_VALUES,
  TEMPLATE_FONT_FAMILIES,
  TEMPLATE_PHOTO_SHAPES,
  TEMPLATE_PHOTO_SHAPE_VALUES,
  TEMPLATE_OBJECT_FIT_VALUES,
  TEMPLATE_IMAGE_LAYER_LABELS,
  TEMPLATE_IMAGE_LAYER_ASSET_TYPE,
  TEMPLATE_UNIT_LABELS,
  TEMPLATE_UNITS,
  FIELD_MIN_FONT_SIZE,
  FIELD_MAX_FONT_SIZE,
  FIELD_MAX_LINES,
  PHOTO_BOX_MIN_WIDTH,
  PHOTO_BOX_MIN_HEIGHT,
  PHOTO_MAX_BORDER_WIDTH,
  DESIGNER_ELEMENT_TYPES,
  TEMPLATE_QR_CONTENT_TYPES,
  TEMPLATE_QR_CONTENT_TYPE_LABELS,
  TEMPLATE_FONT_STYLES,
  TEMPLATE_TEXT_TRANSFORMS,
  TEMPLATE_IMAGE_ALIGNS,
  TEMPLATE_COLLEGE_PROFILE_IMAGE_LABELS,
  isProfileImageLayer,
  TEMPLATE_FIELDS,
  TEMPLATE_FIELD_DISPLAY_MODES,
  TEMPLATE_FIELD_DISPLAY_MODE_VALUES,
  TEMPLATE_FIELD_DISPLAY_MODE_LABELS,
  TEMPLATE_ICON_POSITIONS,
  TEMPLATE_ICON_SOURCES,
  TEMPLATE_ICON_SIZE_MAX,
  TEMPLATE_VALUE_SOURCES,
  TEMPLATE_FIELD_CUSTOM_VALUE_MAX,
} from '../../../constants/template.js';
import { clamp, round2, toNumber, getLayerKey, isSafeImageUrl } from '../../../utils/templateLayout.js';
import { lockedSizePatch, maxRotationFor, isSchoolValueField } from '../../../utils/templateDesigner.js';
import { CollapsibleSection, HexColorField, SwitchField } from './designerControls.jsx';
import IconPicker from './IconPicker.jsx';
import {
  ImageLayerFlipControls,
  ImageLayerFrameSection,
  ImageLayerSizeControls,
  ResetImageStyleButton,
} from './ImageLayerStyleSections.jsx';
import BackgroundRemovalSection from './BackgroundRemovalSection.jsx';
import TextBoxSection from './TextBoxSection.jsx';

const inputClass =
  'w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white';
const labelClass = 'block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1';

/**
 * Number input: type karte waqt range mein ho to turant apply, blur par clamp.
 * allowEmpty = khaali chhodne par null (jaise text width "auto").
 */
const NumberField = ({ label, value, min = -Infinity, max = Infinity, step = 0.5, onCommit, allowEmpty = false, placeholder }) => {
  const [draft, setDraft] = useState(value ?? '');
  useEffect(() => setDraft(value ?? ''), [value]);

  const safeMax = Math.max(min, max);

  const commit = () => {
    if (draft === '' || draft === null) {
      if (allowEmpty) {
        if (value !== null) onCommit(null);
      } else {
        setDraft(value ?? '');
      }
      return;
    }
    const n = Number(draft);
    if (!Number.isFinite(n)) {
      setDraft(value ?? '');
      return;
    }
    const clamped = round2(clamp(n, min, safeMax));
    setDraft(clamped);
    if (clamped !== value) onCommit(clamped);
  };

  return (
    <div>
      <label className={labelClass}>{label}</label>
      <input
        type="number"
        step={step}
        min={Number.isFinite(min) ? min : undefined}
        max={Number.isFinite(safeMax) ? safeMax : undefined}
        value={draft}
        placeholder={placeholder}
        onChange={(e) => {
          setDraft(e.target.value);
          const n = Number(e.target.value);
          if (e.target.value !== '' && Number.isFinite(n) && n >= min && n <= safeMax) onCommit(n);
        }}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            commit();
          }
        }}
        className={`${inputClass} font-mono`}
      />
    </div>
  );
};

const Header = ({ title, subtitle, visible, onToggleVisible, onRemove, removeLabel }) => (
  <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100">
    <div className="min-w-0">
      <h3 className="text-sm font-bold text-slate-800 truncate">{title}</h3>
      {subtitle && <p className="text-[11px] text-slate-400 truncate">{subtitle}</p>}
    </div>
    <div className="flex items-center gap-1 shrink-0">
      {onToggleVisible && (
        <button
          type="button"
          onClick={onToggleVisible}
          className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50"
          title={visible ? 'Hide on card' : 'Show on card'}
          aria-label={visible ? 'Hide on card' : 'Show on card'}
        >
          {visible ? <Eye className="w-4 h-4 text-emerald-600" /> : <EyeOff className="w-4 h-4 text-slate-400" />}
        </button>
      )}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="p-1.5 rounded-lg border border-slate-200 text-rose-500 hover:bg-rose-50"
          title={removeLabel}
          aria-label={removeLabel}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </div>
  </div>
);

/** x, y, width, height inputs that keep the box inside the card */
const BoxFields = ({ box, cardWidth, cardHeight, unitLabel, minWidth = 1, minHeight = 1, onChange }) => {
  const x = toNumber(box.x);
  const y = toNumber(box.y);
  const w = toNumber(box.width);
  const h = toNumber(box.height);
  return (
    <div className="grid grid-cols-2 gap-3">
      <NumberField label={`X (${unitLabel})`} value={box.x} min={0} max={cardWidth - w} onCommit={(v) => onChange({ x: v })} />
      <NumberField label={`Y (${unitLabel})`} value={box.y} min={0} max={cardHeight - h} onCommit={(v) => onChange({ y: v })} />
      <NumberField label={`Width (${unitLabel})`} value={box.width} min={minWidth} max={cardWidth - x} onCommit={(v) => onChange({ width: v })} />
      <NumberField label={`Height (${unitLabel})`} value={box.height} min={minHeight} max={cardHeight - y} onCommit={(v) => onChange({ height: v })} />
    </div>
  );
};

const Panel = ({ children }) => (
  <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">{children}</div>
);

// Color input + hex; onClear se "default" (null)
const ColorField = ({ label, value, fallback = '#000000', onChange, onClear }) => (
  <div>
    <label className={labelClass}>{label}</label>
    <div className="flex items-center gap-1.5">
      <input
        type="color"
        value={/^#[0-9a-f]{6}$/i.test(value || '') ? value : fallback}
        onChange={(e) => onChange(e.target.value)}
        className="w-9 h-8.5 p-0.5 border border-slate-200 rounded-xl cursor-pointer shrink-0"
        aria-label={`${label} picker`}
      />
      <input
        type="text"
        maxLength={7}
        value={value || ''}
        placeholder={onClear ? 'Default' : fallback}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputClass} font-mono`}
        aria-label={`${label} hex`}
      />
      {onClear && value && (
        <button type="button" onClick={onClear} className="text-[11px] font-semibold text-slate-500 hover:text-slate-700 shrink-0">
          Reset
        </button>
      )}
    </div>
  </div>
);

// 3 buttons ki segmented row (image align)
const SegmentRow = ({ label, options, onPick, activeKey }) => (
  <div>
    <label className={labelClass}>{label}</label>
    <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-xl">
      {options.map(({ key, text }) => (
        <button
          key={key}
          type="button"
          onClick={() => onPick(key)}
          aria-pressed={activeKey === key}
          className={`py-1.5 rounded-lg text-[11px] font-semibold ${activeKey === key ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
        >
          {text}
        </button>
      ))}
    </div>
  </div>
);

// Chhota on/off toggle button (Italic, UPPERCASE)
const ToggleChip = ({ active, onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={active}
    className={`flex-1 py-1.5 rounded-lg text-[11px] font-semibold border ${active ? 'border-indigo-200 bg-indigo-50 text-indigo-700' : 'border-slate-200 bg-white text-slate-600'}`}
  >
    {children}
  </button>
);

/* ---------- Field: Label & Icon + school Value (naye sections) ---------- */

const { LABEL, ICON, ICON_AND_LABEL, VALUE_ONLY } = TEMPLATE_FIELD_DISPLAY_MODES;

// displayMode null = purana tareeka (showLabel se)
const displayModeOf = (field) => field.displayMode || (field.showLabel === false ? VALUE_ONLY : LABEL);
const modeUsesIcon = (mode) => mode === ICON || mode === ICON_AND_LABEL;
const modeShowsLabel = (mode) => mode === LABEL || mode === ICON_AND_LABEL;

// "Show label" checkbox ka asar naye display mode par (icon bana rahe)
const modeForShowLabel = (mode, show) => {
  if (show) return mode === ICON ? ICON_AND_LABEL : mode === VALUE_ONLY ? LABEL : mode;
  return mode === ICON_AND_LABEL ? ICON : mode === LABEL ? VALUE_ONLY : mode;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Active state: indigo → violet (designer jaisa)
const GradientSegment = ({ label, options, value, onChange }) => (
  <div>
    <label className={labelClass}>{label}</label>
    <div className="grid gap-1 rounded-xl bg-slate-100 p-1" style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }} role="group" aria-label={label}>
      {options.map(({ key, text }) => (
        <button
          key={key}
          type="button"
          onClick={() => onChange(key)}
          aria-pressed={value === key}
          className={`min-w-0 truncate rounded-lg px-1 py-1.5 text-[11px] font-semibold ${
            value === key
              ? 'bg-linear-to-r from-indigo-600 to-violet-600 text-white shadow-sm shadow-indigo-500/30'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          {text}
        </button>
      ))}
    </div>
  </div>
);

const LabelIconSection = ({ field, unitLabel, onSet }) => {
  const mode = displayModeOf(field);
  const icon = field.icon || null;
  const textColor = field.labelColor || field.color || '#000000';

  const setMode = (next) => onSet({ displayMode: next, showLabel: modeShowsLabel(next) });
  const setIcon = (patch) => onSet({ icon: { ...icon, ...patch } });

  // Naya icon chuna: rang / size / position wahi rahe
  const pickIcon = (next) => {
    if (!next) {
      onSet({ icon: null });
      return;
    }
    const keep = {
      color: icon?.color ?? null,
      size: icon?.size ?? null,
      position: icon?.position || TEMPLATE_ICON_POSITIONS.LEFT,
      gap: icon?.gap ?? null,
      background: icon?.background ?? null,
    };
    onSet({
      icon: next.source === TEMPLATE_ICON_SOURCES.UPLOAD
        ? { ...keep, source: TEMPLATE_ICON_SOURCES.UPLOAD, key: null, url: next.url, publicId: next.publicId || null }
        : { ...keep, source: TEMPLATE_ICON_SOURCES.LIBRARY, key: next.key, url: null, publicId: null },
    });
  };

  return (
    <CollapsibleSection title="Label & Icon">
      <GradientSegment
        label="Display"
        value={mode}
        onChange={setMode}
        options={TEMPLATE_FIELD_DISPLAY_MODE_VALUES.map((key) => ({ key, text: TEMPLATE_FIELD_DISPLAY_MODE_LABELS[key] }))}
      />

      {modeUsesIcon(mode) && (
        <>
          <div>
            <label className={labelClass}>Icon</label>
            <IconPicker icon={icon} color={icon?.color || textColor} onChange={pickIcon} />
            {!icon && <p className="mt-1 text-[11px] text-amber-700">Pick an icon — until then only the value is printed.</p>}
          </div>

          {icon && (
            <>
              <SwitchField
                label="Icon colour same as text"
                checked={!icon.color}
                onChange={(same) => setIcon({ color: same ? null : textColor })}
              />
              {icon.color && icon.source !== TEMPLATE_ICON_SOURCES.UPLOAD && (
                <HexColorField label="Icon colour" value={icon.color} fallback={textColor} onChange={(v) => setIcon({ color: v })} />
              )}
              {icon.source === TEMPLATE_ICON_SOURCES.UPLOAD && (
                <p className="-mt-1 text-[11px] text-slate-400">Uploaded icons print in their own colours.</p>
              )}

              <SegmentRow
                label="Icon position"
                activeKey={icon.position || TEMPLATE_ICON_POSITIONS.LEFT}
                onPick={(position) => setIcon({ position })}
                options={[
                  { key: TEMPLATE_ICON_POSITIONS.LEFT, text: 'Left' },
                  { key: TEMPLATE_ICON_POSITIONS.RIGHT, text: 'Right' },
                  { key: TEMPLATE_ICON_POSITIONS.TOP, text: 'Top' },
                ]}
              />
              <div className="grid grid-cols-2 gap-3">
                <NumberField
                  label={`Icon size (${unitLabel})`}
                  value={icon.size ?? ''}
                  min={0.1}
                  max={TEMPLATE_ICON_SIZE_MAX}
                  step={0.5}
                  allowEmpty
                  placeholder="Auto"
                  onCommit={(v) => setIcon({ size: v })}
                />
                <NumberField
                  label={`Gap (${unitLabel})`}
                  value={icon.gap ?? ''}
                  min={0}
                  max={TEMPLATE_ICON_SIZE_MAX}
                  step={0.5}
                  allowEmpty
                  placeholder="Auto"
                  onCommit={(v) => setIcon({ gap: v })}
                />
              </div>

              <SwitchField
                label="Circle behind icon"
                checked={Boolean(icon.background)}
                onChange={(on) => setIcon({ background: on ? '#E0E7FF' : null })}
              />
              {icon.background && (
                <HexColorField label="Circle colour" value={icon.background} fallback="#E0E7FF" onChange={(v) => setIcon({ background: v })} />
              )}
            </>
          )}
        </>
      )}
    </CollapsibleSection>
  );
};

const SchoolValueSection = ({ field, schoolValue, previewLoading, onSet }) => {
  const custom = field.valueSource === TEMPLATE_VALUE_SOURCES.CUSTOM;
  const isAddress = field.field === TEMPLATE_FIELDS.COLLEGE_ADDRESS;
  const isEmail = field.field === TEMPLATE_FIELDS.COLLEGE_EMAIL;
  const text = field.customValue ?? '';
  const lines = text.split('\n').filter((line) => line.trim()).length;
  const maxLines = Math.max(1, Math.round(toNumber(field.maxLines, 1)));

  const setSource = (source) =>
    onSet(
      source === TEMPLATE_VALUE_SOURCES.CUSTOM
        // Pehli baar Custom: school ki value se shuru, edit karna aasaan
        ? { valueSource: source, customValue: field.customValue ?? schoolValue ?? '' }
        : { valueSource: source }
    );

  return (
    <CollapsibleSection title="Value">
      <GradientSegment
        label="Value comes from"
        value={custom ? TEMPLATE_VALUE_SOURCES.CUSTOM : TEMPLATE_VALUE_SOURCES.SCHOOL}
        onChange={setSource}
        options={[
          { key: TEMPLATE_VALUE_SOURCES.SCHOOL, text: 'From school profile' },
          { key: TEMPLATE_VALUE_SOURCES.CUSTOM, text: 'Custom' },
        ]}
      />

      {!custom ? (
        <div>
          <div className="min-h-9 whitespace-pre-line wrap-anywhere rounded-xl border border-slate-200 bg-slate-100/70 px-3 py-2 text-xs text-slate-600" aria-live="polite">
            {previewLoading && !schoolValue ? 'Loading school value…' : schoolValue || 'Not set in the school profile'}
          </div>
          <p className="mt-1 flex items-center gap-1 text-[11px] text-slate-400">
            <School className="h-3 w-3" /> Edit in school profile — every card updates automatically.
          </p>
        </div>
      ) : (
        <div>
          <label className={labelClass} htmlFor={`custom-value-${field.field}`}>Custom value</label>
          {isAddress ? (
            <textarea
              id={`custom-value-${field.field}`}
              rows={3}
              maxLength={TEMPLATE_FIELD_CUSTOM_VALUE_MAX}
              value={text}
              onChange={(e) => onSet({ customValue: e.target.value })}
              placeholder={'Street, area\nCity, State PIN'}
              className={inputClass}
            />
          ) : (
            <input
              id={`custom-value-${field.field}`}
              type={isEmail ? 'email' : 'text'}
              maxLength={TEMPLATE_FIELD_CUSTOM_VALUE_MAX}
              value={text}
              onChange={(e) => onSet({ customValue: e.target.value })}
              placeholder={isEmail ? 'office@school.edu' : 'Type the value to print'}
              className={inputClass}
            />
          )}
          {!text.trim() ? (
            <p className="mt-1 text-[11px] text-rose-500">Type the value, or switch back to From school profile.</p>
          ) : isEmail && !EMAIL_PATTERN.test(text.trim()) ? (
            <p className="mt-1 text-[11px] text-amber-700">This doesn&apos;t look like an email address.</p>
          ) : isAddress && lines > maxLines ? (
            <p className="mt-1 text-[11px] text-amber-700">Only {maxLines} line{maxLines === 1 ? '' : 's'} will print — raise Max lines below.</p>
          ) : null}
          {isAddress && <p className="mt-1 text-[11px] text-slate-400">Press Enter for a new line. Max lines and Line height are below.</p>}
        </div>
      )}
    </CollapsibleSection>
  );
};

export const PropertiesPanel = ({
  selectedElement,
  formData,
  usableAssets = [],
  schoolImages = [],
  profileUrls = null,
  onReorderLayer,
  onUpdateField,
  onRemoveField,
  onUpdatePhoto,
  onUpdateQrCode,
  onUpdateLayer,
  onRemoveLayer,
  renderLayers = [],
  renderFields = [],
  previewLoading = false,
  onApplyImageProcessingToAll,
}) => {
  if (!selectedElement) {
    return (
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs text-center space-y-3">
        <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
          <Sliders className="w-5 h-5" />
        </div>
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Properties</h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          Select an element on the card or in the list to edit its position and style.
        </p>
      </div>
    );
  }

  const cardWidth = toNumber(formData.width, 86);
  const cardHeight = toNumber(formData.height, 54);
  const unit = formData.unit || TEMPLATE_UNITS.PX;
  const u = TEMPLATE_UNIT_LABELS[unit] || unit;
  const fontUnit = unit === TEMPLATE_UNITS.MM ? 'pt' : 'px';

  /* ---------- Photo ---------- */
  if (selectedElement.type === DESIGNER_ELEMENT_TYPES.PHOTO && formData.photo) {
    const photo = formData.photo;
    const set = (patch) => onUpdatePhoto({ ...photo, ...patch });
    return (
      <Panel>
        <Header
          title="Student Photo"
          subtitle="Real photo comes from each student record"
          visible={photo.visible !== false}
          onToggleVisible={() => set({ visible: photo.visible === false })}
          onRemove={() => onUpdatePhoto(null)}
          removeLabel="Remove photo from card"
        />
        <BoxFields box={photo} cardWidth={cardWidth} cardHeight={cardHeight} unitLabel={u} minWidth={PHOTO_BOX_MIN_WIDTH} minHeight={PHOTO_BOX_MIN_HEIGHT} onChange={set} />
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Shape</label>
            <select value={photo.shape || TEMPLATE_PHOTO_SHAPES.RECTANGLE} onChange={(e) => set({ shape: e.target.value })} className={inputClass}>
              {TEMPLATE_PHOTO_SHAPE_VALUES.map((s) => (
                <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Photo fit</label>
            <select value={photo.objectFit || 'COVER'} onChange={(e) => set({ objectFit: e.target.value })} className={inputClass}>
              {TEMPLATE_OBJECT_FIT_VALUES.map((f) => (
                <option key={f} value={f}>{f === 'COVER' ? 'Fill (crop)' : 'Fit (no crop)'}</option>
              ))}
            </select>
          </div>
          {photo.shape === TEMPLATE_PHOTO_SHAPES.ROUNDED && (
            <NumberField label={`Corner radius (${u})`} value={photo.borderRadius ?? 0} min={0} max={Math.min(toNumber(photo.width), toNumber(photo.height)) / 2} onCommit={(v) => set({ borderRadius: v })} />
          )}
          <NumberField label={`Border width (${u})`} value={photo.borderWidth ?? 0} min={0} max={PHOTO_MAX_BORDER_WIDTH} onCommit={(v) => set({ borderWidth: v })} />
          <div>
            <label className={labelClass}>Border color</label>
            <input type="color" value={photo.borderColor || '#ffffff'} onChange={(e) => set({ borderColor: e.target.value })} className="w-full h-[34px] p-0.5 border border-slate-200 rounded-xl cursor-pointer" />
          </div>
        </div>
      </Panel>
    );
  }

  /* ---------- QR code ---------- */
  if (selectedElement.type === DESIGNER_ELEMENT_TYPES.QR && formData.qrCode) {
    const qr = formData.qrCode;
    const set = (patch) => onUpdateQrCode({ ...qr, ...patch });
    return (
      <Panel>
        <Header
          title="QR Code"
          subtitle="Generated per student when cards are printed"
          visible={qr.visible !== false}
          onToggleVisible={() => set({ visible: qr.visible === false })}
          onRemove={() => onUpdateQrCode(null)}
          removeLabel="Remove QR code from card"
        />
        <BoxFields box={qr} cardWidth={cardWidth} cardHeight={cardHeight} unitLabel={u} onChange={set} />
        <p className="text-[11px] text-slate-400">Keep width and height equal so the code scans reliably.</p>

        <div>
          <label className={labelClass}>QR contains</label>
          <select
            value={qr.contentType || TEMPLATE_QR_CONTENT_TYPES.STUDENT_VERIFICATION}
            onChange={(e) => set({ contentType: e.target.value })}
            className={inputClass}
          >
            {Object.values(TEMPLATE_QR_CONTENT_TYPES).map((type) => (
              <option key={type} value={type}>{TEMPLATE_QR_CONTENT_TYPE_LABELS[type]}</option>
            ))}
          </select>
          <p className="text-[11px] text-slate-400 mt-1">
            {qr.contentType === TEMPLATE_QR_CONTENT_TYPES.SCHOOL_DETAILS
              ? 'Shows school name, numbers and address on any phone scanner.'
              : qr.contentType === TEMPLATE_QR_CONTENT_TYPES.SCHOOL_CONTACT_CARD
                ? 'Scanning offers "Save contact" with the school numbers.'
                : qr.contentType === TEMPLATE_QR_CONTENT_TYPES.CUSTOM_TEXT
                  ? 'Any text you type below.'
                  : 'Verifies the card online (unique per student).'}
          </p>
        </div>
        {qr.contentType === TEMPLATE_QR_CONTENT_TYPES.CUSTOM_TEXT && (
          <div>
            <label className={labelClass}>QR text</label>
            <textarea
              rows={3}
              maxLength={500}
              value={qr.customText || ''}
              onChange={(e) => set({ customText: e.target.value })}
              className={inputClass}
              placeholder="Text to encode"
            />
          </div>
        )}
        <div className="grid grid-cols-2 gap-3">
          <ColorField label="Code color" value={qr.foregroundColor || '#000000'} onChange={(v) => set({ foregroundColor: v })} />
          <ColorField label="Background" value={qr.backgroundColor || '#FFFFFF'} fallback="#FFFFFF" onChange={(v) => set({ backgroundColor: v })} />
          <NumberField
            label={`Padding (${u})`}
            value={qr.padding ?? 0}
            min={0}
            max={Math.max(0, Math.min(toNumber(qr.width), toNumber(qr.height)) / 4)}
            onCommit={(v) => set({ padding: v })}
          />
        </div>
      </Panel>
    );
  }

  /* ---------- Image layer ---------- */
  if (selectedElement.type === DESIGNER_ELEMENT_TYPES.LAYER) {
    const layer = (formData.imageLayers || []).find((l) => getLayerKey(l) === selectedElement.id);
    if (!layer) return <Panel><p className="text-xs text-slate-400">This image is no longer on the card.</p></Panel>;

    const key = getLayerKey(layer);
    const set = (patch) => onUpdateLayer(key, patch);
    const profile = isProfileImageLayer(layer);
    const assetType = TEMPLATE_IMAGE_LAYER_ASSET_TYPE[layer.type];
    const options = usableAssets.filter((a) => !assetType || a.type === assetType);
    const currentMissing = !profile && layer.assetId && !options.some((a) => String(a._id) === String(layer.assetId));

    // Ratio lock: width / height mein se ek badle to doosra bhi
    const locked = layer.lockAspectRatio !== false;
    const setBox = (patch) =>
      set(locked && ('width' in patch || 'height' in patch) ? lockedSizePatch(layer, patch, cardWidth, cardHeight) : patch);
    const lw = toNumber(layer.width);
    const lh = toNumber(layer.height);
    const alignX = (a) =>
      set({
        x: round2(a === TEMPLATE_IMAGE_ALIGNS.LEFT ? 0 : a === TEMPLATE_IMAGE_ALIGNS.RIGHT ? cardWidth - lw : (cardWidth - lw) / 2),
        align: a,
      });
    const alignY = (a) => set({ y: round2(a === 'TOP' ? 0 : a === 'BOTTOM' ? cardHeight - lh : (cardHeight - lh) / 2) });
    const maxRotation = maxRotationFor(layer);
    const rotation = clamp(toNumber(layer.rotation), -maxRotation, maxRotation);

    // School profile image: live url (designer-context), na mile to cached url
    const profileUrl = profile ? (profileUrls ? profileUrls[layer.profileKey] : layer.url) : null;
    const profileMissing = profile && Boolean(profileUrls) && !profileUrl;
    const profileNote = profile ? schoolImages.find((img) => img.key === layer.profileKey)?.note : null;
    const profileLabel = profile ? TEMPLATE_COLLEGE_PROFILE_IMAGE_LABELS[layer.profileKey] || layer.profileKey : null;

    return (
      <Panel>
        <Header
          title={profile ? profileLabel : TEMPLATE_IMAGE_LAYER_LABELS[layer.type]}
          subtitle={profile ? 'Always the latest image from the school profile' : "Image from the college's uploaded assets"}
          visible={layer.visible !== false}
          onToggleVisible={() => set({ visible: layer.visible === false })}
          onRemove={() => onRemoveLayer(key)}
          removeLabel="Remove image from card"
        />

        {profile ? (
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
              {isSafeImageUrl(profileUrl) ? (
                <img src={profileUrl} alt={profileLabel} className="max-h-full max-w-full object-contain p-1" />
              ) : (
                <span className="text-[10px] text-slate-400">No image</span>
              )}
            </div>
            <div className="min-w-0 space-y-1">
              <span className="inline-flex items-center gap-1 rounded-full border border-indigo-100 bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700">
                <School className="h-3 w-3" /> From school profile
              </span>
              {profileMissing ? (
                <p className="flex items-start gap-1 text-[11px] text-amber-700">
                  <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" />
                  {profileNote || 'Not uploaded — ask the Super Admin.'} It won&apos;t print until it is uploaded.
                </p>
              ) : (
                <p className="text-[11px] text-slate-400">Changes in the school profile show on every card automatically.</p>
              )}
            </div>
          </div>
        ) : (
        <div>
          <label className={labelClass}>Image</label>
          <select
            value={layer.assetId ? String(layer.assetId) : ''}
            onChange={(e) => {
              const asset = options.find((a) => String(a._id) === e.target.value);
              if (asset) set({ assetId: asset._id, url: asset.url });
            }}
            className={inputClass}
          >
            {!layer.assetId && <option value="">Select an image</option>}
            {currentMissing && <option value={String(layer.assetId)}>Current image (no longer available)</option>}
            {options.map((a) => (
              <option key={a._id} value={String(a._id)}>{a.name || a.type}</option>
            ))}
          </select>
          {currentMissing && (
            <p className="flex items-start gap-1 text-[11px] text-amber-700 mt-1.5">
              <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" />
              This image was removed or deactivated. Pick another one before saving.
            </p>
          )}
        </div>
        )}

        <CollapsibleSection title="Size">
        <BoxFields box={layer} cardWidth={cardWidth} cardHeight={cardHeight} unitLabel={u} onChange={setBox} />
        <button
          type="button"
          onClick={() => set({ lockAspectRatio: !locked })}
          aria-pressed={locked}
          className={`-mt-1 inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold ${
            locked ? 'border-indigo-200 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-600'
          }`}
        >
          {locked ? <Lock className="h-3.5 w-3.5" /> : <Unlock className="h-3.5 w-3.5" />}
          {locked ? 'Ratio locked' : 'Ratio free'}
        </button>
        <ImageLayerSizeControls layer={layer} cardWidth={cardWidth} cardHeight={cardHeight} onChange={set} />
        </CollapsibleSection>

        <ImageLayerFrameSection layer={layer} unit={formData.unit} onChange={set} />

        <BackgroundRemovalSection
          layer={layer}
          renderLayer={renderLayers.find((item) => String(item.id) === String(key))}
          previewLoading={previewLoading}
          onChange={set}
          onApplyToAll={onApplyImageProcessingToAll}
        />

        <CollapsibleSection title="Transform">
        <ImageLayerFlipControls layer={layer} onChange={set} />
        <SegmentRow
          label="Align on card"
          activeKey={layer.align || null}
          onPick={alignX}
          options={[
            { key: TEMPLATE_IMAGE_ALIGNS.LEFT, text: 'Left' },
            { key: TEMPLATE_IMAGE_ALIGNS.CENTER, text: 'Centre' },
            { key: TEMPLATE_IMAGE_ALIGNS.RIGHT, text: 'Right' },
          ]}
        />
        <SegmentRow
          label="Vertical"
          activeKey={null}
          onPick={alignY}
          options={[
            { key: 'TOP', text: 'Top' },
            { key: 'MIDDLE', text: 'Middle' },
            { key: 'BOTTOM', text: 'Bottom' },
          ]}
        />

        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className={labelClass}>Opacity: {Math.round(toNumber(layer.opacity, 1) * 100)}%</label>
            <input type="range" min="0" max="1" step="0.05" value={toNumber(layer.opacity, 1)} onChange={(e) => set({ opacity: Number(e.target.value) })} className="w-full accent-indigo-600" />
          </div>
          <div className="col-span-2">
            <label className={labelClass}>Rotation: {Math.round(rotation)}°</label>
            <input
              type="range"
              min={-maxRotation}
              max={maxRotation}
              step="1"
              value={rotation}
              onChange={(e) => set({ rotation: Number(e.target.value) })}
              className="w-full accent-indigo-600"
              aria-label="Rotation"
            />
          </div>
          <NumberField label="Rotation (°)" value={layer.rotation ?? 0} min={-maxRotation} max={maxRotation} step={1} onCommit={(v) => set({ rotation: v })} />
          <NumberField label="Layer order" value={layer.zIndex ?? 10} min={0} max={100} step={1} onCommit={(v) => set({ zIndex: v })} />
          {onReorderLayer && (
            <>
              <button
                type="button"
                onClick={() => onReorderLayer(key, 'BACK')}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-2 py-1.5 text-[11px] font-semibold text-slate-700 hover:bg-slate-50"
              >
                <SendToBack className="h-3.5 w-3.5" /> Send to back
              </button>
              <button
                type="button"
                onClick={() => onReorderLayer(key, 'FRONT')}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-2 py-1.5 text-[11px] font-semibold text-slate-700 hover:bg-slate-50"
              >
                <BringToFront className="h-3.5 w-3.5" /> Bring to front
              </button>
            </>
          )}
        </div>
        <p className="text-[11px] text-slate-400">Higher layer order sits on top, for example a stamp over the signature.</p>
        </CollapsibleSection>

        <ResetImageStyleButton onChange={set} />
      </Panel>
    );
  }

  /* ---------- Text field ---------- */
  // index se (ek side par kai customText ho sakte hain); purane callers sirf field name dete hain
  const fieldIndex = Number.isInteger(selectedElement.index)
    ? selectedElement.index
    : (formData.fields || []).findIndex((f) => f.field === selectedElement.id);
  const field = formData.fields?.[fieldIndex];
  if (!field) return <Panel><p className="text-xs text-slate-400">This field is no longer on the card.</p></Panel>;

  const set = (patch) => onUpdateField(fieldIndex, patch);
  const fx = toNumber(field.x);
  const fw = toNumber(field.width);
  // School profile ki value: aakhri backend preview se (sirf jab field school value hi dikha rahi ho)
  const renderedField = renderFields[fieldIndex];
  const schoolValue =
    field.valueSource !== TEMPLATE_VALUE_SOURCES.CUSTOM
    && renderedField?.field === field.field
    && typeof renderedField.displayValue === 'string'
      ? renderedField.displayValue.trim() || null
      : null;
  const families = TEMPLATE_FONT_FAMILIES.includes(field.fontFamily || 'Arial')
    ? TEMPLATE_FONT_FAMILIES
    : [field.fontFamily, ...TEMPLATE_FONT_FAMILIES];

  return (
    <Panel>
      <Header
        title={TEMPLATE_FIELD_LABELS[field.field] || field.field}
        subtitle={`var: ${field.field}`}
        visible={field.visible !== false}
        onToggleVisible={() => set({ visible: field.visible === false })}
        onRemove={() => onRemoveField(fieldIndex)}
        removeLabel={`Remove ${field.field}`}
      />

      {field.field === 'customText' && (
        <div>
          <label className={labelClass}>Text</label>
          <textarea
            rows={2}
            maxLength={300}
            value={field.customText ?? ''}
            onChange={(e) => set({ customText: e.target.value })}
            placeholder="e.g. If found, please return to the school"
            className={inputClass}
          />
          {!field.customText?.trim() && <p className="text-[11px] text-rose-500 mt-1">Type the text to print.</p>}
        </div>
      )}

      <div>
        <label className={labelClass}>Label printed before value</label>
        <input type="text" maxLength={100} value={field.label ?? ''} onChange={(e) => set({ label: e.target.value })} placeholder="Leave empty for the default" className={inputClass} />
        <label className="mt-2 inline-flex items-center gap-2 text-[11px] font-medium text-slate-600 cursor-pointer">
          <input
            type="checkbox"
            checked={field.showLabel !== false}
            onChange={(e) =>
              set(
                field.displayMode
                  ? { showLabel: e.target.checked, displayMode: modeForShowLabel(field.displayMode, e.target.checked) }
                  : { showLabel: e.target.checked }
              )
            }
            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
          />
          Show label on the card
        </label>
      </div>

      <LabelIconSection field={field} unitLabel={u} onSet={set} />

      {isSchoolValueField(field.field) && (
        <SchoolValueSection
          field={field}
          schoolValue={schoolValue}
          previewLoading={previewLoading}
          onSet={set}
        />
      )}

      <div className="grid grid-cols-2 gap-3">
        <NumberField label={`X (${u})`} value={field.x} min={0} max={cardWidth - fw} onCommit={(v) => set({ x: v })} />
        <NumberField label={`Y (${u})`} value={field.y} min={0} max={cardHeight} onCommit={(v) => set({ y: v })} />
        <NumberField label={`Box width (${u})`} value={field.width ?? ''} min={1} max={cardWidth - fx} allowEmpty placeholder="Auto" onCommit={(v) => set({ width: v })} />
        <NumberField label="Max lines" value={field.maxLines ?? 1} min={1} max={FIELD_MAX_LINES} step={1} onCommit={(v) => set({ maxLines: Math.round(v) })} />
        <NumberField label={`Font size (${fontUnit})`} value={field.fontSize ?? 12} min={FIELD_MIN_FONT_SIZE} max={FIELD_MAX_FONT_SIZE} onCommit={(v) => set({ fontSize: v })} />
        <div>
          <label className={labelClass}>Weight</label>
          <select value={field.fontWeight || TEMPLATE_FONT_WEIGHTS.NORMAL} onChange={(e) => set({ fontWeight: e.target.value })} className={inputClass}>
            <option value={TEMPLATE_FONT_WEIGHTS.NORMAL}>Normal</option>
            <option value={TEMPLATE_FONT_WEIGHTS.BOLD}>Bold</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Font</label>
          <select value={field.fontFamily || 'Arial'} onChange={(e) => set({ fontFamily: e.target.value })} className={inputClass}>
            {families.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Color</label>
          <input type="color" value={field.color || '#000000'} onChange={(e) => set({ color: e.target.value })} className="w-full h-[34px] p-0.5 border border-slate-200 rounded-xl cursor-pointer" />
        </div>
        <div className="col-span-2">
          <label className={labelClass}>Alignment</label>
          <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-xl">
            {TEMPLATE_TEXT_ALIGN_VALUES.map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => set({ textAlign: a })}
                aria-pressed={(field.textAlign || 'LEFT') === a}
                className={`py-1.5 rounded-lg text-[11px] font-semibold ${(field.textAlign || 'LEFT') === a ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600'
                  }`}
              >
                {a.charAt(0) + a.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className={labelClass}>Style</label>
          <div className="flex gap-1.5">
            <ToggleChip
              active={field.fontStyle === TEMPLATE_FONT_STYLES.ITALIC}
              onClick={() => set({ fontStyle: field.fontStyle === TEMPLATE_FONT_STYLES.ITALIC ? TEMPLATE_FONT_STYLES.NORMAL : TEMPLATE_FONT_STYLES.ITALIC })}
            >
              <span className="italic">Italic</span>
            </ToggleChip>
            <ToggleChip
              active={field.textTransform === TEMPLATE_TEXT_TRANSFORMS.UPPERCASE}
              onClick={() => set({ textTransform: field.textTransform === TEMPLATE_TEXT_TRANSFORMS.UPPERCASE ? TEMPLATE_TEXT_TRANSFORMS.NONE : TEMPLATE_TEXT_TRANSFORMS.UPPERCASE })}
            >
              UPPERCASE
            </ToggleChip>
          </div>
        </div>
        <NumberField label={`Letter spacing (${fontUnit})`} value={field.letterSpacing ?? 0} min={0} max={20} step={0.1} onCommit={(v) => set({ letterSpacing: v })} />
        <NumberField label="Line height" value={field.lineHeight ?? 1.2} min={0.8} max={3} step={0.1} onCommit={(v) => set({ lineHeight: v })} />
        <div className="col-span-2">
          <ColorField
            label="Label color"
            value={field.labelColor || ''}
            fallback={field.color || '#000000'}
            onChange={(v) => set({ labelColor: v })}
            onClear={() => set({ labelColor: null })}
          />
        </div>
      </div>
      {!field.width && (
        <p className="text-[11px] text-slate-400">Set a box width to wrap long values and use alignment or max lines.</p>
      )}
      <TextBoxSection field={field} cardWidth={cardWidth} unitLabel={u} onSet={set} />
    </Panel>
  );
};

export default PropertiesPanel;