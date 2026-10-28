import React, { useEffect, useState } from 'react';
import { Sliders, Trash2, Eye, EyeOff, AlertTriangle } from 'lucide-react';
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
} from '../../../constants/template.js';
import { clamp, round2, toNumber, getLayerKey } from '../../../utils/templateLayout.js';

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

export const PropertiesPanel = ({
  selectedElement,
  formData,
  usableAssets = [],
  onUpdateField,
  onRemoveField,
  onUpdatePhoto,
  onUpdateQrCode,
  onUpdateLayer,
  onRemoveLayer,
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
      </Panel>
    );
  }

  /* ---------- Image layer ---------- */
  if (selectedElement.type === DESIGNER_ELEMENT_TYPES.LAYER) {
    const layer = (formData.imageLayers || []).find((l) => getLayerKey(l) === selectedElement.id);
    if (!layer) return <Panel><p className="text-xs text-slate-400">This image is no longer on the card.</p></Panel>;

    const key = getLayerKey(layer);
    const set = (patch) => onUpdateLayer(key, patch);
    const assetType = TEMPLATE_IMAGE_LAYER_ASSET_TYPE[layer.type];
    const options = usableAssets.filter((a) => !assetType || a.type === assetType);
    const currentMissing = layer.assetId && !options.some((a) => String(a._id) === String(layer.assetId));

    return (
      <Panel>
        <Header
          title={TEMPLATE_IMAGE_LAYER_LABELS[layer.type]}
          subtitle="Image from the college's uploaded assets"
          visible={layer.visible !== false}
          onToggleVisible={() => set({ visible: layer.visible === false })}
          onRemove={() => onRemoveLayer(key)}
          removeLabel="Remove image from card"
        />

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

        <BoxFields box={layer} cardWidth={cardWidth} cardHeight={cardHeight} unitLabel={u} onChange={set} />

        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className={labelClass}>Opacity: {Math.round(toNumber(layer.opacity, 1) * 100)}%</label>
            <input type="range" min="0" max="1" step="0.05" value={toNumber(layer.opacity, 1)} onChange={(e) => set({ opacity: Number(e.target.value) })} className="w-full accent-indigo-600" />
          </div>
          <NumberField label="Rotation (°)" value={layer.rotation ?? 0} min={-180} max={180} step={1} onCommit={(v) => set({ rotation: v })} />
          <NumberField label="Layer order" value={layer.zIndex ?? 10} min={0} max={100} step={1} onCommit={(v) => set({ zIndex: v })} />
        </div>
        <p className="text-[11px] text-slate-400">Higher layer order sits on top, for example a stamp over the signature.</p>
      </Panel>
    );
  }

  /* ---------- Text field ---------- */
  const fieldIndex = (formData.fields || []).findIndex((f) => f.field === selectedElement.id);
  const field = formData.fields?.[fieldIndex];
  if (!field) return <Panel><p className="text-xs text-slate-400">This field is no longer on the card.</p></Panel>;

  const set = (patch) => onUpdateField(fieldIndex, patch);
  const fx = toNumber(field.x);
  const fw = toNumber(field.width);
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

      <div>
        <label className={labelClass}>Label printed before value</label>
        <input type="text" maxLength={100} value={field.label ?? ''} onChange={(e) => set({ label: e.target.value })} placeholder="Leave empty to print only the value" className={inputClass} />
      </div>

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
      {!field.width && (
        <p className="text-[11px] text-slate-400">Set a box width to wrap long values and use alignment or max lines.</p>
      )}
    </Panel>
  );
};

export default PropertiesPanel;