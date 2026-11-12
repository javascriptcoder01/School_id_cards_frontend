// LayerEditor.jsx — chune hue layer ki settings (type ke hisaab se). Compact, 390px par bhi chalta hai.
// Sab values normalised 0..1 → yahan % mein dikhti hain.
import React, { useMemo } from 'react';
import { Lock, Plus, Trash2, PenLine } from 'lucide-react';
import { CollapsibleSection, SegmentedField, SliderField, SwitchField } from '../designerControls.jsx';
import {
  THEME_BLEND_MODE_LABELS,
  THEME_BLEND_MODE_VALUES,
  THEME_CURVE_FILL_TO_LABELS,
  THEME_CURVE_FILL_TO_VALUES,
  THEME_LAYER_LIMITS,
  THEME_LAYER_TYPES,
  THEME_PATTERN_LABELS,
  THEME_PATTERN_TYPE_VALUES,
  THEME_SHAPE_LABELS,
  THEME_SHAPE_TYPE_VALUES,
} from '../../../../constants/themeBuilder.js';
import LayerColorPicker from './LayerColorPicker.jsx';
import { AngleDial, GradientStopsEditor } from './GradientControls.jsx';
import { CHECKER_STYLE, labelClass, layersPreviewUrl, smallButtonClass } from './builderShared.js';

const LIMITS = THEME_LAYER_LIMITS;

// Normalised value ka % slider
const PercentSlider = ({ label, value, fallback, min = 0, max = 100, step = 1, disabled, onChange }) => (
  <SliderField
    label={label}
    value={Math.round((value ?? fallback) * 100 * 10) / 10}
    min={min}
    max={max}
    step={step}
    suffix="%"
    disabled={disabled}
    onChange={(v) => onChange(Math.round(v * 10) / 1000)}
  />
);

const defaultStops = (color) => [
  { color: color ? { ...color } : { role: 'primary' }, at: 0 },
  { color: { role: 'secondary' }, at: 1 },
];

