// GradientControls.jsx — gradient stop bar (stops drag / add / remove) + angle dial. Pointer events → mouse + touch dono.
import React, { useRef, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { SliderField } from '../designerControls.jsx';
import { THEME_LAYER_LIMITS } from '../../../../constants/themeBuilder.js';
import LayerColorPicker from './LayerColorPicker.jsx';
import { CHECKER_STYLE, clamp, cssColor, labelClass, smallButtonClass } from './builderShared.js';

const round2 = (value) => Math.round(value * 100) / 100;

/**
 * @param {object} props
 * @param {Array<{ color: object, at: number }>} props.stops
 * @param {object} props.roles
 * @param {(stops: object[]) => void} props.onChange
 * @param {boolean} [props.disabled]
 */
export const GradientStopsEditor = ({ stops = [], roles, onChange, disabled = false }) => {
  const [selected, setSelected] = useState(0);
  const barRef = useRef(null);
  const index = clamp(selected, 0, Math.max(0, stops.length - 1));
  const current = stops[index];

  const sorted = [...stops].sort((a, b) => a.at - b.at);
  const gradientCss = `linear-gradient(90deg, ${sorted.map((s) => `${cssColor(s.color, roles)} ${Math.round(s.at * 100)}%`).join(', ')})`;

  const positionOf = (event) => {
    const rect = barRef.current.getBoundingClientRect();
    return round2(clamp((event.clientX - rect.left) / rect.width, 0, 1));
  };
  const update = (i, patch) => onChange(stops.map((s, j) => (j === i ? { ...s, ...patch } : s)));
  const canAdd = stops.length < THEME_LAYER_LIMITS.MAX_GRADIENT_STOPS;
  const canRemove = stops.length > THEME_LAYER_LIMITS.MIN_GRADIENT_STOPS;

  const addAt = (at) => {
    if (!canAdd || disabled) return;
    onChange([...stops, { color: { ...(current?.color || { role: 'primary' }) }, at }]);
    setSelected(stops.length);
  };

  return (
    <div className="space-y-2">
      <span className={labelClass}>Colour stops (tap the bar to add)</span>
      <div className="relative px-2 pb-3">
        <div
          ref={barRef}
          role="presentation"
          onClick={(e) => addAt(positionOf(e))}
          className="h-6 cursor-copy rounded-lg ring-1 ring-slate-200"
          style={{ ...CHECKER_STYLE, backgroundImage: `${gradientCss}, ${CHECKER_STYLE.backgroundImage}`, backgroundSize: `100% 100%, ${CHECKER_STYLE.backgroundSize}` }}
        />
        {stops.map((stop, i) => (
          <button
            key={i}
            type="button"
            disabled={disabled}
            aria-label={`Colour stop ${i + 1} at ${Math.round(stop.at * 100)}%`}
            aria-pressed={i === index}
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => {
              e.stopPropagation();
              setSelected(i);
              e.currentTarget.setPointerCapture(e.pointerId);
            }}
            onPointerMove={(e) => {
              if (e.currentTarget.hasPointerCapture(e.pointerId)) update(i, { at: positionOf(e) });
            }}
            className={`absolute top-4 h-4 w-4 -translate-x-1/2 touch-none rounded-full border-2 shadow-sm ${i === index ? 'border-indigo-600 ring-2 ring-indigo-200' : 'border-white'}`}
            style={{ left: `calc(${stop.at * 100}% + ${8 - stop.at * 16}px)`, backgroundColor: cssColor({ ...stop.color, alpha: 1 }, roles) }}
          />
        ))}
      </div>
      <div className="flex gap-1.5">
        <button type="button" className={smallButtonClass} disabled={!canAdd || disabled} onClick={() => addAt(0.5)}>
          <Plus className="h-3 w-3" /> Stop
        </button>
        <button
          type="button"
          className={smallButtonClass}
          disabled={!canRemove || disabled}
          onClick={() => {
            onChange(stops.filter((_, j) => j !== index));
            setSelected(0);
          }}
        >
          <Trash2 className="h-3 w-3" /> Remove stop
        </button>
      </div>
      {current && (
        <div className="space-y-2 rounded-xl bg-slate-50 p-2">
          <LayerColorPicker
            label={`Stop ${index + 1} colour`}
            value={current.color}
            roles={roles}
            disabled={disabled}
            onChange={(color) => update(index, { color })}
          />
          <SliderField
            label="Position"
            value={Math.round(current.at * 100)}
            min={0}
            max={100}
            suffix="%"
            disabled={disabled}
            onChange={(v) => update(index, { at: v / 100 })}
          />
        </div>
      )}
    </div>
  );
};

/**
 * Angle dial: 0° = left → right, 90° = top → bottom (renderer jaisa)
 * @param {{ value: number, onChange: (deg: number) => void, disabled?: boolean }} props
 */
export const AngleDial = ({ value = 90, onChange, disabled = false }) => {
  const setFromEvent = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const deg = (Math.atan2(event.clientY - (rect.top + rect.height / 2), event.clientX - (rect.left + rect.width / 2)) * 180) / Math.PI;
    onChange(Math.round((deg + 360) % 360));
  };
  const rad = (value * Math.PI) / 180;
  return (
    <div className="flex items-center gap-3">
      <svg
        viewBox="-20 -20 40 40"
        className={`h-11 w-11 shrink-0 touch-none ${disabled ? 'opacity-40' : 'cursor-pointer'}`}
        role="slider"
        aria-label="Gradient angle"
        aria-valuemin={0}
        aria-valuemax={360}
        aria-valuenow={value}
        onPointerDown={(e) => {
          if (disabled) return;
          e.currentTarget.setPointerCapture(e.pointerId);
          setFromEvent(e);
        }}
        onPointerMove={(e) => {
          if (!disabled && e.currentTarget.hasPointerCapture(e.pointerId)) setFromEvent(e);
        }}
      >
        <circle r="18" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1.5" />
        <line x1="0" y1="0" x2={Math.cos(rad) * 13} y2={Math.sin(rad) * 13} stroke="#4F46E5" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx={Math.cos(rad) * 13} cy={Math.sin(rad) * 13} r="3.5" fill="#4F46E5" />
      </svg>
      <div className="min-w-0 flex-1">
        <SliderField label="Angle" value={Math.round(value)} min={0} max={360} suffix="°" disabled={disabled} onChange={onChange} />
      </div>
    </div>
  );
};

export default GradientStopsEditor;