// Shape / pattern grid: har option ka chhota preview (shared renderer)
const PreviewGrid = ({ options, labels, value, makeLayer, roles, disabled, onPick, columns = 'grid-cols-4' }) => {
  const previews = useMemo(
    () => Object.fromEntries(options.map((key) => [key, layersPreviewUrl([makeLayer(key)], roles, 48, 32)])),
    [options, makeLayer, roles]
  );
  return (
    <div className={`grid ${columns} gap-1`}>
      {options.map((key) => (
        <button
          key={key}
          type="button"
          disabled={disabled}
          onClick={() => onPick(key)}
          aria-pressed={value === key}
          title={labels[key]}
          className={`flex flex-col items-center gap-0.5 rounded-lg border p-1 text-[9px] font-semibold disabled:opacity-40 ${value === key ? 'border-indigo-400 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
        >
          <span className="block h-7 w-full overflow-hidden rounded bg-white" style={CHECKER_STYLE}>
            {previews[key] && <img src={previews[key]} alt="" className="h-full w-full" />}
          </span>
          <span className="w-full truncate">{labels[key]}</span>
        </button>
      ))}
    </div>
  );
};

const shapePreviewLayer = (shape) => ({
  id: 'p',
  type: 'SHAPE',
  shape,
  color: { role: 'primary' },
  x: 0.1,
  y: 0.12,
  w: 0.8,
  h: 0.76,
  amplitude: 0.45,
  frequency: 1.5,
  thickness: 0.45,
});
const patternPreviewLayer = (pattern) => ({ id: 'p', type: 'PATTERN', pattern, color: { role: 'primary' }, size: 0.25, strokeWidth: 0.03 });

// Solid colour ya gradient (shape / curve fill)
const FillEditor = ({ layer, roles, disabled, onPatch, allowNone = false }) => {
  const mode = layer.stops?.length ? 'GRADIENT' : layer.color ? 'COLOR' : 'NONE';
  const options = [
    { key: 'COLOR', text: 'Colour' },
    { key: 'GRADIENT', text: 'Gradient' },
    ...(allowNone ? [{ key: 'NONE', text: 'No fill' }] : []),
  ];
  const setMode = (next) => {
    if (next === mode) return;
    if (next === 'COLOR') onPatch({ color: layer.stops?.[0]?.color || { role: 'primary' }, stops: undefined });
    else if (next === 'GRADIENT') onPatch({ stops: defaultStops(layer.color), color: undefined });
    // Curve: fill nahi to stroke zaroori (backend rule)
    else onPatch({ color: undefined, stops: undefined, ...(layer.strokeColor ? {} : { strokeColor: { role: 'primary' }, strokeWidth: 0.006 }) });
  };
  return (
    <div className="space-y-2">
      <SegmentedField label="Fill" options={options} value={mode} onChange={setMode} />
      {mode === 'COLOR' && <LayerColorPicker label="Fill colour" value={layer.color} roles={roles} disabled={disabled} onChange={(color) => onPatch({ color })} />}
      {mode === 'GRADIENT' && <GradientStopsEditor stops={layer.stops} roles={roles} disabled={disabled} onChange={(stops) => onPatch({ stops })} />}
    </div>
  );
};

/* ---------------- per type ---------------- */

const SolidEditor = ({ layer, roles, disabled, onPatch }) => (
  <LayerColorPicker label="Colour" value={layer.color} roles={roles} disabled={disabled} onChange={(color) => onPatch({ color })} />
);

const LinearEditor = ({ layer, roles, disabled, onPatch }) => (
  <div className="space-y-3">
    <GradientStopsEditor stops={layer.stops} roles={roles} disabled={disabled} onChange={(stops) => onPatch({ stops })} />
    <AngleDial value={layer.angle ?? 90} disabled={disabled} onChange={(angle) => onPatch({ angle })} />
  </div>
);

const RadialEditor = ({ layer, roles, disabled, onPatch }) => (
  <div className="space-y-3">
    <GradientStopsEditor stops={layer.stops} roles={roles} disabled={disabled} onChange={(stops) => onPatch({ stops })} />
    <div className="grid grid-cols-2 gap-2">
      <PercentSlider label="Centre X" value={layer.center?.x} fallback={0.5} disabled={disabled} onChange={(x) => onPatch({ center: { ...(layer.center || { y: 0.5 }), x } })} />
      <PercentSlider label="Centre Y" value={layer.center?.y} fallback={0.5} disabled={disabled} onChange={(y) => onPatch({ center: { ...(layer.center || { x: 0.5 }), y } })} />
    </div>
    <PercentSlider label="Radius" value={layer.radius} fallback={0.5} min={0} max={LIMITS.RADIUS_MAX * 100} disabled={disabled} onChange={(radius) => onPatch({ radius })} />
  </div>
);

const MeshEditor = ({ layer, roles, disabled, onPatch }) => {
  const points = layer.points || [];
  const setPoint = (i, patch) => onPatch({ points: points.map((p, j) => (j === i ? { ...p, ...patch } : p)) });
  return (
    <div className="space-y-3">
      {points.map((point, i) => (
        <div key={i} className="space-y-2 rounded-xl bg-slate-50 p-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-600">Colour point {i + 1}</span>
            <button
              type="button"
              className={smallButtonClass}
              disabled={disabled || points.length <= LIMITS.MIN_MESH_POINTS}
              onClick={() => onPatch({ points: points.filter((_, j) => j !== i) })}
              aria-label={`Remove colour point ${i + 1}`}
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
          <LayerColorPicker label="Colour" value={point.color} roles={roles} disabled={disabled} onChange={(color) => setPoint(i, { color })} />
          <div className="grid grid-cols-2 gap-2">
            <PercentSlider label="X" value={point.x} fallback={0.5} disabled={disabled} onChange={(x) => setPoint(i, { x })} />
            <PercentSlider label="Y" value={point.y} fallback={0.5} disabled={disabled} onChange={(y) => setPoint(i, { y })} />
          </div>
        </div>
      ))}
      <button
        type="button"
        className={smallButtonClass}
        disabled={disabled || points.length >= LIMITS.MAX_MESH_POINTS}
        onClick={() => onPatch({ points: [...points, { x: 0.5, y: 0.5, color: { role: 'accent', alpha: 0.4 } }] })}
      >
        <Plus className="h-3 w-3" /> Colour point
      </button>
      <PercentSlider label="Softness" value={layer.softness} fallback={0.6} disabled={disabled} onChange={(softness) => onPatch({ softness })} />
    </div>
  );
};

const PatternEditor = ({ layer, roles, disabled, onPatch }) => {
  const area = layer.area || { x: 0, y: 0, w: 1, h: 1 };
  const setArea = (patch) => onPatch({ area: { ...area, ...patch } });
  return (
    <div className="space-y-3">
      <PreviewGrid
        options={THEME_PATTERN_TYPE_VALUES}
        labels={THEME_PATTERN_LABELS}
        value={layer.pattern}
        makeLayer={patternPreviewLayer}
        roles={roles}
        disabled={disabled}
        columns="grid-cols-5"
        onPick={(pattern) => onPatch({ pattern })}
      />
      <LayerColorPicker label="Pattern colour" value={layer.color} roles={roles} disabled={disabled} onChange={(color) => onPatch({ color })} />
      <PercentSlider label="Size" value={layer.size} fallback={0.05} min={LIMITS.PATTERN_SIZE_MIN * 100} max={LIMITS.PATTERN_SIZE_MAX * 100} step={0.5} disabled={disabled} onChange={(size) => onPatch({ size })} />
      <PercentSlider label="Line width" value={layer.strokeWidth} fallback={0.004} min={0} max={LIMITS.STROKE_WIDTH_MAX * 100} step={0.1} disabled={disabled} onChange={(strokeWidth) => onPatch({ strokeWidth })} />
      <SliderField label="Rotation" value={layer.rotation ?? 0} min={0} max={360} suffix="°" disabled={disabled} onChange={(rotation) => onPatch({ rotation })} />
      <CollapsibleSection title="Pattern area" defaultOpen={false}>
        <div className="grid grid-cols-2 gap-2">
          <PercentSlider label="Left" value={area.x} fallback={0} disabled={disabled} onChange={(x) => setArea({ x })} />
          <PercentSlider label="Top" value={area.y} fallback={0} disabled={disabled} onChange={(y) => setArea({ y })} />
          <PercentSlider label="Width" value={area.w} fallback={1} disabled={disabled} onChange={(w) => setArea({ w })} />
          <PercentSlider label="Height" value={area.h} fallback={1} disabled={disabled} onChange={(h) => setArea({ h })} />
        </div>
      </CollapsibleSection>
    </div>
  );
};

const ShapeEditor = ({ layer, roles, disabled, onPatch, onEditOnCard }) => (
  <div className="space-y-3">
    {onEditOnCard && (
      <button type="button" className={`${smallButtonClass} w-full py-1.5`} disabled={disabled} onClick={onEditOnCard}>
        <PenLine className="h-3 w-3" /> Move / resize on card
      </button>
    )}
    <PreviewGrid
      options={THEME_SHAPE_TYPE_VALUES}
      labels={THEME_SHAPE_LABELS}
      value={layer.shape}
      makeLayer={shapePreviewLayer}
      roles={roles}
      disabled={disabled}
      onPick={(shape) => onPatch({ shape })}
    />
    <FillEditor layer={layer} roles={roles} disabled={disabled} onPatch={onPatch} />
    <CollapsibleSection title="Position & size">
      <div className="grid grid-cols-2 gap-2">
        <PercentSlider label="Left" value={layer.x} fallback={0} min={LIMITS.POSITION_MIN * 100} max={LIMITS.POSITION_MAX * 100} disabled={disabled} onChange={(x) => onPatch({ x })} />
        <PercentSlider label="Top" value={layer.y} fallback={0} min={LIMITS.POSITION_MIN * 100} max={LIMITS.POSITION_MAX * 100} disabled={disabled} onChange={(y) => onPatch({ y })} />
        <PercentSlider label="Width" value={layer.w} fallback={1} min={0} max={LIMITS.SIZE_MAX * 100} disabled={disabled} onChange={(w) => onPatch({ w })} />
        <PercentSlider label="Height" value={layer.h} fallback={1} min={0} max={LIMITS.SIZE_MAX * 100} disabled={disabled} onChange={(h) => onPatch({ h })} />
      </div>
      <SliderField label="Rotation" value={layer.rotation ?? 0} min={0} max={360} suffix="°" disabled={disabled} onChange={(rotation) => onPatch({ rotation })} />
      <div className="grid grid-cols-2 gap-3">
        <SwitchField label="Flip X" checked={layer.flipX === true} disabled={disabled} onChange={(flipX) => onPatch({ flipX })} />
        <SwitchField label="Flip Y" checked={layer.flipY === true} disabled={disabled} onChange={(flipY) => onPatch({ flipY })} />
      </div>
    </CollapsibleSection>
    <CollapsibleSection title="Curve">
      <PercentSlider label="Amplitude" value={layer.amplitude} fallback={0.3} disabled={disabled} onChange={(amplitude) => onPatch({ amplitude })} />
      <SliderField
        label="Frequency"
        value={layer.frequency ?? 1}
        min={LIMITS.FREQUENCY_MIN}
        max={LIMITS.FREQUENCY_MAX}
        step={0.5}
        disabled={disabled}
        onChange={(frequency) => onPatch({ frequency })}
      />
      <PercentSlider label="Thickness" value={layer.thickness} fallback={0.3} disabled={disabled} onChange={(thickness) => onPatch({ thickness })} />
    </CollapsibleSection>
  </div>
);

const CurveEditor = ({ layer, roles, disabled, onPatch, onEditOnCard }) => {
  const path = layer.path || { points: [], closed: false, fillTo: 'NONE' };
  const setPath = (patch) => onPatch({ path: { ...path, ...patch } });
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2 rounded-xl bg-slate-50 px-2.5 py-2">
        <span className="text-[11px] font-semibold text-slate-600">{path.points?.length || 0} points</span>
        {onEditOnCard && (
          <button type="button" className={smallButtonClass} disabled={disabled} onClick={onEditOnCard}>
            <PenLine className="h-3 w-3" /> Edit on card
          </button>
        )}
      </div>
      <SwitchField label="Close shape" checked={path.closed === true} disabled={disabled} onChange={(closed) => setPath({ closed })} />
      {!path.closed && (
        <div>
          <span className={labelClass}>Fill to edge</span>
          <div className="flex flex-wrap gap-1">
            {THEME_CURVE_FILL_TO_VALUES.map((key) => (
              <button
                key={key}
                type="button"
                disabled={disabled}
                onClick={() => setPath({ fillTo: key })}
                aria-pressed={(path.fillTo || 'NONE') === key}
                className={`rounded-lg border px-2 py-1 text-[11px] font-semibold disabled:opacity-40 ${(path.fillTo || 'NONE') === key ? 'border-indigo-400 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-600'}`}
              >
                {THEME_CURVE_FILL_TO_LABELS[key]}
              </button>
            ))}
          </div>
        </div>
      )}
      <FillEditor layer={layer} roles={roles} disabled={disabled} onPatch={onPatch} allowNone />
      <CollapsibleSection title="Line" defaultOpen={Boolean(layer.strokeColor)}>
        <LayerColorPicker
          label="Line colour"
          value={layer.strokeColor || null}
          roles={roles}
          disabled={disabled}
          onChange={(strokeColor) => onPatch({ strokeColor, ...(layer.strokeWidth ? {} : { strokeWidth: 0.006 }) })}
        />
        <PercentSlider label="Line width" value={layer.strokeWidth} fallback={0} min={0} max={LIMITS.STROKE_WIDTH_MAX * 100} step={0.1} disabled={disabled} onChange={(strokeWidth) => onPatch({ strokeWidth })} />
      </CollapsibleSection>
    </div>
  );
};

// Super Admin artwork: kaun si, fit, har colour slot (role chips pehle)
const ArtworkEditor = ({ layer, roles, disabled, onPatch, artworks = [] }) => {
  const artwork = artworks.find((a) => a.id === layer.artworkId) || null;
  const slotColors = layer.slotColors || {};
  const setSlot = (name, color) => {
    const next = { ...slotColors };
    if (color) next[name] = color;
    else delete next[name];
    onPatch({ slotColors: next });
  };
  return (
    <div className="space-y-3">
      <div>
        <label className={labelClass} htmlFor={`artwork-${layer.id}`}>Artwork</label>
        <select
          id={`artwork-${layer.id}`}
          value={layer.artworkId || ''}
          disabled={disabled}
          onChange={(e) => onPatch({ artworkId: e.target.value, slotColors: {} })}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 disabled:opacity-40"
        >
          {!artwork && <option value={layer.artworkId || ''}>Not available any more</option>}
          {artworks.map((a) => (
            <option key={a.id} value={a.id}>{a.name}</option>
          ))}
        </select>
        {!artwork && (
          <p className="mt-1 text-[10px] text-amber-700">This artwork was removed or turned off, so the card skips this layer.</p>
        )}
      </div>
      <SegmentedField
        label="Fit"
        options={[{ key: 'COVER', text: 'Cover card' }, { key: 'CONTAIN', text: 'Fit inside' }]}
        value={layer.fit || 'COVER'}
        onChange={(fit) => onPatch({ fit })}
      />
      {artwork?.slots?.length > 0 && (
        <CollapsibleSection title={`Colours (${artwork.slots.length})`}>
          {artwork.slots.map((slot) => {
            const custom = slotColors[slot.name];
            const shown = custom || (slot.defaultRole ? { role: slot.defaultRole } : { hex: slot.defaultHex || '#000000' });
            return (
              <div key={slot.name} className="space-y-1 rounded-xl bg-slate-50 p-2">
                <LayerColorPicker
                  label={slot.name}
                  value={shown}
                  roles={roles}
                  disabled={disabled}
                  showAlpha={false}
                  onChange={(color) => setSlot(slot.name, color)}
                />
                {custom && (
                  <button type="button" className={smallButtonClass} disabled={disabled} onClick={() => setSlot(slot.name, null)}>
                    Reset to artwork default
                  </button>
                )}
              </div>
            );
          })}
        </CollapsibleSection>
      )}
    </div>
  );
};

const EDITORS = {
  [THEME_LAYER_TYPES.SOLID]: SolidEditor,
  [THEME_LAYER_TYPES.LINEAR_GRADIENT]: LinearEditor,
  [THEME_LAYER_TYPES.RADIAL_GRADIENT]: RadialEditor,
  [THEME_LAYER_TYPES.MESH_GRADIENT]: MeshEditor,
  [THEME_LAYER_TYPES.PATTERN]: PatternEditor,
  [THEME_LAYER_TYPES.SHAPE]: ShapeEditor,
  [THEME_LAYER_TYPES.CURVE]: CurveEditor,
  [THEME_LAYER_TYPES.ARTWORK]: ArtworkEditor,
};

/**
 * @param {object} props
 * @param {object} props.layer
 * @param {object} props.roles
 * @param {(patch: object) => void} props.onPatch
 * @param {() => void} [props.onEditOnCard] - curve / shape ko card par edit (Module 6)
 * @param {object[]} [props.artworks] - catalog ki active artworks (ARTWORK layer)
 */
export const LayerEditor = ({ layer, roles, onPatch, onEditOnCard = null, artworks = [] }) => {
  const Editor = EDITORS[layer.type];
  const disabled = layer.locked === true;
  return (
    <div className="space-y-3">
      {disabled && (
        <p className="flex items-center gap-1.5 rounded-lg bg-amber-50 px-2.5 py-1.5 text-[11px] font-semibold text-amber-700">
          <Lock className="h-3 w-3" /> This layer is locked. Unlock it in the list to edit.
        </p>
      )}
      {Editor ? (
        <Editor layer={layer} roles={roles} disabled={disabled} onPatch={onPatch} onEditOnCard={onEditOnCard} artworks={artworks} />
      ) : (
        <p className="text-[11px] text-slate-500">This layer type can’t be edited yet.</p>
      )}
      <div className="space-y-2 border-t border-slate-100 pt-3">
        <PercentSlider label="Layer opacity" value={layer.opacity} fallback={1} disabled={disabled} onChange={(opacity) => onPatch({ opacity })} />
        <div>
          <label className={labelClass} htmlFor={`blend-${layer.id}`}>Blend mode</label>
          <select
            id={`blend-${layer.id}`}
            value={layer.blendMode || 'NORMAL'}
            disabled={disabled}
            onChange={(e) => onPatch({ blendMode: e.target.value })}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 disabled:opacity-40"
          >
            {THEME_BLEND_MODE_VALUES.map((mode) => (
              <option key={mode} value={mode}>{THEME_BLEND_MODE_LABELS[mode]}</option>
            ))}
          </select>
          {(layer.blendMode || 'NORMAL') !== 'NORMAL' && (
            <p className="mt-1 text-[10px] text-amber-700">Printers can’t reproduce blend modes, so the card and PDF draw this layer normally.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default LayerEditor;
